import React, { createContext, useContext, useEffect, useRef, ErrorInfo } from 'react';
import { useAuth } from 'react-oidc-context';
import { useLocation, useNavigationType } from 'react-router-dom';
import { analytics } from './index';
import { AnalyticsService } from './types';
import { AnalyticsEventName } from './constants';

const AnalyticsContext = createContext<AnalyticsService | null>(null);

interface AnalyticsErrorBoundaryState {
  hasError: boolean;
}

class AnalyticsErrorBoundary extends React.Component<{ children: React.ReactNode }, AnalyticsErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    analytics.trackEvent('ERROR_OCCURRED', {
      error_type: 'react_error',
      error_message: error.message,
      error_stack: error.stack,
      component_stack: errorInfo.componentStack
    });
  }

  render() {
    if (this.state.hasError) {
      return null; // Silently handle analytics errors
    }
    return this.props.children;
  }
}

interface UserProfile {
  sub: string;
  email?: string;
  name?: string;
  role?: string;
}

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const auth = useAuth();
  const location = useLocation();
  const navigationType = useNavigationType();
  const previousPath = useRef<string | undefined>();

  // Initialize analytics only after authentication
  useEffect(() => {
    if (auth.isAuthenticated && auth.user) {
      const profile = auth.user.profile as UserProfile;
      // Initialize and identify in one step to prevent device ID generation
      analytics.initializeAndIdentify(profile.sub, {
        email: profile.email,
        name: profile.name,
        role: profile.role || 'user'
      });
    }
  }, [auth.isAuthenticated, auth.user]);

  // Automatic page view tracking
  useEffect(() => {
    const trackPage = () => {
      try {
        analytics.trackPageView({
          path: location.pathname,
          title: document.title,
          referrer: document.referrer,
          previousPath: previousPath.current,
        });
        previousPath.current = location.pathname;
      } catch (error) {
        console.error('Failed to track page view:', error);
        analytics.trackEvent('ERROR_OCCURRED', {
          error_type: 'analytics_error',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          page_path: location.pathname,
        });
      }
    };

    // Only track on actual navigation (not on initial render with "POP")
    if (navigationType !== 'POP' || !previousPath.current) {
      trackPage();
    }
  }, [location, navigationType]);

  // Process offline events when coming back online
  useEffect(() => {
    const handleOnline = () => {
      analytics.processOfflineEvents?.();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  return (
    <AnalyticsContext.Provider value={analytics}>
      <AnalyticsErrorBoundary>
        {children}
      </AnalyticsErrorBoundary>
    </AnalyticsContext.Provider>
  );
};

// Custom hook to use analytics
export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

// Utility hooks for common tracking patterns
export const useTrackEvent = (eventName: AnalyticsEventName) => {
  const analytics = useAnalytics();
  
  return React.useCallback(
    (properties?: Record<string, any>) => {
      analytics.trackEvent(eventName, properties);
    },
    [analytics, eventName]
  );
};

export const useTrackFormSubmit = (formName: string) => {
  const analytics = useAnalytics();
  
  return React.useCallback(
    (data: Record<string, any>) => {
      analytics.trackEvent('FORM_SUBMIT', {
        form_name: formName,
        ...data
      });
    },
    [analytics, formName]
  );
};

export const usePageTracking = () => {
  const analytics = useAnalytics();
  
  return React.useCallback(
    (path: string, title?: string) => {
      analytics.trackPageView({
        path,
        title: title || document.title
      });
    },
    [analytics]
  );
};

// Error boundary wrapper
export const withAnalytics = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  return function WithAnalyticsWrapper(props: P) {
    return (
      <AnalyticsErrorBoundary>
        <WrappedComponent {...props} />
      </AnalyticsErrorBoundary>
    );
  };
};
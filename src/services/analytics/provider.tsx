import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { analytics } from './index';
import { AnalyticsService } from './types';

const AnalyticsContext = createContext<AnalyticsService | null>(null);

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const auth = useAuth();

  useEffect(() => {
    // Identify user when auth state changes
    if (auth.user) {
      analytics.identify(auth.user.profile.sub, {
        email: auth.user.profile.email,
        name: auth.user.profile.name,
        // Add other relevant user properties as needed
      });
    }
  }, [auth.user]);

  return (
    <AnalyticsContext.Provider value={analytics}>
      {children}
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
export const useTrackEvent = (eventName: string) => {
  const analytics = useAnalytics();
  
  return React.useCallback(
    (properties?: Record<string, any>) => {
      analytics.trackEvent(eventName, properties);
    },
    [analytics, eventName]
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
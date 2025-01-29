import mixpanel from 'mixpanel-browser';
import { AnalyticsService, AnalyticsUser, PageViewProperties } from './types';
import { ANALYTICS_CONFIG } from './config';
import { ANALYTICS_EVENTS, AnalyticsEventName, CommonEventProperties } from './constants';

export class MixpanelAnalytics implements AnalyticsService {
  private initialized: boolean = false;

  constructor() {
    if (ANALYTICS_CONFIG.enabled) {
      this.initialize();
    }
  }

  private initialize(): void {
    if (this.initialized) return;

    try {
      mixpanel.init(ANALYTICS_CONFIG.token, {
        debug: ANALYTICS_CONFIG.debug,
        persistence: 'localStorage',
        ignore_dnt: false // Respect Do Not Track settings
      });
      
      this.initialized = true;
      
      if (ANALYTICS_CONFIG.debug) {
        console.log('Mixpanel analytics initialized');
      }
    } catch (error) {
      console.error('Failed to initialize Mixpanel:', error);
      this.initialized = false;
    }
  }

  identify(userId: string, userProperties?: Partial<AnalyticsUser>): void {
    if (!this.initialized) return;

    try {
      mixpanel.identify(userId);
      
      if (userProperties) {
        mixpanel.people.set({
          $email: userProperties.email,
          $name: userProperties.name,
          role: userProperties.role,
          lastUpdated: new Date().toISOString()
        });
      }

      if (ANALYTICS_CONFIG.debug) {
        console.log('User identified:', { userId, properties: userProperties });
      }
    } catch (error) {
      console.error('Failed to identify user:', error);
    }
  }

  trackPageView(properties: PageViewProperties): void {
    if (!this.initialized) return;

    try {
      const eventProperties = {
        ...ANALYTICS_CONFIG.defaultProperties,
        ...properties,
        timestamp: new Date().toISOString()
      };

      mixpanel.track(ANALYTICS_EVENTS.PAGE_VIEW, eventProperties);

      if (ANALYTICS_CONFIG.debug) {
        console.log('Page view tracked:', eventProperties);
      }
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  }

  trackEvent(name: AnalyticsEventName, properties?: Record<string, any>): void {
    if (!this.initialized) return;

    try {
      const eventProperties = {
        ...ANALYTICS_CONFIG.defaultProperties,
        ...properties,
        timestamp: new Date().toISOString()
      };

      mixpanel.track(ANALYTICS_EVENTS[name], eventProperties);

      if (ANALYTICS_CONFIG.debug) {
        console.log('Event tracked:', { name, properties: eventProperties });
      }
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

// Create a singleton instance
export const analytics = new MixpanelAnalytics();

// React hook for using analytics
export const useAnalytics = () => {
  return analytics;
};

// Re-export types and constants
export * from './types';
export * from './constants';
export { ANALYTICS_CONFIG } from './config';
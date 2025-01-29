import mixpanel from 'mixpanel-browser';
import { AnalyticsService, AnalyticsUser, PageViewProperties } from './types';
import { ANALYTICS_CONFIG } from './config';
import { ANALYTICS_EVENTS, AnalyticsEventName } from './constants';

interface QueuedEvent {
  name: AnalyticsEventName;
  properties?: Record<string, any>;
  timestamp: string;
}

export class MixpanelAnalytics implements AnalyticsService {
  private initialized: boolean = false;
  private offlineQueue: QueuedEvent[] = [];
  private readonly QUEUE_KEY = 'mixpanel_offline_queue';

  constructor() {
    if (ANALYTICS_CONFIG.enabled) {
      this.loadOfflineQueue();
    }
  }

  initializeAndIdentify(userId: string, userProperties?: Partial<AnalyticsUser>): void {
    if (!ANALYTICS_CONFIG.enabled) return;

    try {
      // Initialize Mixpanel with the user's ID immediately
      mixpanel.init(ANALYTICS_CONFIG.token, {
        debug: ANALYTICS_CONFIG.debug,
        persistence: 'localStorage',
        ignore_dnt: false,
        loaded: () => {
          // Set user ID immediately after initialization
          mixpanel.identify(userId);
          
          if (userProperties) {
            mixpanel.people.set({
              $email: userProperties.email,
              $name: userProperties.name,
              role: userProperties.role,
              lastUpdated: new Date().toISOString()
            });
          }
        }
      });
      
      this.initialized = true;
      
      if (ANALYTICS_CONFIG.debug) {
        console.log('Mixpanel analytics initialized with user:', { userId, properties: userProperties });
      }
    } catch (error) {
      console.error('Failed to initialize Mixpanel with user:', error);
      this.initialized = false;
    }
  }

  private loadOfflineQueue(): void {
    try {
      const savedQueue = localStorage.getItem(this.QUEUE_KEY);
      if (savedQueue) {
        this.offlineQueue = JSON.parse(savedQueue);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
      this.offlineQueue = [];
    }
  }

  private saveOfflineQueue(): void {
    try {
      localStorage.setItem(this.QUEUE_KEY, JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  private queueEvent(name: AnalyticsEventName, properties?: Record<string, any>): void {
    this.offlineQueue.push({
      name,
      properties,
      timestamp: new Date().toISOString()
    });
    this.saveOfflineQueue();
  }

  async processOfflineEvents(): Promise<void> {
    if (!this.initialized || !navigator.onLine) return;

    const events = [...this.offlineQueue];
    this.offlineQueue = [];
    this.saveOfflineQueue();

    for (const event of events) {
      try {
        await this.trackEvent(event.name, event.properties);
      } catch (error) {
        // If tracking fails, add back to queue
        this.queueEvent(event.name, event.properties);
        throw error;
      }
    }
  }

  // Prevent separate initialization and identification
  identify(_userId: string, _userProperties?: Partial<AnalyticsUser>): void {
    console.warn('Direct identify calls are disabled. Use initializeAndIdentify instead.');
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

  async trackEvent(name: AnalyticsEventName, properties?: Record<string, any>): Promise<void> {
    if (!this.initialized) return;

    const eventProperties = {
      ...ANALYTICS_CONFIG.defaultProperties,
      ...properties,
      timestamp: new Date().toISOString()
    };

    if (!navigator.onLine) {
      this.queueEvent(name, eventProperties);
      if (ANALYTICS_CONFIG.debug) {
        console.log('Event queued for offline processing:', { name, properties: eventProperties });
      }
      return;
    }

    try {
      await new Promise<void>((resolve, reject) => {
        mixpanel.track(ANALYTICS_EVENTS[name], eventProperties, {
          send_immediately: true
        }, (response: any) => {
          if (response === 1) {
            resolve();
          } else {
            reject(new Error('Failed to track event'));
          }
        });
      });

      if (ANALYTICS_CONFIG.debug) {
        console.log('Event tracked:', { name, properties: eventProperties });
      }
    } catch (error) {
      console.error('Failed to track event:', error);
      this.queueEvent(name, eventProperties);
      throw error;
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
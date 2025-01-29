import { AnalyticsEventName } from './constants';

export interface AnalyticsUser {
  id: string;
  email?: string;
  name?: string;
  role?: string;
}

export interface PageViewProperties {
  path: string;
  title?: string;
  referrer?: string;
  previousPath?: string;
}

export interface AnalyticsService {
  identify(userId: string, userProperties?: Partial<AnalyticsUser>): void;
  trackPageView(properties: PageViewProperties): void;
  trackEvent(name: AnalyticsEventName, properties?: Record<string, any>): void;
  isInitialized(): boolean;
  // Add method for handling offline events
  processOfflineEvents?(): Promise<void>;
}
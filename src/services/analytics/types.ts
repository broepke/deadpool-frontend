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
  trackEvent(name: string, properties?: Record<string, any>): void;
  isInitialized(): boolean;
}
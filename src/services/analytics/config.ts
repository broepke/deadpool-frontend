interface AnalyticsConfig {
  token: string;
  enabled: boolean;
  debug: boolean;
  defaultProperties: {
    environment: string;
    app_version?: string;
  };
}

export const ANALYTICS_CONFIG: AnalyticsConfig = {
  token: import.meta.env.VITE_MIXPANEL_TOKEN,
  enabled: import.meta.env.VITE_ANALYTICS_ENABLED === 'true',
  debug: import.meta.env.VITE_ANALYTICS_DEBUG === 'true',
  defaultProperties: {
    environment: import.meta.env.VITE_ENV,
    // Add app version if available in the future
  }
};
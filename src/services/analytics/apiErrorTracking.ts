import axios, { AxiosError } from 'axios';
import { analytics } from './index';
import { AnalyticsEventName } from './constants';

export const setupApiErrorTracking = (apiClient: typeof axios) => {
  apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      analytics.trackEvent('API_ERROR' as AnalyticsEventName, {
        error_type: 'api_error',
        error_message: error.message,
        error_code: error.response?.status,
        endpoint: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        status_text: error.response?.statusText,
        response_data: error.response?.data,
      });

      return Promise.reject(error);
    }
  );
};
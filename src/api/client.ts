import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { analytics } from '../services/analytics';
import { AnalyticsEventName } from '../services/analytics/constants';

// Get environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_KEY = import.meta.env.VITE_API_KEY;
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000');
const API_RETRY_ATTEMPTS = parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS || '3');

if (!API_KEY) {
  console.error('VITE_API_KEY environment variable is not set');
}

console.log('API Configuration:', {
  url: API_URL,
  timeout: API_TIMEOUT,
  retryAttempts: API_RETRY_ATTEMPTS
});

console.log('API Client initialized with base URL:', API_URL);

// Helper function to extract error details
const getErrorDetails = (error: AxiosError) => ({
  error_type: 'api_error',
  error_message: error.message,
  error_code: error.response?.status,
  endpoint: error.config?.url,
  method: error.config?.method?.toUpperCase(),
  status_text: error.response?.statusText,
  response_data: error.response?.data,
  request_data: error.config?.data,
  request_params: error.config?.params,
});

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-key': API_KEY
      },
      // CORS configuration
      withCredentials: false
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Detailed request logging
        const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
        // Safe request logging without sensitive information
        console.log('API Request Details:', {
          url: fullUrl,
          method: config.method?.toUpperCase(),
          params: config.params ? JSON.stringify(config.params, null, 2) : 'none',
          data: config.data ? JSON.stringify(config.data, null, 2) : 'none'
        });
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling, logging, and retries
    this.client.interceptors.response.use(
      (response) => {
        console.log('Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(response.data, null, 2));
        return response;
      },
      async (error: AxiosError) => {
        const config = error.config as any;
        
        // Initialize retry count if it doesn't exist
        if (!config || !config.retry) {
          config.retry = 0;
        }

        // Implement retry logic for network errors or 5xx errors
        if (config.retry < API_RETRY_ATTEMPTS &&
            (error.code === 'ERR_NETWORK' || (error.response?.status && error.response?.status >= 500))) {
          config.retry += 1;
          console.log(`Retrying request (${config.retry}/${API_RETRY_ATTEMPTS})...`);
          
          // Add a delay before retrying (exponential backoff)
          const delay = Math.min(1000 * (2 ** config.retry), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          return this.client(config);
        }

        // If we've exhausted retries or it's not a retryable error, handle it
        const errorDetails = getErrorDetails(error);
        
        if (error.response) {
          console.error('Response error:', {
            status: error.response.status,
            data: error.response.data,
          });

          // Track specific error types
          switch (error.response.status) {
            case 401:
              console.error('Unauthorized access - check API key configuration');
              await analytics.trackEvent('AUTH_ERROR' as AnalyticsEventName, errorDetails);
              break;
            case 403:
              console.error('Forbidden access - check API key permissions');
              await analytics.trackEvent('AUTH_ERROR' as AnalyticsEventName, {
                ...errorDetails,
                error_subtype: 'forbidden'
              });
              break;
            default:
              console.error('API Error:', error.response.data);
              await analytics.trackEvent('API_ERROR' as AnalyticsEventName, errorDetails);
          }
        } else if (error.code === 'ECONNABORTED') {
          console.error('Request timeout:', {
            timeout: API_TIMEOUT,
            url: config.url
          });
          await analytics.trackEvent('API_ERROR' as AnalyticsEventName, {
            ...errorDetails,
            error_subtype: 'timeout'
          });
        } else {
          console.error('Network Error:', {
            message: error.message,
            code: error.code
          });
          await analytics.trackEvent('API_ERROR' as AnalyticsEventName, {
            ...errorDetails,
            error_subtype: 'network'
          });
        }

        return Promise.reject(error);
      }
    );
  }

  // Generic GET request
  async get<T>(url: string, params?: object): Promise<T> {
    // Log the raw params for debugging
    console.log('Raw params:', params);
    
    // Add a timestamp to prevent caching
    const paramsWithTimestamp = {
      ...params,
      _t: Date.now()
    };
    
    // Create axios config with params
    const config = {
      params: paramsWithTimestamp,
      paramsSerializer: (params: Record<string, any>) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, value.toString());
          }
        });
        const queryString = searchParams.toString();
        console.log('Serialized params:', queryString);
        return queryString;
      }
    };
    
    // Log the full request URL for debugging
    const fullUrl = `${this.client.defaults.baseURL}${url}?${config.paramsSerializer(paramsWithTimestamp as Record<string, any>)}`;
    console.log('Full request URL:', fullUrl);
    
    const response = await this.client.get<T>(url, config);
    // Safely log the page value if it exists
    console.log('Response data:', response.data);
    if (response.data && typeof response.data === 'object' && 'page' in response.data) {
      console.log('Response page value:', (response.data as any).page);
    }
    return response.data;
  }

  // Generic POST request
  async post<T>(url: string, data: object): Promise<T> {
    const response = await this.client.post(url, data);
    return response.data;
  }

  // Generic PUT request with optional query parameters
  async put<T>(url: string, data?: object | null, params?: object): Promise<T> {
    const response = await this.client.put(url, data, { params });
    return response.data;
  }

  // Generic DELETE request
  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete(url);
    return response.data;
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();
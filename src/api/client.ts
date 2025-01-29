import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { analytics } from '../services/analytics';
import { AnalyticsEventName } from '../services/analytics/constants';

// Get the API URL from environment variables, fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      // Add CORS support
      withCredentials: false,
    });

    // Add request interceptor for authentication and logging
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Log the full request URL and params
        const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
        console.log('Making request to:', fullUrl);
        if (config.params) {
          console.log('Request params:', config.params);
        }
        if (config.data) {
          console.log('Request data:', config.data);
        }

        // TODO: Add authentication token when auth is implemented
        // const token = localStorage.getItem('auth_token');
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling and logging
    this.client.interceptors.response.use(
      (response) => {
        console.log('Raw Response:', response);
        console.log('Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(response.data, null, 2));
        return response; // Return the full response to avoid double data extraction
      },
      async (error: AxiosError) => {
        const errorDetails = getErrorDetails(error);
        
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Response error:', {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers,
          });

          // Track specific error types
          switch (error.response.status) {
            case 401:
              console.error('Unauthorized access');
              await analytics.trackEvent('AUTH_ERROR' as AnalyticsEventName, errorDetails);
              break;
            case 403:
              console.error('Forbidden access');
              await analytics.trackEvent('AUTH_ERROR' as AnalyticsEventName, {
                ...errorDetails,
                error_subtype: 'forbidden'
              });
              break;
            case 404:
              console.error('Resource not found');
              await analytics.trackEvent('API_ERROR' as AnalyticsEventName, {
                ...errorDetails,
                error_subtype: 'not_found'
              });
              break;
            case 500:
              console.error('Internal server error');
              await analytics.trackEvent('API_ERROR' as AnalyticsEventName, {
                ...errorDetails,
                error_subtype: 'server_error'
              });
              break;
            default:
              console.error('An error occurred:', error.response.data);
              await analytics.trackEvent('API_ERROR' as AnalyticsEventName, errorDetails);
          }
        } else if (error.request) {
          // The request was made but no response was received
          console.error('No response received:', {
            request: error.request,
            config: error.config,
          });
          await analytics.trackEvent('API_ERROR' as AnalyticsEventName, {
            ...errorDetails,
            error_subtype: 'no_response'
          });
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error setting up request:', {
            message: error.message,
            config: error.config,
          });
          await analytics.trackEvent('API_ERROR' as AnalyticsEventName, {
            ...errorDetails,
            error_subtype: 'request_setup'
          });
        }

        return Promise.reject(error);
      }
    );
  }

  // Generic GET request
  async get<T>(url: string, params?: object): Promise<T> {
    const response = await this.client.get<T>(url, { params });
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
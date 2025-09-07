import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getFromStorage, removeFromStorage } from './utils';
import { ApiResponse, ApiError } from '@/types';

export class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1') {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL,
      timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000'),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = getFromStorage(process.env.NEXT_PUBLIC_TOKEN_STORAGE_KEY || 'auth_token', null);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors (token expired)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          // Clear stored token
          removeFromStorage(process.env.NEXT_PUBLIC_TOKEN_STORAGE_KEY || 'auth_token');
          
          // Redirect to login or refresh token logic here
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
        }

        // Transform error response
        const apiError: ApiError = {
          success: false,
          error: error.response?.data?.error || 'NETWORK_ERROR',
          message: error.response?.data?.message || error.message || 'An error occurred',
          details: error.response?.data?.details,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        };

        return Promise.reject(apiError);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<T>(url, config);
      return this.transformResponse(response);
    } catch (error) {
      throw error;
    }
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return this.transformResponse(response);
    } catch (error) {
      throw error;
    }
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return this.transformResponse(response);
    } catch (error) {
      throw error;
    }
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch<T>(url, data, config);
      return this.transformResponse(response);
    } catch (error) {
      throw error;
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<T>(url, config);
      return this.transformResponse(response);
    } catch (error) {
      throw error;
    }
  }

  private transformResponse<T>(response: AxiosResponse): ApiResponse<T> {
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Success',
      meta: response.data.meta,
    };
  }

  // File upload method
  async uploadFile<T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await this.client.post<T>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });
      return this.transformResponse(response);
    } catch (error) {
      throw error;
    }
  }

  // Multiple file upload method
  async uploadFiles<T>(url: string, files: File[], onProgress?: (progress: number) => void): Promise<ApiResponse<T>> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files`, file);
    });

    try {
      const response = await this.client.post<T>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });
      return this.transformResponse(response);
    } catch (error) {
      throw error;
    }
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export default instance
export default apiClient;

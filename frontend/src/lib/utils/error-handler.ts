import { toast } from 'sonner';

export interface ApiError {
  success: false;
  error: string;
  message: string;
  details?: Record<string, any>;
}

export class ErrorHandler {
  /**
   * Handle API errors with user-friendly messages
   */
  static handleApiError(error: any, fallbackMessage: string = 'An error occurred'): void {
    console.error('API Error:', error);

    // Check if it's an Axios error with response
    if (error.response?.data) {
      const apiError = error.response.data as ApiError;
      
      if (apiError.message) {
        toast.error(apiError.message);
        return;
      }
    }

    // Check if it's a network error
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      toast.error('Network error. Please check your connection and try again.');
      return;
    }

    // Check if it's a timeout error
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      toast.error('Request timed out. Please try again.');
      return;
    }

    // Check if it's a 401 Unauthorized error
    if (error.response?.status === 401) {
      toast.error('Session expired. Please log in again.');
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
      return;
    }

    // Check if it's a 403 Forbidden error
    if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action.');
      return;
    }

    // Check if it's a 404 Not Found error
    if (error.response?.status === 404) {
      toast.error('The requested resource was not found.');
      return;
    }

    // Check if it's a 429 Too Many Requests error
    if (error.response?.status === 429) {
      toast.error('Too many requests. Please wait a moment and try again.');
      return;
    }

    // Check if it's a 500 Internal Server Error
    if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
      return;
    }

    // Fallback to generic error message
    const message = error.message || fallbackMessage;
    toast.error(message);
  }

  /**
   * Handle validation errors
   */
  static handleValidationError(error: any): void {
    if (error.details && Array.isArray(error.details)) {
      // Show first validation error
      const firstError = error.details[0];
      toast.error(firstError.message || 'Validation error');
    } else {
      toast.error('Please check your input and try again.');
    }
  }

  /**
   * Handle form submission errors
   */
  static handleFormError(error: any, formName: string): void {
    console.error(`Form submission error for ${formName}:`, error);
    
    if (error.response?.status === 422) {
      // Validation error
      this.handleValidationError(error.response.data);
    } else {
      this.handleApiError(error, `Failed to submit ${formName}`);
    }
  }

  /**
   * Handle file upload errors
   */
  static handleFileUploadError(error: any): void {
    console.error('File upload error:', error);

    if (error.response?.status === 413) {
      toast.error('File too large. Please choose a smaller file.');
      return;
    }

    if (error.response?.status === 415) {
      toast.error('File type not supported. Please choose a different file.');
      return;
    }

    this.handleApiError(error, 'Failed to upload file');
  }

  /**
   * Handle cart operation errors
   */
  static handleCartError(error: any, operation: string): void {
    console.error(`Cart ${operation} error:`, error);
    
    if (error.response?.status === 400) {
      const message = error.response.data?.message || `Invalid ${operation} request`;
      toast.error(message);
      return;
    }

    this.handleApiError(error, `Failed to ${operation} item`);
  }

  /**
   * Handle order operation errors
   */
  static handleOrderError(error: any, operation: string): void {
    console.error(`Order ${operation} error:`, error);
    
    if (error.response?.status === 400) {
      const message = error.response.data?.message || `Invalid ${operation} request`;
      toast.error(message);
      return;
    }

    if (error.response?.status === 409) {
      toast.error('Order cannot be modified at this time.');
      return;
    }

    this.handleApiError(error, `Failed to ${operation} order`);
  }

  /**
   * Handle appointment operation errors
   */
  static handleAppointmentError(error: any, operation: string): void {
    console.error(`Appointment ${operation} error:`, error);
    
    if (error.response?.status === 400) {
      const message = error.response.data?.message || `Invalid ${operation} request`;
      toast.error(message);
      return;
    }

    if (error.response?.status === 409) {
      toast.error('Time slot is no longer available.');
      return;
    }

    this.handleApiError(error, `Failed to ${operation} appointment`);
  }

  /**
   * Handle authentication errors
   */
  static handleAuthError(error: any, operation: string): void {
    console.error(`Auth ${operation} error:`, error);
    
    if (error.response?.status === 401) {
      toast.error('Invalid credentials. Please check your email and password.');
      return;
    }

    if (error.response?.status === 409) {
      toast.error('An account with this email already exists.');
      return;
    }

    this.handleApiError(error, `Failed to ${operation}`);
  }

  /**
   * Handle notification operation errors
   */
  static handleNotificationError(error: any, operation: string): void {
    console.error(`Notification ${operation} error:`, error);
    
    if (error.response?.status === 400) {
      const message = error.response.data?.message || `Invalid ${operation} request`;
      toast.error(message);
      return;
    }

    if (error.response?.status === 404) {
      toast.error('Notification not found.');
      return;
    }

    this.handleApiError(error, `Failed to ${operation} notification`);
  }

  /**
   * Get user-friendly error message
   */
  static getErrorMessage(error: any): string {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    if (error.message) {
      return error.message;
    }

    return 'An unexpected error occurred';
  }

  /**
   * Log error for debugging
   */
  static logError(error: any, context?: string): void {
    const errorInfo = {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      context
    };

    console.error('Error logged:', errorInfo);
    
    // In production, you might want to send this to an error tracking service
    // like Sentry, LogRocket, etc.
  }
}

export default ErrorHandler;

import { apiClient } from '../api-client';
import { AuthResponse, LoginForm, RegisterForm, ProfileUpdateForm, ChangePasswordForm, User } from '@/types';

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: RegisterForm): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    
    // Store auth data
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
    }
    
    return response.data;
  }

  /**
   * Login user
   */
  static async login(data: LoginForm): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    
    // Store auth data
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
    }
    
    return response.data;
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear auth data regardless of API call result
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(): Promise<User> {
    const response = await apiClient.get<User>('/auth/profile');
    return response.data;
  }

  /**
   * Update user profile
   */
  static async updateProfile(data: ProfileUpdateForm): Promise<AuthResponse> {
    const response = await apiClient.put<AuthResponse>('/auth/profile', data);
    
    // Update stored user data
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
    }
    
    return response.data;
  }

  /**
   * Change password
   */
  static async changePassword(data: ChangePasswordForm): Promise<void> {
    await apiClient.put('/auth/change-password', data);
  }

  /**
   * Reset password (Admin only)
   */
  static async resetPassword(userId: string, newPassword: string): Promise<void> {
    await apiClient.put(`/auth/reset-password/${userId}`, { newPassword });
  }

  /**
   * Get stored auth token
   */
  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  /**
   * Get stored user data
   */
  static getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Refresh user data from server
   */
  static async refreshUser(): Promise<User> {
    const user = await this.getProfile();
    
    // Update stored user data
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_data', JSON.stringify(user));
    }
    
    return user;
  }
}

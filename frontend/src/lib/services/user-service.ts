import { apiClient } from '@/lib/api-client';
import { User, LoginFormData, RegisterFormData, Address, WishlistItem } from '@/types';

export class UserService {
  private basePath = '/users';

  async login(credentials: LoginFormData): Promise<{ user: User; token: string }> {
    const response = await apiClient.post<{ user: User; token: string }>('/auth/login', credentials);
    return response.data;
  }

  async register(userData: RegisterFormData): Promise<{ user: User; token: string }> {
    const response = await apiClient.post<{ user: User; token: string }>('/auth/register', userData);
    return response.data;
  }

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  }

  async refreshToken(): Promise<{ token: string }> {
    const response = await apiClient.post<{ token: string }>('/auth/refresh');
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>(`${this.basePath}/me`);
    return response.data;
  }

  async updateProfile(profileData: Partial<User>): Promise<User> {
    const response = await apiClient.put<User>(`${this.basePath}/me`, profileData);
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.put(`${this.basePath}/me/password`, {
      currentPassword,
      newPassword,
    });
  }

  async resetPassword(email: string): Promise<void> {
    await apiClient.post('/auth/reset-password', { email });
  }

  async confirmResetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/confirm-reset-password', {
      token,
      newPassword,
    });
  }

  async verifyEmail(token: string): Promise<void> {
    await apiClient.post('/auth/verify-email', { token });
  }

  async resendVerificationEmail(): Promise<void> {
    await apiClient.post('/auth/resend-verification');
  }

  async getAddresses(): Promise<Address[]> {
    const response = await apiClient.get<Address[]>(`${this.basePath}/me/addresses`);
    return response.data;
  }

  async addAddress(address: Omit<Address, 'id'>): Promise<Address> {
    const response = await apiClient.post<Address>(`${this.basePath}/me/addresses`, address);
    return response.data;
  }

  async updateAddress(addressId: string, address: Partial<Address>): Promise<Address> {
    const response = await apiClient.put<Address>(`${this.basePath}/me/addresses/${addressId}`, address);
    return response.data;
  }

  async deleteAddress(addressId: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/me/addresses/${addressId}`);
  }

  async setDefaultAddress(addressId: string): Promise<void> {
    await apiClient.put(`${this.basePath}/me/addresses/${addressId}/default`);
  }

  async getWishlist(): Promise<WishlistItem[]> {
    const response = await apiClient.get<WishlistItem[]>(`${this.basePath}/me/wishlist`);
    return response.data;
  }

  async addToWishlist(productId: string): Promise<WishlistItem> {
    const response = await apiClient.post<WishlistItem>(`${this.basePath}/me/wishlist`, {
      productId,
    });
    return response.data;
  }

  async removeFromWishlist(productId: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/me/wishlist/${productId}`);
  }

  async clearWishlist(): Promise<void> {
    await apiClient.delete(`${this.basePath}/me/wishlist/clear`);
  }

  async getOrderHistory(page: number = 1, limit: number = 10): Promise<{
    orders: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const response = await apiClient.get<{
      orders: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(`${this.basePath}/me/orders`, {
      params: { page, limit },
    });
    return response.data;
  }

  async getOrder(orderId: string): Promise<any> {
    const response = await apiClient.get<any>(`${this.basePath}/me/orders/${orderId}`);
    return response.data;
  }

  async updateNotificationPreferences(preferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
  }): Promise<void> {
    await apiClient.put(`${this.basePath}/me/notifications`, preferences);
  }

  async updateThemePreference(theme: 'light' | 'dark' | 'system'): Promise<void> {
    await apiClient.put(`${this.basePath}/me/theme`, { theme });
  }

  async deleteAccount(password: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/me`, {
      data: { password },
    });
  }

  async uploadAvatar(file: File, onProgress?: (progress: number) => void): Promise<{ url: string }> {
    const response = await apiClient.uploadFile<{ url: string }>(`${this.basePath}/me/avatar`, file, onProgress);
    return response.data;
  }

  async deleteAvatar(): Promise<void> {
    await apiClient.delete(`${this.basePath}/me/avatar`);
  }
}

export const userService = new UserService();

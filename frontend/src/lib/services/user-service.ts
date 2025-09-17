import { apiClient } from '@/lib/api-client';
import { User, LoginForm, RegisterForm, ShippingAddress } from '@/types';

export class UserService {
  private basePath = '/users';

  async login(credentials: LoginForm): Promise<{ user: User; token: string }> {
    const response = await apiClient.post<{ user: User; token: string }>('/auth/login', credentials);
    return response.data;
  }

  async register(userData: RegisterForm): Promise<{ user: User; token: string }> {
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

  async getAddresses(): Promise<ShippingAddress[]> {
    const response = await apiClient.get<ShippingAddress[]>(`${this.basePath}/me/addresses`);
    return response.data;
  }

  async addAddress(address: Omit<ShippingAddress, 'id'>): Promise<ShippingAddress> {
    const response = await apiClient.post<ShippingAddress>(`${this.basePath}/me/addresses`, address);
    return response.data;
  }

  async updateAddress(addressId: string, address: Partial<ShippingAddress>): Promise<ShippingAddress> {
    const response = await apiClient.put<ShippingAddress>(`${this.basePath}/me/addresses/${addressId}`, address);
    return response.data;
  }

  async deleteAddress(addressId: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/me/addresses/${addressId}`);
  }

  async setDefaultAddress(addressId: string): Promise<void> {
    await apiClient.put(`${this.basePath}/me/addresses/${addressId}/default`);
  }

  async getWishlist(): Promise<any[]> {
    const response = await apiClient.get<any[]>(`${this.basePath}/me/wishlist`);
    return response.data;
  }

  async addToWishlist(productId: string): Promise<any> {
    const response = await apiClient.post<any>(`${this.basePath}/me/wishlist`, {
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

  // Admin methods
  async getAllUsers(page: number = 1, limit: number = 20, filters: {
    role?: string;
    search?: string;
    isActive?: boolean;
  } = {}): Promise<{
    data: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined)
      ),
    });

    const response = await apiClient.get<User[]>(`/admin/users?${params}`);
    return {
      data: response.data,
      pagination: response.meta?.pagination || { page: 1, limit: 20, total: 0, pages: 0 }
    };
  }

  async getUserById(id: string): Promise<User> {
    const response = await apiClient.get<User>(`/admin/users/${id}`);
    return response.data;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const response = await apiClient.put<User>(`/admin/users/${id}`, userData);
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/admin/users/${id}`);
  }

  async createUser(userData: {
    name: string;
    email: string;
    password: string;
    role: 'user' | 'staff' | 'admin';
    profile?: {
      phone?: string;
      dateOfBirth?: string;
    };
  }): Promise<User> {
    const response = await apiClient.post<User>('/admin/users', userData);
    return response.data;
  }
}

export const userService = new UserService();

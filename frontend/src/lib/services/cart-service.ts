import { apiClient } from '@/lib/api-client';
import { Cart, CartItem, Product } from '@/types';

export class CartService {
  private basePath = '/cart';

  async getCart(): Promise<Cart> {
    const response = await apiClient.get<Cart>(this.basePath);
    return response.data;
  }

  async addToCart(productId: string, quantity: number = 1, selectedVariant?: string): Promise<CartItem> {
    const response = await apiClient.post<CartItem>(`${this.basePath}/items`, {
      productId,
      quantity,
      selectedVariant,
    });
    return response.data;
  }

  async updateCartItem(itemId: string, quantity: number): Promise<CartItem> {
    const response = await apiClient.put<CartItem>(`${this.basePath}/items/${itemId}`, {
      quantity,
    });
    return response.data;
  }

  async removeFromCart(itemId: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/items/${itemId}`);
  }

  async clearCart(): Promise<void> {
    await apiClient.delete(`${this.basePath}/clear`);
  }

  async moveToWishlist(itemId: string): Promise<void> {
    await apiClient.post(`${this.basePath}/items/${itemId}/move-to-wishlist`);
  }

  async applyCoupon(code: string): Promise<{ discount: number; message: string }> {
    const response = await apiClient.post<{ discount: number; message: string }>(`${this.basePath}/coupon`, {
      code,
    });
    return response.data;
  }

  async removeCoupon(): Promise<void> {
    await apiClient.delete(`${this.basePath}/coupon`);
  }

  async getCartCount(): Promise<number> {
    const response = await apiClient.get<{ count: number }>(`${this.basePath}/count`);
    return response.data.count;
  }

  async syncCart(localCartItems: Array<{
    productId: string;
    quantity: number;
    selectedVariant?: string;
  }>): Promise<Cart> {
    const response = await apiClient.post<Cart>(`${this.basePath}/sync`, {
      items: localCartItems,
    });
    return response.data;
  }

  async saveForLater(itemId: string): Promise<void> {
    await apiClient.post(`${this.basePath}/items/${itemId}/save-for-later`);
  }

  async getSavedItems(): Promise<CartItem[]> {
    const response = await apiClient.get<CartItem[]>(`${this.basePath}/saved`);
    return response.data;
  }

  async moveFromSavedToCart(itemId: string): Promise<CartItem> {
    const response = await apiClient.post<CartItem>(`${this.basePath}/saved/${itemId}/move-to-cart`);
    return response.data;
  }

  async removeFromSaved(itemId: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/saved/${itemId}`);
  }

  async calculateShipping(address: {
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }): Promise<{ shipping: number; estimatedDays: number }> {
    const response = await apiClient.post<{ shipping: number; estimatedDays: number }>(`${this.basePath}/shipping`, address);
    return response.data;
  }

  async validateCart(): Promise<{
    isValid: boolean;
    errors: Array<{
      itemId: string;
      message: string;
    }>;
  }> {
    const response = await apiClient.get<{
      isValid: boolean;
      errors: Array<{
        itemId: string;
        message: string;
      }>;
    }>(`${this.basePath}/validate`);
    return response.data;
  }
}

export const cartService = new CartService();

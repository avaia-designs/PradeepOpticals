import { apiClient } from '../api-client';
import { Cart, CartItem } from '@/types';

export class CartService {
  /**
   * Get cart contents
   */
  static async getCart(): Promise<Cart> {
    const response = await apiClient.get<Cart>('/cart');
    return response.data;
  }

  /**
   * Add item to cart
   */
  static async addItem(
    productId: string,
    quantity: number,
    specifications?: {
      material?: string;
      color?: string;
      size?: string;
    }
  ): Promise<Cart> {
    const response = await apiClient.post<Cart>('/cart/items', {
      productId,
      quantity,
      specifications,
    });
    return response.data;
  }

  /**
   * Update item quantity in cart
   */
  static async updateItemQuantity(productId: string, quantity: number): Promise<Cart> {
    const response = await apiClient.put<Cart>(`/cart/items/${productId}`, {
      quantity,
    });
    return response.data;
  }

  /**
   * Remove item from cart
   */
  static async removeItem(productId: string): Promise<Cart> {
    const response = await apiClient.delete<Cart>(`/cart/items/${productId}`);
    return response.data;
  }

  /**
   * Clear cart
   */
  static async clearCart(): Promise<Cart> {
    const response = await apiClient.delete<Cart>('/cart');
    return response.data;
  }

  /**
   * Apply discount to cart
   */
  static async applyDiscount(discountAmount: number): Promise<Cart> {
    const response = await apiClient.post<Cart>('/cart/discount', {
      discountAmount,
    });
    return response.data;
  }

  /**
   * Remove discount from cart
   */
  static async removeDiscount(): Promise<Cart> {
    const response = await apiClient.delete<Cart>('/cart/discount');
    return response.data;
  }
}

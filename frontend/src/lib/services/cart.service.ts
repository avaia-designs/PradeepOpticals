import { apiClient } from '../api-client';
import { Cart, CartItem } from '@/types';
import { ErrorHandler } from '../utils/error-handler';

export class CartService {
  /**
   * Get cart contents
   */
  static async getCart(): Promise<Cart> {
    try {
      const response = await apiClient.get<Cart>('/cart');
      return response.data;
    } catch (error) {
      console.error('Error fetching cart:', error);
      ErrorHandler.handleCartError(error, 'fetch');
      throw error;
    }
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
    try {
      const response = await apiClient.post<Cart>('/cart/items', {
        productId,
        quantity,
        specifications,
      });
      return response.data;
    } catch (error) {
      console.error('Error adding item to cart:', error);
      ErrorHandler.handleCartError(error, 'add');
      throw error;
    }
  }

  /**
   * Update item quantity in cart
   */
  static async updateItemQuantity(productId: string, quantity: number): Promise<Cart> {
    try {
      const response = await apiClient.put<Cart>(`/cart/items/${productId}`, {
        quantity,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating item quantity:', error);
      ErrorHandler.handleCartError(error, 'update');
      throw error;
    }
  }

  /**
   * Remove item from cart
   */
  static async removeItem(productId: string): Promise<Cart> {
    try {
      const response = await apiClient.delete<Cart>(`/cart/items/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing item from cart:', error);
      ErrorHandler.handleCartError(error, 'remove');
      throw error;
    }
  }

  /**
   * Clear cart
   */
  static async clearCart(): Promise<Cart> {
    try {
      const response = await apiClient.delete<Cart>('/cart');
      return response.data;
    } catch (error) {
      console.error('Error clearing cart:', error);
      ErrorHandler.handleCartError(error, 'clear');
      throw error;
    }
  }

  /**
   * Apply discount to cart
   */
  static async applyDiscount(discountAmount: number): Promise<Cart> {
    try {
      const response = await apiClient.post<Cart>('/cart/discount', {
        discountAmount,
      });
      return response.data;
    } catch (error) {
      console.error('Error applying discount:', error);
      ErrorHandler.handleCartError(error, 'apply discount');
      throw error;
    }
  }

  /**
   * Remove discount from cart
   */
  static async removeDiscount(): Promise<Cart> {
    try {
      const response = await apiClient.delete<Cart>('/cart/discount');
      return response.data;
    } catch (error) {
      console.error('Error removing discount:', error);
      ErrorHandler.handleCartError(error, 'remove discount');
      throw error;
    }
  }
}

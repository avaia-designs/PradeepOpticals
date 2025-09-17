import { apiClient } from '../api-client';
import { Order, PaginatedResult, CheckoutForm, ShippingAddress } from '@/types';
import { ErrorHandler } from '../utils/error-handler';

export class OrderService {
  /**
   * Create order from cart
   */
  static async checkout(data: CheckoutForm): Promise<Order> {
    try {
      const formData = new FormData();
      
      // Add shipping address
      Object.entries(data.shippingAddress).forEach(([key, value]) => {
        formData.append(`shippingAddress.${key}`, value);
      });
      
      // Add other fields
      formData.append('paymentMethod', data.paymentMethod);
      if (data.notes) formData.append('notes', data.notes);
      if (data.prescriptionFile) formData.append('prescriptionFile', data.prescriptionFile);

      const response = await apiClient.post<Order>('/orders/checkout', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error during checkout:', error);
      ErrorHandler.handleOrderError(error, 'checkout');
      throw error;
    }
  }

  /**
   * Get user orders
   */
  static async getUserOrders(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<Order>> {
    try {
      const response = await apiClient.get<Order[]>(
        `/orders?page=${page}&limit=${limit}`
      );
      
      // Extract data and pagination from the API response structure
      return {
        data: response.data,  // Backend returns orders array in data
        pagination: response.meta?.pagination || { page: 1, limit: 10, total: 0, pages: 0 }
      };
    } catch (error) {
      console.error('Error fetching user orders:', error);
      ErrorHandler.handleOrderError(error, 'fetch');
      throw error;
    }
  }

  /**
   * Get order by ID
   */
  static async getOrderById(id: string): Promise<Order> {
    try {
      const response = await apiClient.get<Order>(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      ErrorHandler.handleOrderError(error, 'fetch');
      throw error;
    }
  }

  /**
   * Cancel order
   */
  static async cancelOrder(id: string, reason?: string): Promise<Order> {
    try {
      const response = await apiClient.put<Order>(`/orders/${id}/cancel`, {
        reason,
      });
      return response.data;
    } catch (error) {
      console.error('Error cancelling order:', error);
      ErrorHandler.handleOrderError(error, 'cancel');
      throw error;
    }
  }

  /**
   * Get order statistics (Admin only)
   */
  static async getOrderStatistics(): Promise<any> {
    try {
      const response = await apiClient.get('/orders/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching order statistics:', error);
      ErrorHandler.handleOrderError(error, 'fetch statistics');
      throw error;
    }
  }
}

import { apiClient } from '../api-client';
import { ErrorHandler } from '../utils/error-handler';

export interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
  priority: 'low' | 'medium' | 'high';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export class NotificationService {
  /**
   * Get user notifications
   */
  static async getUserNotifications(
    page: number = 1,
    limit: number = 20,
    filters?: {
      isRead?: boolean;
      type?: string;
      priority?: string;
    }
  ): Promise<PaginatedResult<Notification>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (filters?.isRead !== undefined) params.append('isRead', filters.isRead.toString());
      if (filters?.type) params.append('type', filters.type);
      if (filters?.priority) params.append('priority', filters.priority);

      const response = await apiClient.get<Notification[]>(
        `/notifications?${params.toString()}`
      );
      
      return {
        data: response.data,
        pagination: response.meta?.pagination || { page: 1, limit: 20, total: 0, pages: 0 }
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      ErrorHandler.handleNotificationError(error, 'fetch');
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(): Promise<number> {
    try {
      const response = await apiClient.get<{ count: number }>('/notifications/unread-count');
      return response.data.count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      ErrorHandler.handleNotificationError(error, 'fetch count');
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string): Promise<Notification> {
    try {
      const response = await apiClient.put<Notification>(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      ErrorHandler.handleNotificationError(error, 'mark read');
      throw error;
    }
  }

  /**
   * Mark multiple notifications as read
   */
  static async markMultipleAsRead(notificationIds: string[]): Promise<void> {
    try {
      await apiClient.put('/notifications/mark-read', {
        notificationIds,
      });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      ErrorHandler.handleNotificationError(error, 'mark multiple read');
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(): Promise<void> {
    try {
      await apiClient.put('/notifications/mark-all-read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      ErrorHandler.handleNotificationError(error, 'mark all read');
      throw error;
    }
  }

  /**
   * Delete notification
   */
  static async deleteNotification(notificationId: string): Promise<void> {
    try {
      await apiClient.delete(`/notifications/${notificationId}`);
    } catch (error) {
      console.error('Error deleting notification:', error);
      ErrorHandler.handleNotificationError(error, 'delete');
      throw error;
    }
  }

  /**
   * Delete all notifications
   */
  static async deleteAllNotifications(): Promise<void> {
    try {
      await apiClient.delete('/notifications');
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      ErrorHandler.handleNotificationError(error, 'delete all');
      throw error;
    }
  }

  /**
   * Get notification statistics
   */
  static async getNotificationStatistics(): Promise<{
    total: number;
    unread: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    try {
      const response = await apiClient.get('/notifications/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching notification statistics:', error);
      ErrorHandler.handleNotificationError(error, 'fetch statistics');
      throw error;
    }
  }
}

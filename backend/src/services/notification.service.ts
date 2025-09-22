import { Notification, NotificationType, NotificationPriority } from '../models/Notification';
import { Logger } from '../utils/logger';

export interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  actionUrl?: string;
  metadata?: Record<string, any>;
  expiresAt?: Date;
}

export class NotificationService {
  /**
   * Create a new notification
   */
  static async createNotification(data: CreateNotificationData) {
    try {
      const notification = await Notification.createNotification(
        data.userId,
        data.type,
        data.title,
        data.message,
        {
          priority: data.priority || NotificationPriority.MEDIUM,
          actionUrl: data.actionUrl,
          metadata: data.metadata || {},
          expiresAt: data.expiresAt
        }
      );

      Logger.info('Notification created successfully', {
        notificationId: notification._id,
        userId: data.userId,
        type: data.type
      });

      return notification;
    } catch (error) {
      Logger.error('Failed to create notification', error as Error, {
        userId: data.userId,
        type: data.type
      });
      throw error;
    }
  }

  /**
   * Create appointment confirmation notification
   */
  static async createAppointmentConfirmationNotification(
    userId: string,
    appointmentData: {
      appointmentNumber: string;
      appointmentDate: string;
      startTime: string;
      endTime: string;
    }
  ) {
    return this.createNotification({
      userId,
      type: NotificationType.APPOINTMENT_CONFIRMED,
      title: 'Appointment Confirmed',
      message: `Your appointment ${appointmentData.appointmentNumber} has been confirmed for ${appointmentData.appointmentDate} at ${appointmentData.startTime}-${appointmentData.endTime}`,
      priority: NotificationPriority.HIGH,
      actionUrl: `/appointments`,
      metadata: {
        appointmentNumber: appointmentData.appointmentNumber,
        appointmentDate: appointmentData.appointmentDate,
        startTime: appointmentData.startTime,
        endTime: appointmentData.endTime
      }
    });
  }

  /**
   * Create appointment cancellation notification
   */
  static async createAppointmentCancellationNotification(
    userId: string,
    appointmentData: {
      appointmentNumber: string;
      appointmentDate: string;
      startTime: string;
      endTime: string;
      reason?: string;
    }
  ) {
    return this.createNotification({
      userId,
      type: NotificationType.APPOINTMENT_CANCELLED,
      title: 'Appointment Cancelled',
      message: `Your appointment ${appointmentData.appointmentNumber} for ${appointmentData.appointmentDate} at ${appointmentData.startTime}-${appointmentData.endTime} has been cancelled${appointmentData.reason ? `. Reason: ${appointmentData.reason}` : ''}`,
      priority: NotificationPriority.MEDIUM,
      actionUrl: `/appointments`,
      metadata: {
        appointmentNumber: appointmentData.appointmentNumber,
        appointmentDate: appointmentData.appointmentDate,
        startTime: appointmentData.startTime,
        endTime: appointmentData.endTime,
        reason: appointmentData.reason
      }
    });
  }

  /**
   * Create order confirmation notification
   */
  static async createOrderConfirmationNotification(
    userId: string,
    orderData: {
      orderNumber: string;
      totalAmount: number;
    }
  ) {
    return this.createNotification({
      userId,
      type: NotificationType.ORDER_CONFIRMED,
      title: 'Order Confirmed',
      message: `Your order ${orderData.orderNumber} has been confirmed. Total amount: $${orderData.totalAmount.toFixed(2)}`,
      priority: NotificationPriority.HIGH,
      actionUrl: `/orders`,
      metadata: {
        orderNumber: orderData.orderNumber,
        totalAmount: orderData.totalAmount
      }
    });
  }

  /**
   * Create quotation approval notification
   */
  static async createQuotationApprovalNotification(
    userId: string,
    quotationData: {
      quotationNumber: string;
      totalAmount: number;
    }
  ) {
    return this.createNotification({
      userId,
      type: NotificationType.QUOTATION_APPROVED,
      title: 'Quotation Approved',
      message: `Your quotation ${quotationData.quotationNumber} has been approved. Total amount: $${quotationData.totalAmount.toFixed(2)}`,
      priority: NotificationPriority.HIGH,
      actionUrl: `/quotations`,
      metadata: {
        quotationNumber: quotationData.quotationNumber,
        totalAmount: quotationData.totalAmount
      }
    });
  }

  /**
   * Create quotation rejection notification
   */
  static async createQuotationRejectionNotification(
    userId: string,
    quotationData: {
      quotationNumber: string;
      reason?: string;
    }
  ) {
    return this.createNotification({
      userId,
      type: NotificationType.QUOTATION_REJECTED,
      title: 'Quotation Rejected',
      message: `Your quotation ${quotationData.quotationNumber} has been rejected${quotationData.reason ? `. Reason: ${quotationData.reason}` : ''}`,
      priority: NotificationPriority.MEDIUM,
      actionUrl: `/quotations`,
      metadata: {
        quotationNumber: quotationData.quotationNumber,
        reason: quotationData.reason
      }
    });
  }

  /**
   * Create quotation conversion notification
   */
  static async createQuotationConversionNotification(
    userId: string,
    quotationData: {
      quotationNumber: string;
      orderNumber: string;
    }
  ) {
    return this.createNotification({
      userId,
      type: NotificationType.QUOTATION_CONVERTED,
      title: 'Quotation Converted to Order',
      message: `Your quotation ${quotationData.quotationNumber} has been converted to order ${quotationData.orderNumber}`,
      priority: NotificationPriority.HIGH,
      actionUrl: `/orders`,
      metadata: {
        quotationNumber: quotationData.quotationNumber,
        orderNumber: quotationData.orderNumber
      }
    });
  }

  /**
   * Create staff reply notification
   */
  static async createStaffReplyNotification(
    userId: string,
    quotationData: {
      quotationNumber: string;
      message: string;
    }
  ) {
    return this.createNotification({
      userId,
      type: NotificationType.STAFF_REPLY,
      title: 'New Staff Reply',
      message: `Staff replied to quotation ${quotationData.quotationNumber}: ${quotationData.message.length > 100 ? quotationData.message.substring(0, 100) + '...' : quotationData.message}`,
      priority: NotificationPriority.HIGH,
      actionUrl: `/quotations`,
      metadata: {
        quotationNumber: quotationData.quotationNumber,
        message: quotationData.message
      }
    });
  }

  /**
   * Create customer approval notification
   */
  static async createCustomerApprovalNotification(
    staffId: string,
    quotationData: {
      quotationNumber: string;
      customerName: string;
    }
  ) {
    return this.createNotification({
      userId: staffId,
      type: NotificationType.CUSTOMER_APPROVAL,
      title: 'Customer Approved Quotation',
      message: `${quotationData.customerName} has approved quotation ${quotationData.quotationNumber}`,
      priority: NotificationPriority.HIGH,
      actionUrl: `/quotations`,
      metadata: {
        quotationNumber: quotationData.quotationNumber,
        customerName: quotationData.customerName
      }
    });
  }

  /**
   * Create customer rejection notification
   */
  static async createCustomerRejectionNotification(
    staffId: string,
    quotationData: {
      quotationNumber: string;
      customerName: string;
      reason: string;
    }
  ) {
    return this.createNotification({
      userId: staffId,
      type: NotificationType.CUSTOMER_REJECTION,
      title: 'Customer Rejected Quotation',
      message: `${quotationData.customerName} has rejected quotation ${quotationData.quotationNumber}. Reason: ${quotationData.reason}`,
      priority: NotificationPriority.MEDIUM,
      actionUrl: `/quotations`,
      metadata: {
        quotationNumber: quotationData.quotationNumber,
        customerName: quotationData.customerName,
        reason: quotationData.reason
      }
    });
  }

  /**
   * Create system announcement notification
   */
  static async createSystemAnnouncementNotification(
    userIds: string[],
    title: string,
    message: string,
    actionUrl?: string
  ) {
    const notifications = [];

    for (const userId of userIds) {
      try {
        const notification = await this.createNotification({
          userId,
          type: NotificationType.SYSTEM_ANNOUNCEMENT,
          title,
          message,
          priority: NotificationPriority.MEDIUM,
          actionUrl
        });
        notifications.push(notification);
      } catch (error) {
        Logger.error('Failed to create system announcement notification', error as Error, {
          userId,
          title
        });
      }
    }

    return notifications;
  }

  /**
   * Get user notifications with pagination
   */
  static async getUserNotifications(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      isRead?: boolean;
      type?: NotificationType;
      priority?: NotificationPriority;
    } = {}
  ) {
    return Notification.getUserNotifications(userId, options);
  }

  /**
   * Mark notifications as read
   */
  static async markAsRead(notificationIds: string[], userId: string) {
    return Notification.markAsRead(notificationIds, userId);
  }

  /**
   * Mark all user notifications as read
   */
  static async markAllAsRead(userId: string) {
    return Notification.markAllAsRead(userId);
  }

  /**
   * Get unread count for user
   */
  static async getUnreadCount(userId: string) {
    return Notification.getUnreadCount(userId);
  }

  /**
   * Delete notification
   */
  static async deleteNotification(notificationId: string, userId: string) {
    return Notification.findOneAndDelete({ _id: notificationId, userId });
  }
}

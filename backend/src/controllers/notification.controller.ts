import { Request, Response, NextFunction } from 'express';
import { Notification, NotificationType, NotificationPriority } from '../models/Notification';
import { ApiResponse } from '../types';

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

/**
 * Get user notifications
 */
export const getUserNotifications = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 20, isRead, type, priority } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'User not authenticated'
      });
    }

    const notifications = await Notification.getUserNotifications(userId, {
      page: Number(page),
      limit: Number(limit),
      isRead: isRead ? isRead === 'true' : undefined,
      type: type as NotificationType,
      priority: priority as NotificationPriority
    });

    const unreadCount = await Notification.getUnreadCount(userId);

    const response: ApiResponse = {
      success: true,
      data: notifications,
      message: 'Notifications retrieved successfully',
      meta: {
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: notifications.length,
          pages: Math.ceil(notifications.length / Number(limit))
        },
        unreadCount
      }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Mark notifications as read
 */
export const markNotificationsAsRead = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { notificationIds } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'User not authenticated'
      });
    }

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Notification IDs array is required'
      });
    }

    const result = await Notification.markAsRead(notificationIds, userId);

    const response: ApiResponse = {
      success: true,
      data: { modifiedCount: result.modifiedCount },
      message: 'Notifications marked as read successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'User not authenticated'
      });
    }

    const result = await Notification.markAllAsRead(userId);

    const response: ApiResponse = {
      success: true,
      data: { modifiedCount: result.modifiedCount },
      message: 'All notifications marked as read successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'User not authenticated'
      });
    }

    const unreadCount = await Notification.getUnreadCount(userId);

    const response: ApiResponse = {
      success: true,
      data: { unreadCount },
      message: 'Unread count retrieved successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete notification
 */
export const deleteNotification = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'User not authenticated'
      });
    }

    const notification = await Notification.findOneAndDelete({ _id: id, userId });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Notification not found'
      });
    }

    const response: ApiResponse = {
      success: true,
      data: null,
      message: 'Notification deleted successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Create notification (Admin/Staff only)
 */
export const createNotification = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userRole = req.user?.role;

    if (!['staff', 'admin'].includes(userRole || '')) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Access denied. Staff or Admin role required.'
      });
    }

    const {
      userId,
      type,
      title,
      message,
      priority = NotificationPriority.MEDIUM,
      actionUrl,
      metadata,
      expiresAt
    } = req.body;

    if (!userId || !type || !title || !message) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'User ID, type, title, and message are required'
      });
    }

    const notification = await Notification.createNotification(userId, type, title, message, {
      priority,
      actionUrl,
      metadata,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    });

    const response: ApiResponse = {
      success: true,
      data: notification,
      message: 'Notification created successfully'
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Get notification by ID
 */
export const getNotificationById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'User not authenticated'
      });
    }

    const notification = await Notification.findOne({ _id: id, userId });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Notification not found'
      });
    }

    const response: ApiResponse = {
      success: true,
      data: notification,
      message: 'Notification retrieved successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

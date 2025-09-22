import mongoose, { Schema, Document } from 'mongoose';
import { BaseModel } from '../types';

// Notification type enum
export enum NotificationType {
  APPOINTMENT_CONFIRMED = 'appointment_confirmed',
  APPOINTMENT_CANCELLED = 'appointment_cancelled',
  APPOINTMENT_REMINDER = 'appointment_reminder',
  ORDER_CONFIRMED = 'order_confirmed',
  ORDER_SHIPPED = 'order_shipped',
  ORDER_DELIVERED = 'order_delivered',
  QUOTATION_APPROVED = 'quotation_approved',
  QUOTATION_REJECTED = 'quotation_rejected',
  QUOTATION_CONVERTED = 'quotation_converted',
  STAFF_REPLY = 'staff_reply',
  CUSTOMER_APPROVAL = 'customer_approval',
  CUSTOMER_REJECTION = 'customer_rejection',
  SYSTEM_ANNOUNCEMENT = 'system_announcement'
}

// Notification priority enum
export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// Notification interface extending BaseModel
export interface INotification extends BaseModel {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  isRead: boolean;
  readAt?: Date;
  actionUrl?: string; // URL to navigate to when notification is clicked
  metadata?: Record<string, any>; // Additional data for the notification
  expiresAt?: Date; // Optional expiration date
}

// Notification document interface for Mongoose
export interface INotificationDocument extends Omit<INotification, '_id'>, Document {
  _id: mongoose.Types.ObjectId;
}

// Notification schema definition
const notificationSchema = new Schema<INotificationDocument>({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    index: true
  },
  type: {
    type: String,
    enum: Object.values(NotificationType),
    required: [true, 'Notification type is required'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  priority: {
    type: String,
    enum: Object.values(NotificationPriority),
    default: NotificationPriority.MEDIUM,
    index: true
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date,
    default: null
  },
  actionUrl: {
    type: String,
    trim: true,
    maxlength: [500, 'Action URL cannot exceed 500 characters']
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  expiresAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'modifiedAt' },
  versionKey: false
});

// Compound indexes for optimized queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1, createdAt: -1 });
notificationSchema.index({ priority: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to create notification
notificationSchema.statics.createNotification = async function(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  options: {
    priority?: NotificationPriority;
    actionUrl?: string;
    metadata?: Record<string, any>;
    expiresAt?: Date;
  } = {}
) {
  const notification = new this({
    userId,
    type,
    title,
    message,
    priority: options.priority || NotificationPriority.MEDIUM,
    actionUrl: options.actionUrl,
    metadata: options.metadata || {},
    expiresAt: options.expiresAt
  });

  await notification.save();
  return notification;
};

// Static method to get user notifications
notificationSchema.statics.getUserNotifications = function(
  userId: string,
  options: {
    page?: number;
    limit?: number;
    isRead?: boolean;
    type?: NotificationType;
    priority?: NotificationPriority;
  } = {}
) {
  const { page = 1, limit = 20, isRead, type, priority } = options;
  const skip = (page - 1) * limit;

  const filter: any = { userId };
  if (isRead !== undefined) filter.isRead = isRead;
  if (type) filter.type = type;
  if (priority) filter.priority = priority;

  return this.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

// Static method to mark notifications as read
notificationSchema.statics.markAsRead = function(notificationIds: string[], userId: string) {
  return this.updateMany(
    { _id: { $in: notificationIds }, userId },
    { 
      isRead: true, 
      readAt: new Date() 
    }
  );
};

// Static method to mark all user notifications as read
notificationSchema.statics.markAllAsRead = function(userId: string) {
  return this.updateMany(
    { userId, isRead: false },
    { 
      isRead: true, 
      readAt: new Date() 
    }
  );
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = function(userId: string) {
  return this.countDocuments({ userId, isRead: false });
};

// Static method to delete expired notifications
notificationSchema.statics.deleteExpired = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Instance method to check if expired
notificationSchema.methods.isExpired = function() {
  return this.expiresAt && this.expiresAt < new Date();
};

// Static methods interface
interface INotificationModel extends mongoose.Model<INotificationDocument> {
  createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    options?: {
      priority?: NotificationPriority;
      actionUrl?: string;
      metadata?: Record<string, any>;
      expiresAt?: Date;
    }
  ): Promise<INotificationDocument>;
  
  getUserNotifications(
    userId: string,
    options?: {
      page?: number;
      limit?: number;
      isRead?: boolean;
      type?: NotificationType;
      priority?: NotificationPriority;
    }
  ): Promise<INotificationDocument[]>;
  
  markAsRead(notificationIds: string[], userId: string): Promise<any>;
  markAllAsRead(userId: string): Promise<any>;
  getUnreadCount(userId: string): Promise<number>;
  deleteExpired(): Promise<any>;
}

// Export the Notification model
export const Notification = mongoose.model<INotificationDocument, INotificationModel>('Notification', notificationSchema);

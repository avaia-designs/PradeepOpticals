import { Router } from 'express';
import {
  getUserNotifications,
  markNotificationsAsRead,
  markAllNotificationsAsRead,
  getUnreadCount,
  deleteNotification,
  createNotification,
  getNotificationById
} from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   GET /api/v1/notifications
 * @desc    Get user notifications
 * @access  Private (All authenticated users)
 */
router.get('/', authenticate, getUserNotifications);

/**
 * @route   GET /api/v1/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private (All authenticated users)
 */
router.get('/unread-count', authenticate, getUnreadCount);

/**
 * @route   GET /api/v1/notifications/:id
 * @desc    Get notification by ID
 * @access  Private (All authenticated users)
 */
router.get('/:id', authenticate, getNotificationById);

/**
 * @route   PUT /api/v1/notifications/mark-read
 * @desc    Mark specific notifications as read
 * @access  Private (All authenticated users)
 */
router.put('/mark-read', authenticate, markNotificationsAsRead);

/**
 * @route   PUT /api/v1/notifications/mark-all-read
 * @desc    Mark all notifications as read
 * @access  Private (All authenticated users)
 */
router.put('/mark-all-read', authenticate, markAllNotificationsAsRead);

/**
 * @route   POST /api/v1/notifications
 * @desc    Create notification (Staff/Admin only)
 * @access  Private (Staff, Admin)
 */
router.post('/', authenticate, authorize(['staff', 'admin']), createNotification);

/**
 * @route   DELETE /api/v1/notifications/:id
 * @desc    Delete notification
 * @access  Private (All authenticated users)
 */
router.delete('/:id', authenticate, deleteNotification);

export default router;

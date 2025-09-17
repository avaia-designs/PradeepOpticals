import { Router } from 'express';
import {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getSystemLogs,
  getNotificationStats
} from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   GET /api/v1/admin/dashboard
 * @desc    Get admin dashboard statistics
 * @access  Private (Admin)
 */
router.get('/dashboard', authenticate, authorize(['admin']), getDashboardStats);

/**
 * @route   GET /api/v1/admin/users
 * @desc    Get all users with pagination
 * @access  Private (Admin)
 */
router.get('/users', authenticate, authorize(['admin']), getAllUsers);

/**
 * @route   GET /api/v1/admin/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin)
 */
router.get('/users/:id', authenticate, authorize(['admin']), getUserById);

/**
 * @route   PUT /api/v1/admin/users/:id
 * @desc    Update user
 * @access  Private (Admin)
 */
router.put('/users/:id', authenticate, authorize(['admin']), updateUser);

/**
 * @route   DELETE /api/v1/admin/users/:id
 * @desc    Delete user
 * @access  Private (Admin)
 */
router.delete('/users/:id', authenticate, authorize(['admin']), deleteUser);

/**
 * @route   GET /api/v1/admin/logs
 * @desc    Get system logs
 * @access  Private (Admin)
 */
router.get('/logs', authenticate, authorize(['admin']), getSystemLogs);

/**
 * @route   GET /api/v1/admin/notifications/stats
 * @desc    Get notification statistics
 * @access  Private (Admin)
 */
router.get('/notifications/stats', authenticate, authorize(['admin']), getNotificationStats);

export default router;

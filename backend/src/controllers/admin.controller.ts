import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { Appointment } from '../models/Appointment';
import { Quotation } from '../models/Quotation';
import { Notification } from '../models/Notification';
import { ApiResponse } from '../types';

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    role: string;
  };
}

/**
 * Get admin dashboard statistics
 */
export const getDashboardStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userRole = req.user?.role;

    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Access denied. Admin role required.'
      });
    }

    // Get current date and date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get statistics in parallel
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalAppointments,
      totalQuotations,
      monthlyOrders,
      weeklyOrders,
      dailyOrders,
      pendingAppointments,
      pendingQuotations,
      lowStockProducts,
      recentOrders,
      recentAppointments
    ] = await Promise.all([
      // User statistics
      User.countDocuments({ role: 'user' }),
      
      // Product statistics
      Product.countDocuments({ isActive: true }),
      
      // Order statistics
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.countDocuments({ createdAt: { $gte: startOfWeek } }),
      Order.countDocuments({ createdAt: { $gte: startOfDay } }),
      
      // Appointment statistics
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'pending' }),
      
      // Quotation statistics
      Quotation.countDocuments(),
      Quotation.countDocuments({ status: 'pending' }),
      
      // Low stock products (inventory < 10)
      Product.countDocuments({ inventory: { $lt: 10 }, isActive: true }),
      
      // Recent orders (last 10)
      Order.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('orderNumber customerName totalAmount status createdAt')
        .lean(),
      
      // Recent appointments (last 10)
      Appointment.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('appointmentNumber customerName appointmentDate startTime status createdAt')
        .lean()
    ]);

    // Calculate revenue statistics
    const monthlyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const weeklyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfWeek } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const dailyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfDay } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const stats = {
      users: {
        total: totalUsers
      },
      products: {
        total: totalProducts,
        lowStock: lowStockProducts
      },
      orders: {
        total: totalOrders,
        monthly: monthlyOrders,
        weekly: weeklyOrders,
        daily: dailyOrders,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        weeklyRevenue: weeklyRevenue[0]?.total || 0,
        dailyRevenue: dailyRevenue[0]?.total || 0
      },
      appointments: {
        total: totalAppointments,
        pending: pendingAppointments
      },
      quotations: {
        total: totalQuotations,
        pending: pendingQuotations
      },
      recent: {
        orders: recentOrders,
        appointments: recentAppointments
      }
    };

    const response: ApiResponse = {
      success: true,
      data: stats,
      message: 'Dashboard statistics retrieved successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users with pagination (Admin only)
 */
export const getAllUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userRole = req.user?.role;

    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Access denied. Admin role required.'
      });
    }

    const { page = 1, limit = 20, role, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      User.countDocuments(filter)
    ]);

    const response: ApiResponse = {
      success: true,
      data: users,
      message: 'Users retrieved successfully',
      meta: {
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID (Admin only)
 */
export const getUserById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userRole = req.user?.role;

    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Access denied. Admin role required.'
      });
    }

    const { id } = req.params;
    const user = await User.findById(id).select('-password').lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'User not found'
      });
    }

    const response: ApiResponse = {
      success: true,
      data: user,
      message: 'User retrieved successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Update user (Admin only)
 */
export const updateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userRole = req.user?.role;

    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Access denied. Admin role required.'
      });
    }

    const { id } = req.params;
    const { name, email, role, isActive } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'User not found'
      });
    }

    // Update user fields
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    const response: ApiResponse = {
      success: true,
      data: user,
      message: 'User updated successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user (Admin only)
 */
export const deleteUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userRole = req.user?.role;

    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Access denied. Admin role required.'
      });
    }

    const { id } = req.params;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'User not found'
      });
    }

    // Prevent deletion of admin users
    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        error: 'INVALID_OPERATION',
        message: 'Cannot delete admin users'
      });
    }

    await User.findByIdAndDelete(id);

    const response: ApiResponse = {
      success: true,
      data: null,
      message: 'User deleted successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Get system logs (Admin only)
 */
export const getSystemLogs = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userRole = req.user?.role;

    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Access denied. Admin role required.'
      });
    }

    // This would typically connect to a logging service
    // For now, return a placeholder response
    const response: ApiResponse = {
      success: true,
      data: {
        message: 'System logs feature not implemented yet',
        logs: []
      },
      message: 'System logs retrieved successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Get notification statistics (Admin only)
 */
export const getNotificationStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userRole = req.user?.role;

    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Access denied. Admin role required.'
      });
    }

    const [
      totalNotifications,
      unreadNotifications,
      notificationsByType
    ] = await Promise.all([
      Notification.countDocuments(),
      Notification.countDocuments({ isRead: false }),
      Notification.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    const stats = {
      total: totalNotifications,
      unread: unreadNotifications,
      byType: notificationsByType
    };

    const response: ApiResponse = {
      success: true,
      data: stats,
      message: 'Notification statistics retrieved successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

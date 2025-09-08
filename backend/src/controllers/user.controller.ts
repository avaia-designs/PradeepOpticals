import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { AuthenticatedRequest } from '../types';
import { Logger } from '../utils/logger';

/**
 * User controller
 * Handles user management operations
 */
export class UserController {
  /**
   * Create staff account (Admin only)
   * POST /api/v1/users/staff
   */
  static async createStaffAccount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const staffData = req.body;

      const user = await UserService.createStaffAccount(staffData);

      Logger.info('Staff account created successfully', { userId: user._id });

      res.status(201).json({
        success: true,
        data: user,
        message: 'Staff account created successfully'
      });
    } catch (error) {
      Logger.error('Failed to create staff account', error as Error);
      next(error);
    }
  }

  /**
   * Get all users (Admin only)
   * GET /api/v1/users
   */
  static async getAllUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const filters = {
        role: req.query.role as any,
        isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
        search: req.query.search as string
      };

      const result = await UserService.getAllUsers(page, limit, filters);

      Logger.info('All users fetched successfully', { count: result.data.length });

      res.status(200).json({
        success: true,
        data: result.data,
        meta: {
          pagination: result.pagination
        },
        message: 'Users retrieved successfully'
      });
    } catch (error) {
      Logger.error('Failed to fetch all users', error as Error);
      next(error);
    }
  }

  /**
   * Get user by ID
   * GET /api/v1/users/:id
   */
  static async getUserById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const user = await UserService.getUserById(id);

      Logger.info('User fetched successfully', { userId: id });

      res.status(200).json({
        success: true,
        data: user,
        message: 'User retrieved successfully'
      });
    } catch (error) {
      Logger.error('Failed to fetch user', error as Error);
      next(error);
    }
  }

  /**
   * Update user (Admin only)
   * PUT /api/v1/users/:id
   */
  static async updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const user = await UserService.updateUser(id, updateData);

      Logger.info('User updated successfully', { userId: id });

      res.status(200).json({
        success: true,
        data: user,
        message: 'User updated successfully'
      });
    } catch (error) {
      Logger.error('Failed to update user', error as Error);
      next(error);
    }
  }

  /**
   * Delete user (Admin only)
   * DELETE /api/v1/users/:id
   */
  static async deleteUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      await UserService.deleteUser(id);

      Logger.info('User deleted successfully', { userId: id });

      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      Logger.error('Failed to delete user', error as Error);
      next(error);
    }
  }

  /**
   * Get user statistics (Admin only)
   * GET /api/v1/users/statistics
   */
  static async getUserStatistics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const statistics = await UserService.getUserStatistics();

      Logger.info('User statistics fetched successfully');

      res.status(200).json({
        success: true,
        data: statistics,
        message: 'User statistics retrieved successfully'
      });
    } catch (error) {
      Logger.error('Failed to fetch user statistics', error as Error);
      next(error);
    }
  }

  /**
   * Get staff members (Admin only)
   * GET /api/v1/users/staff
   */
  static async getStaffMembers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await UserService.getStaffMembers(page, limit);

      Logger.info('Staff members fetched successfully', { count: result.data.length });

      res.status(200).json({
        success: true,
        data: result.data,
        meta: {
          pagination: result.pagination
        },
        message: 'Staff members retrieved successfully'
      });
    } catch (error) {
      Logger.error('Failed to fetch staff members', error as Error);
      next(error);
    }
  }

  /**
   * Get customers (Admin only)
   * GET /api/v1/users/customers
   */
  static async getCustomers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await UserService.getCustomers(page, limit);

      Logger.info('Customers fetched successfully', { count: result.data.length });

      res.status(200).json({
        success: true,
        data: result.data,
        meta: {
          pagination: result.pagination
        },
        message: 'Customers retrieved successfully'
      });
    } catch (error) {
      Logger.error('Failed to fetch customers', error as Error);
      next(error);
    }
  }
}

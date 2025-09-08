import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthenticatedRequest } from '../types';
import { Logger } from '../utils/logger';

/**
 * Authentication controller
 * Handles user registration, login, and profile management
 */
export class AuthController {
  /**
   * Register a new user
   * POST /api/v1/auth/register
   */
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, name, phone } = req.body;

      const result = await AuthService.register({
        email,
        password,
        name,
        phone
      });

      Logger.info('User registration successful', { email, userId: result.user.id });

      res.status(201).json({
        success: true,
        data: result,
        message: 'User registered successfully'
      });
    } catch (error) {
      Logger.error('User registration failed', error as Error);
      next(error);
    }
  }

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      const result = await AuthService.login({
        email,
        password
      });

      Logger.info('User login successful', { email, userId: result.user.id });

      res.status(200).json({
        success: true,
        data: result,
        message: 'Login successful'
      });
    } catch (error) {
      Logger.error('User login failed', error as Error);
      next(error);
    }
  }

  /**
   * Get current user profile
   * GET /api/v1/auth/profile
   */
  static async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user.id;

      // Get user from database to ensure we have latest data
      const { User } = await import('../models');
      const user = await User.findById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          profile: user.profile,
          isActive: user.isActive,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt
        },
        message: 'Profile retrieved successfully'
      });
    } catch (error) {
      Logger.error('Get profile failed', error as Error);
      next(error);
    }
  }

  /**
   * Update user profile
   * PUT /api/v1/auth/profile
   */
  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user.id;
      const { name, phone, dateOfBirth } = req.body;

      const result = await AuthService.updateProfile(userId, {
        name,
        phone,
        dateOfBirth
      });

      Logger.info('Profile update successful', { userId });

      res.status(200).json({
        success: true,
        data: result,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      Logger.error('Profile update failed', error as Error);
      next(error);
    }
  }

  /**
   * Change password
   * PUT /api/v1/auth/change-password
   */
  static async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      await AuthService.changePassword(userId, currentPassword, newPassword);

      Logger.info('Password change successful', { userId });

      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      Logger.error('Password change failed', error as Error);
      next(error);
    }
  }

  /**
   * Reset user password (Admin only)
   * PUT /api/v1/auth/reset-password/:userId
   */
  static async resetPassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const { newPassword } = req.body;
      const adminId = req.user.id;

      await AuthService.resetPassword(userId, newPassword, adminId);

      Logger.info('Password reset successful', { userId, adminId });

      res.status(200).json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      Logger.error('Password reset failed', error as Error);
      next(error);
    }
  }

  /**
   * Logout user (client-side token removal)
   * POST /api/v1/auth/logout
   */
  static async logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // In a JWT-based system, logout is typically handled client-side
      // by removing the token from storage. This endpoint can be used
      // for logging purposes or future token blacklisting if needed.

      Logger.info('User logout', { userId: req.user.id });

      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      Logger.error('Logout failed', error as Error);
      next(error);
    }
  }
}

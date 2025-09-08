import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { UserRole } from '../types';
import { Logger } from '../utils/logger';
import { Config } from '../utils/config';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    profile: {
      avatar?: string;
      phone?: string;
      dateOfBirth?: Date;
    };
  };
  token: string;
}

export class AuthService {
  private static readonly SALT_ROUNDS = 12;

  /**
   * Register a new user
   */
  static async register(data: RegisterData): Promise<AuthResponse> {
    try {
      Logger.info('Starting user registration', { email: data.email });

      // Check if user already exists
      const existingUser = await User.findOne({ email: data.email.toLowerCase() });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, this.SALT_ROUNDS);

      // Create new user
      const user = new User({
        email: data.email.toLowerCase(),
        password: hashedPassword,
        name: data.name,
        role: UserRole.USER,
        profile: {
          phone: data.phone
        }
      });

      await user.save();

      Logger.info('User registered successfully', { userId: user._id, email: user.email });

      // Generate JWT token
      const token = this.generateToken(user);

      return {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          profile: user.profile
        },
        token
      };
    } catch (error) {
      Logger.error('User registration failed', error as Error, { email: data.email });
      throw error;
    }
  }

  /**
   * Login user
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      Logger.info('Starting user login', { email: credentials.email });

      // Find user by email
      const user = await User.findOne({ email: credentials.email.toLowerCase() });
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new Error('Account is deactivated. Please contact support.');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      user.lastLoginAt = new Date();
      await user.save();

      Logger.info('User logged in successfully', { userId: user._id, email: user.email });

      // Generate JWT token
      const token = this.generateToken(user);

      return {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          profile: user.profile
        },
        token
      };
    } catch (error) {
      Logger.error('User login failed', error as Error, { email: credentials.email });
      throw error;
    }
  }

  /**
   * Verify JWT token
   */
  static async verifyToken(token: string): Promise<{ id: string; email: string; role: UserRole }> {
    try {
      const config = Config.get();
      const decoded = jwt.verify(token, config.JWT_SECRET) as any;

      // Find user to ensure they still exist and are active
      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw new Error('Invalid token');
      }

      return {
        id: user._id.toString(),
        email: user.email,
        role: user.role
      };
    } catch (error) {
      Logger.error('Token verification failed', error as Error);
      throw new Error('Invalid token');
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updateData: {
    name?: string;
    phone?: string;
    dateOfBirth?: Date;
  }): Promise<AuthResponse> {
    try {
      Logger.info('Starting profile update', { userId });

      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Update profile fields
      if (updateData.name) user.name = updateData.name;
      if (updateData.phone) user.profile.phone = updateData.phone;
      if (updateData.dateOfBirth) user.profile.dateOfBirth = updateData.dateOfBirth;

      await user.save();

      Logger.info('Profile updated successfully', { userId });

      // Generate new token
      const token = this.generateToken(user);

      return {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          profile: user.profile
        },
        token
      };
    } catch (error) {
      Logger.error('Profile update failed', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Change password
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      Logger.info('Starting password change', { userId });

      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
      user.password = hashedNewPassword;

      await user.save();

      Logger.info('Password changed successfully', { userId });
    } catch (error) {
      Logger.error('Password change failed', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Reset password (Admin only)
   */
  static async resetPassword(userId: string, newPassword: string, adminId: string): Promise<void> {
    try {
      Logger.info('Starting password reset', { userId, adminId });

      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
      user.password = hashedPassword;

      await user.save();

      Logger.info('Password reset successfully', { userId, adminId });
    } catch (error) {
      Logger.error('Password reset failed', error as Error, { userId, adminId });
      throw error;
    }
  }

  /**
   * Generate JWT token
   */
  private static generateToken(user: any): string {
    const config = Config.get();
    return jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role
      },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );
  }
}

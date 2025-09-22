import { User } from '../models';
import { PaginatedResult, UserRole } from '../types';
import { Logger } from '../utils/logger';
import bcrypt from 'bcryptjs';

export interface CreateStaffData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: UserRole;
}

export interface UserFilters {
  role?: UserRole;
  isActive?: boolean;
  search?: string;
}

export class UserService {
  private static readonly SALT_ROUNDS = 12;

  /**
   * Create staff account (Admin only)
   */
  static async createStaffAccount(data: CreateStaffData): Promise<any> {
    try {
      Logger.info('Creating staff account', { email: data.email, role: data.role });

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
        role: data.role,
        profile: {
          phone: data.phone
        }
      });

      await user.save();

      Logger.info('Staff account created successfully', { userId: user._id, email: user.email });
      return user;
    } catch (error) {
      Logger.error('Failed to create staff account', error as Error, { email: data.email });
      throw error;
    }
  }

  /**
   * Get all users (Admin only)
   */
  static async getAllUsers(
    page: number = 1,
    limit: number = 20,
    filters: UserFilters = {}
  ): Promise<PaginatedResult<any>> {
    try {
      Logger.info('Fetching all users', { page, limit, filters });

      const skip = (page - 1) * limit;
      const query: any = {};

      // Apply filters
      if (filters.role) {
        query.role = filters.role;
      }
      if (filters.isActive !== undefined) {
        query.isActive = filters.isActive;
      }
      if (filters.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { email: { $regex: filters.search, $options: 'i' } }
        ];
      }

      const [users, total] = await Promise.all([
        User.find(query)
          .select('-password -__v')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        User.countDocuments(query).exec()
      ]);

      const result: PaginatedResult<any> = {
        data: users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

      Logger.info('All users fetched successfully', { count: users.length });
      return result;
    } catch (error) {
      Logger.error('Failed to fetch all users', error as Error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: string): Promise<any> {
    try {
      Logger.info('Fetching user by ID', { userId: id });

      const user = await User.findById(id)
        .select('-password -__v')
        .lean()
        .exec();

      if (!user) {
        throw new Error('User not found');
      }

      Logger.info('User fetched successfully', { userId: id });
      return user;
    } catch (error) {
      Logger.error('Failed to fetch user', error as Error, { userId: id });
      throw error;
    }
  }

  /**
   * Get staff names by IDs
   */
  static async getStaffNamesByIds(staffIds: string[]): Promise<Record<string, string>> {
    try {
      Logger.info('Fetching staff names by IDs', { staffIds });

      const staff = await User.find({
        _id: { $in: staffIds },
        role: { $in: ['staff', 'admin'] }
      })
        .select('_id name')
        .lean()
        .exec();

      const staffNames: Record<string, string> = {};
      staff.forEach(member => {
        staffNames[member._id.toString()] = member.name;
      });

      Logger.info('Staff names fetched successfully', { count: staff.length });
      return staffNames;
    } catch (error) {
      Logger.error('Failed to fetch staff names', error as Error, { staffIds });
      throw error;
    }
  }

  /**
   * Update user (Admin only)
   */
  static async updateUser(id: string, updateData: any): Promise<any> {
    try {
      Logger.info('Updating user', { userId: id });

      const user = await User.findById(id);
      if (!user) {
        throw new Error('User not found');
      }

      // Don't allow updating password through this method
      if (updateData.password) {
        delete updateData.password;
      }

      Object.assign(user, updateData);
      await user.save();

      Logger.info('User updated successfully', { userId: id });
      return user;
    } catch (error) {
      Logger.error('Failed to update user', error as Error, { userId: id });
      throw error;
    }
  }

  /**
   * Delete user (Admin only) - Soft delete
   */
  static async deleteUser(id: string): Promise<void> {
    try {
      Logger.info('Deleting user', { userId: id });

      const user = await User.findById(id);
      if (!user) {
        throw new Error('User not found');
      }

      // Soft delete - deactivate user
      user.isActive = false;
      await user.save();

      Logger.info('User deleted successfully', { userId: id });
    } catch (error) {
      Logger.error('Failed to delete user', error as Error, { userId: id });
      throw error;
    }
  }

  /**
   * Get user statistics (Admin only)
   */
  static async getUserStatistics(): Promise<any> {
    try {
      Logger.info('Fetching user statistics');

      const [
        totalUsers,
        activeUsers,
        inactiveUsers,
        userRoleBreakdown,
        recentUsers
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ isActive: false }),
        User.aggregate([
          { $group: { _id: '$role', count: { $sum: 1 } } }
        ]),
        User.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
        })
      ]);

      const statistics = {
        totalUsers,
        activeUsers,
        inactiveUsers,
        roleBreakdown: userRoleBreakdown.reduce((acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        recentUsers
      };

      Logger.info('User statistics fetched successfully');
      return statistics;
    } catch (error) {
      Logger.error('Failed to fetch user statistics', error as Error);
      throw error;
    }
  }

  /**
   * Get staff members (Admin only)
   */
  static async getStaffMembers(page: number = 1, limit: number = 20): Promise<PaginatedResult<any>> {
    try {
      Logger.info('Fetching staff members', { page, limit });

      const skip = (page - 1) * limit;

      const [staff, total] = await Promise.all([
        User.find({ role: { $in: ['staff', 'admin'] } })
          .select('-password -__v')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        User.countDocuments({ role: { $in: ['staff', 'admin'] } }).exec()
      ]);

      const result: PaginatedResult<any> = {
        data: staff,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

      Logger.info('Staff members fetched successfully', { count: staff.length });
      return result;
    } catch (error) {
      Logger.error('Failed to fetch staff members', error as Error);
      throw error;
    }
  }

  /**
   * Get customers (Admin only)
   */
  static async getCustomers(page: number = 1, limit: number = 20): Promise<PaginatedResult<any>> {
    try {
      Logger.info('Fetching customers', { page, limit });

      const skip = (page - 1) * limit;

      const [customers, total] = await Promise.all([
        User.find({ role: 'user' })
          .select('-password -__v')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        User.countDocuments({ role: 'user' }).exec()
      ]);

      const result: PaginatedResult<any> = {
        data: customers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

      Logger.info('Customers fetched successfully', { count: customers.length });
      return result;
    } catch (error) {
      Logger.error('Failed to fetch customers', error as Error);
      throw error;
    }
  }
}
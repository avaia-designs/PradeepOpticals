#!/usr/bin/env bun

/**
 * Database seeding script to create initial admin account
 * Usage: bun run src/scripts/seed-admin.ts
 */

import bcrypt from 'bcryptjs';
import { database } from '../utils/database';
import { User } from '../models/User';
import { UserRole } from '../types';
import { Logger } from '../utils/logger';

interface AdminUserData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

const ADMIN_DATA: AdminUserData = {
  email: 'admin@gmail.com',
  password: 'Test1234@',
  name: 'System Administrator',
  role: UserRole.ADMIN
};

const STAFF_DATA: AdminUserData = {
  email: 'staff@gmail.com',
  password: 'Test1234@',
  name: 'Staff Member',
  role: UserRole.STAFF
};

/**
 * Hash password using bcrypt
 */
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Check if admin user already exists
 */
async function adminExists(email: string): Promise<boolean> {
  try {
    const existingAdmin = await User.findOne({ email: email.toLowerCase() });
    return !!existingAdmin;
  } catch (error) {
    Logger.error('Error checking if admin exists', error as Error);
    return false;
  }
}

/**
 * Create user (admin or staff)
 */
async function createUser(userData: AdminUserData): Promise<void> {
  try {
    // Check if user already exists
    const exists = await adminExists(userData.email);
    if (exists) {
      Logger.warn('User already exists', { email: userData.email });
      console.log('❌ User already exists with email:', userData.email);
      return;
    }

    // Hash the password
    const hashedPassword = await hashPassword(userData.password);

    // Create user
    const user = new User({
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      name: userData.name,
      role: userData.role,
      profile: {
        avatar: null,
        phone: null,
        dateOfBirth: null
      },
      isActive: true,
      lastLoginAt: null
    });

    // Save to database
    await user.save();

    Logger.info('User created successfully', {
      email: userData.email,
      role: userData.role,
      userId: user._id
    });

    console.log('✅ User created successfully!');
    console.log('📧 Email:', userData.email);
    console.log('🔑 Password:', userData.password);
    console.log('👤 Role:', userData.role);
    console.log('🆔 User ID:', user._id);

  } catch (error) {
    Logger.error('Failed to create user', error as Error);
    console.error('❌ Failed to create user:', error);
    throw error;
  }
}

/**
 * Main seeding function
 */
async function seedAdmin(): Promise<void> {
  try {
    console.log('🌱 Starting admin and staff user seeding...');
    
    // Connect to database
    await database.connect();
    console.log('📊 Connected to database');

    // Create admin user
    console.log('👑 Creating admin user...');
    await createUser(ADMIN_DATA);

    // Create staff user
    console.log('👨‍💼 Creating staff user...');
    await createUser(STAFF_DATA);

    console.log('🎉 User seeding completed successfully!');
    console.log('');
    console.log('🔐 You can now login with:');
    console.log('   Admin: admin@gmail.com / Test1234@');
    console.log('   Staff: staff@gmail.com / Test1234@');
    console.log('');

  } catch (error) {
    Logger.error('User seeding failed', error as Error);
    console.error('❌ User seeding failed:', error);
    process.exit(1);
  } finally {
    // Disconnect from database
    await database.disconnect();
    console.log('📊 Disconnected from database');
    process.exit(0);
  }
}

// Run the seeding script
if (import.meta.main) {
  seedAdmin().catch((error) => {
    console.error('💥 Seeding script failed:', error);
    process.exit(1);
  });
}

export { seedAdmin, createUser, adminExists };

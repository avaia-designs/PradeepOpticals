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
  password: 'Admin1234@',
  name: 'System Administrator',
  role: UserRole.ADMIN
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
 * Create admin user
 */
async function createAdminUser(adminData: AdminUserData): Promise<void> {
  try {
    // Check if admin already exists
    const exists = await adminExists(adminData.email);
    if (exists) {
      Logger.warn('Admin user already exists', { email: adminData.email });
      console.log('❌ Admin user already exists with email:', adminData.email);
      return;
    }

    // Hash the password
    const hashedPassword = await hashPassword(adminData.password);

    // Create admin user
    const adminUser = new User({
      email: adminData.email.toLowerCase(),
      password: hashedPassword,
      name: adminData.name,
      role: adminData.role,
      profile: {
        avatar: null,
        phone: null,
        dateOfBirth: null
      },
      isActive: true,
      lastLoginAt: null
    });

    // Save to database
    await adminUser.save();

    Logger.info('Admin user created successfully', {
      email: adminData.email,
      role: adminData.role,
      userId: adminUser._id
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Password:', adminData.password);
    console.log('👤 Role:', adminData.role);
    console.log('🆔 User ID:', adminUser._id);

  } catch (error) {
    Logger.error('Failed to create admin user', error as Error);
    console.error('❌ Failed to create admin user:', error);
    throw error;
  }
}

/**
 * Main seeding function
 */
async function seedAdmin(): Promise<void> {
  try {
    console.log('🌱 Starting admin user seeding...');
    
    // Connect to database
    await database.connect();
    console.log('📊 Connected to database');

    // Create admin user
    await createAdminUser(ADMIN_DATA);

    console.log('🎉 Admin seeding completed successfully!');
    console.log('');
    console.log('🔐 You can now login with:');
    console.log('   Email: admin@gmail.com');
    console.log('   Password: Admin1234@');
    console.log('');

  } catch (error) {
    Logger.error('Admin seeding failed', error as Error);
    console.error('❌ Admin seeding failed:', error);
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

export { seedAdmin, createAdminUser, adminExists };

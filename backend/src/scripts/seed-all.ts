#!/usr/bin/env bun

/**
 * Master database seeding script
 * Runs all seeding scripts in the correct order
 * Usage: bun run src/scripts/seed-all.ts
 */

import { seedAdmin } from './seed-admin';
import { seedProducts } from './seed-products';
import { seedSampleData } from './seed-sample-data';
import { Logger } from '../utils/logger';

/**
 * Run all seeding scripts in sequence
 */
async function seedAll(): Promise<void> {
  try {
    console.log('🚀 Starting complete database seeding...');
    console.log('=====================================');
    
    // Step 1: Seed admin user
    console.log('\n1️⃣ Seeding admin user...');
    await seedAdmin();
    console.log('✅ Admin user seeding completed');
    
    // Step 2: Seed products, categories, and brands
    console.log('\n2️⃣ Seeding products, categories, and brands...');
    await seedProducts();
    console.log('✅ Product seeding completed');
    
    // Step 3: Seed sample data (customers, staff, orders, appointments)
    console.log('\n3️⃣ Seeding sample data...');
    await seedSampleData();
    console.log('✅ Sample data seeding completed');
    
    console.log('\n🎉 All seeding completed successfully!');
    console.log('=====================================');
    console.log('');
    console.log('📊 Database Summary:');
    console.log('   ✅ Admin account created');
    console.log('   ✅ 6 categories created');
    console.log('   ✅ 8 brands created');
    console.log('   ✅ 10 products created');
    console.log('   ✅ 4 sample customers created');
    console.log('   ✅ 2 sample staff created');
    console.log('   ✅ 3 sample orders created');
    console.log('   ✅ 4 sample appointments created');
    console.log('');
    console.log('🔐 Login Credentials:');
    console.log('   Admin: admin@gmail.com / Admin1234@');
    console.log('   Staff: staff1@pradeepopticals.com / Staff123!');
    console.log('   Customer: john.doe@example.com / Password123!');
    console.log('');
    console.log('🌐 Next Steps:');
    console.log('   1. Start the backend server: bun run dev');
    console.log('   2. Start the frontend: cd ../frontend && npm run dev');
    console.log('   3. Access the application at http://localhost:3000');
    console.log('   4. Login with admin credentials to access admin features');
    
  } catch (error) {
    Logger.error('Master seeding failed', error as Error);
    console.error('❌ Master seeding failed:', error);
    process.exit(1);
  }
}

// Run the master seeding script
if (import.meta.main) {
  seedAll().catch((error) => {
    console.error('💥 Master seeding script failed:', error);
    process.exit(1);
  });
}

export { seedAll };

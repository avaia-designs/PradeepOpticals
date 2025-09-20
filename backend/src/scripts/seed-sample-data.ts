#!/usr/bin/env bun

/**
 * Database seeding script for sample data (orders, appointments, etc.)
 * Usage: bun run src/scripts/seed-sample-data.ts
 */

import { database } from '../utils/database';
import { User, UserRole } from '../models';
import { Order, OrderStatus } from '../models';
import { Appointment, AppointmentStatus } from '../models';
import { Product } from '../models';
import { Logger } from '../utils/logger';
import bcrypt from 'bcryptjs';

interface SampleOrder {
  userId: string;
  orderNumber: string;
  items: Array<{
    productId: string;
    productName: string;
    productImage: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
  };
  paymentMethod: string;
  notes?: string;
  isWalkIn: boolean;
}

interface SampleAppointment {
  userId: string;
  appointmentNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  appointmentDate: Date;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  reason: string;
  notes?: string;
}

/**
 * Create sample customers
 */
async function createSampleCustomers(): Promise<string[]> {
  const customerIds: string[] = [];
  
  const customers = [
    {
      email: 'john.doe@example.com',
      password: 'Password123!',
      name: 'John Doe',
      role: UserRole.USER,
      profile: {
        phone: '+1-555-0123',
        dateOfBirth: new Date('1990-05-15')
      }
    },
    {
      email: 'jane.smith@example.com',
      password: 'Password123!',
      name: 'Jane Smith',
      role: UserRole.USER,
      profile: {
        phone: '+1-555-0124',
        dateOfBirth: new Date('1985-08-22')
      }
    },
    {
      email: 'mike.wilson@example.com',
      password: 'Password123!',
      name: 'Mike Wilson',
      role: UserRole.USER,
      profile: {
        phone: '+1-555-0125',
        dateOfBirth: new Date('1992-12-10')
      }
    },
    {
      email: 'sarah.johnson@example.com',
      password: 'Password123!',
      name: 'Sarah Johnson',
      role: UserRole.USER,
      profile: {
        phone: '+1-555-0126',
        dateOfBirth: new Date('1988-03-18')
      }
    }
  ];

  for (const customerData of customers) {
    try {
      const existingUser = await User.findOne({ email: customerData.email });
      if (existingUser) {
        customerIds.push(existingUser._id.toString());
        Logger.info('Customer already exists', { email: customerData.email });
        continue;
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(customerData.password, 12);

      const customer = new User({
        ...customerData,
        password: hashedPassword
      });
      await customer.save();
      customerIds.push(customer._id.toString());
      
      Logger.info('Customer created', { name: customerData.name, email: customerData.email });
    } catch (error) {
      Logger.error('Failed to create customer', error as Error, { email: customerData.email });
    }
  }
  
  return customerIds;
}

/**
 * Create sample staff members
 */
async function createSampleStaff(): Promise<string[]> {
  const staffIds: string[] = [];
  
  const staffMembers = [
    {
      email: 'staff1@pradeepopticals.com',
      password: 'Staff123!',
      name: 'Alice Cooper',
      role: UserRole.STAFF,
      profile: {
        phone: '+1-555-0201',
        dateOfBirth: new Date('1985-06-15')
      }
    },
    {
      email: 'staff2@pradeepopticals.com',
      password: 'Staff123!',
      name: 'Bob Martinez',
      role: UserRole.STAFF,
      profile: {
        phone: '+1-555-0202',
        dateOfBirth: new Date('1990-09-22')
      }
    }
  ];

  for (const staffData of staffMembers) {
    try {
      const existingUser = await User.findOne({ email: staffData.email });
      if (existingUser) {
        staffIds.push(existingUser._id.toString());
        Logger.info('Staff already exists', { email: staffData.email });
        continue;
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(staffData.password, 12);

      const staff = new User({
        ...staffData,
        password: hashedPassword
      });
      await staff.save();
      staffIds.push(staff._id.toString());
      
      Logger.info('Staff created', { name: staffData.name, email: staffData.email });
    } catch (error) {
      Logger.error('Failed to create staff', error as Error, { email: staffData.email });
    }
  }
  
  return staffIds;
}

/**
 * Create sample orders
 */
async function createSampleOrders(customerIds: string[], productIds: string[]): Promise<void> {
  const products = await Product.find({ isActive: true }).limit(5);
  
  const sampleOrders: SampleOrder[] = [
    {
      userId: customerIds[0],
      orderNumber: 'ORD-20250101-0001',
      items: [
        {
          productId: products[0]?._id.toString() || '',
          productName: products[0]?.name || 'Classic Black Eyeglasses',
          productImage: products[0]?.images[0] || '',
          quantity: 1,
          unitPrice: 199.99,
          totalPrice: 199.99
        }
      ],
      subtotal: 199.99,
      tax: 16.00,
      shipping: 9.99,
      discount: 0,
      totalAmount: 225.98,
      status: OrderStatus.DELIVERED,
      shippingAddress: {
        firstName: 'John',
        lastName: 'Doe',
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        phone: '+1-555-0123'
      },
      paymentMethod: 'credit_card',
      notes: 'Please handle with care',
      isWalkIn: false
    },
    {
      userId: customerIds[1],
      orderNumber: 'ORD-20250101-0002',
      items: [
        {
          productId: products[1]?._id.toString() || '',
          productName: products[1]?.name || 'Aviator Sunglasses',
          productImage: products[1]?.images[0] || '',
          quantity: 1,
          unitPrice: 299.99,
          totalPrice: 299.99
        },
        {
          productId: products[2]?._id.toString() || '',
          productName: products[2]?.name || 'Blue Light Blocking Glasses',
          productImage: products[2]?.images[0] || '',
          quantity: 1,
          unitPrice: 89.99,
          totalPrice: 89.99
        }
      ],
      subtotal: 389.98,
      tax: 31.20,
      shipping: 0,
      discount: 50.00,
      totalAmount: 371.18,
      status: OrderStatus.SHIPPED,
      shippingAddress: {
        firstName: 'Jane',
        lastName: 'Smith',
        street: '456 Oak Avenue',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        country: 'USA',
        phone: '+1-555-0124'
      },
      paymentMethod: 'paypal',
      isWalkIn: false
    },
    {
      userId: customerIds[2],
      orderNumber: 'ORD-20250101-0003',
      items: [
        {
          productId: products[3]?._id.toString() || '',
          productName: products[3]?.name || 'Sport Sunglasses',
          productImage: products[3]?.images[0] || '',
          quantity: 2,
          unitPrice: 199.99,
          totalPrice: 399.98
        }
      ],
      subtotal: 399.98,
      tax: 32.00,
      shipping: 9.99,
      discount: 0,
      totalAmount: 441.97,
      status: OrderStatus.PROCESSING,
      shippingAddress: {
        firstName: 'Mike',
        lastName: 'Wilson',
        street: '789 Pine Street',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA',
        phone: '+1-555-0125'
      },
      paymentMethod: 'credit_card',
      isWalkIn: false
    }
  ];

  for (const orderData of sampleOrders) {
    try {
      const existingOrder = await Order.findOne({ orderNumber: orderData.orderNumber });
      if (existingOrder) {
        Logger.info('Order already exists', { orderNumber: orderData.orderNumber });
        continue;
      }

      const order = new Order(orderData);
      await order.save();
      
      Logger.info('Order created', { 
        orderNumber: orderData.orderNumber, 
        customerId: orderData.userId,
        totalAmount: orderData.totalAmount
      });
    } catch (error) {
      Logger.error('Failed to create order', error as Error, { orderNumber: orderData.orderNumber });
    }
  }
}

/**
 * Create sample appointments
 */
async function createSampleAppointments(customerIds: string[], staffIds: string[]): Promise<void> {
  const sampleAppointments: SampleAppointment[] = [
    {
      userId: customerIds[0],
      appointmentNumber: 'APT-20250101-1001',
      customerName: 'John Doe',
      customerEmail: 'john.doe@example.com',
      customerPhone: '+1-555-0123',
      appointmentDate: new Date('2025-01-15T10:00:00Z'),
      startTime: '10:00',
      endTime: '10:30',
      status: AppointmentStatus.CONFIRMED,
      reason: 'Annual eye examination and prescription update',
      notes: 'Patient mentioned difficulty reading small print'
    },
    {
      userId: customerIds[1],
      appointmentNumber: 'APT-20250101-1002',
      customerName: 'Jane Smith',
      customerEmail: 'jane.smith@example.com',
      customerPhone: '+1-555-0124',
      appointmentDate: new Date('2025-01-16T14:00:00Z'),
      startTime: '14:00',
      endTime: '14:30',
      status: AppointmentStatus.PENDING,
      reason: 'Frame fitting and lens consultation',
      notes: 'Interested in progressive lenses'
    },
    {
      userId: customerIds[2],
      appointmentNumber: 'APT-20250101-1003',
      customerName: 'Mike Wilson',
      customerEmail: 'mike.wilson@example.com',
      customerPhone: '+1-555-0125',
      appointmentDate: new Date('2025-01-17T11:00:00Z'),
      startTime: '11:00',
      endTime: '11:30',
      status: AppointmentStatus.CONFIRMED,
      reason: 'Contact lens fitting and training',
      notes: 'First time contact lens wearer'
    },
    {
      userId: customerIds[3],
      appointmentNumber: 'APT-20250101-1004',
      customerName: 'Sarah Johnson',
      customerEmail: 'sarah.johnson@example.com',
      customerPhone: '+1-555-0126',
      appointmentDate: new Date('2025-01-18T15:00:00Z'),
      startTime: '15:00',
      endTime: '15:30',
      status: AppointmentStatus.COMPLETED,
      reason: 'Follow-up appointment for new prescription',
      notes: 'Patient satisfied with new glasses'
    }
  ];

  for (const appointmentData of sampleAppointments) {
    try {
      const existingAppointment = await Appointment.findOne({ 
        appointmentNumber: appointmentData.appointmentNumber 
      });
      if (existingAppointment) {
        Logger.info('Appointment already exists', { 
          appointmentNumber: appointmentData.appointmentNumber 
        });
        continue;
      }

      const appointment = new Appointment({
        ...appointmentData,
        staffId: staffIds[0] // Assign to first staff member
      });
      await appointment.save();
      
      Logger.info('Appointment created', { 
        appointmentNumber: appointmentData.appointmentNumber,
        customerName: appointmentData.customerName,
        status: appointmentData.status
      });
    } catch (error) {
      Logger.error('Failed to create appointment', error as Error, { 
        appointmentNumber: appointmentData.appointmentNumber 
      });
    }
  }
}

/**
 * Main seeding function
 */
async function seedSampleData(): Promise<void> {
  try {
    console.log('🌱 Starting sample data seeding...');
    
    // Connect to database
    await database.connect();
    console.log('📊 Connected to database');

    // Create sample customers
    console.log('👥 Creating sample customers...');
    const customerIds = await createSampleCustomers();
    console.log(`✅ Created ${customerIds.length} customers`);

    // Create sample staff
    console.log('👨‍💼 Creating sample staff...');
    const staffIds = await createSampleStaff();
    console.log(`✅ Created ${staffIds.length} staff members`);

    // Get product IDs
    const products = await Product.find({ isActive: true }).limit(5);
    const productIds = products.map(p => p._id.toString());

    // Create sample orders
    console.log('📦 Creating sample orders...');
    await createSampleOrders(customerIds, productIds);
    console.log('✅ Created sample orders');

    // Create sample appointments
    console.log('📅 Creating sample appointments...');
    await createSampleAppointments(customerIds, staffIds);
    console.log('✅ Created sample appointments');

    console.log('🎉 Sample data seeding completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   Customers: ${customerIds.length}`);
    console.log(`   Staff: ${staffIds.length}`);
    console.log(`   Orders: 3`);
    console.log(`   Appointments: 4`);
    console.log('');
    console.log('🔐 Test Accounts:');
    console.log('   Admin: admin@gmail.com / Admin1234@');
    console.log('   Staff: staff1@pradeepopticals.com / Staff123!');
    console.log('   Customer: john.doe@example.com / Password123!');

  } catch (error) {
    Logger.error('Sample data seeding failed', error as Error);
    console.error('❌ Sample data seeding failed:', error);
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
  seedSampleData().catch((error) => {
    console.error('💥 Seeding script failed:', error);
    process.exit(1);
  });
}

export { seedSampleData, createSampleCustomers, createSampleStaff, createSampleOrders, createSampleAppointments };

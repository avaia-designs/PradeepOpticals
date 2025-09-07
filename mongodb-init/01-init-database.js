// MongoDB initialization script for Pradeep Opticals
// This script runs when the MongoDB container starts for the first time

// Switch to the ecommerce database
db = db.getSiblingDB('ecommerce_db');

// Create application user with read/write permissions
db.createUser({
  user: 'ecommerce_user',
  pwd: 'ecommerce_password',
  roles: [
    {
      role: 'readWrite',
      db: 'ecommerce_db'
    }
  ]
});

// Create collections with basic indexes
db.createCollection('users');
db.createCollection('products');
db.createCollection('categories');
db.createCollection('orders');
db.createCollection('cart_items');

// Create indexes for better performance
// Users collection indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1, "createdAt": -1 });
db.users.createIndex({ "isActive": 1, "lastLoginAt": -1 });

// Products collection indexes
db.products.createIndex({ "name": "text", "description": "text" });
db.products.createIndex({ "category": 1, "isActive": 1 });
db.products.createIndex({ "price": 1 });
db.products.createIndex({ "createdAt": -1 });

// Categories collection indexes
db.categories.createIndex({ "name": 1 }, { unique: true });
db.categories.createIndex({ "slug": 1 }, { unique: true });
db.categories.createIndex({ "isActive": 1 });

// Orders collection indexes
db.orders.createIndex({ "userId": 1, "createdAt": -1 });
db.orders.createIndex({ "status": 1, "createdAt": -1 });
db.orders.createIndex({ "orderNumber": 1 }, { unique: true });

// Cart items collection indexes
db.cart_items.createIndex({ "userId": 1 });
db.cart_items.createIndex({ "productId": 1 });

print('Database initialization completed successfully!');
print('Created collections: users, products, categories, orders, cart_items');
print('Created indexes for optimal query performance');
print('Created application user: ecommerce_user');

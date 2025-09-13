# Database Seeding - Pradeep Opticals

This document explains how to seed the database with initial data for development and testing.

## Admin User Seeding

### Overview
The admin seeding script creates an initial administrator account that can be used to access admin features and manage the system.

### Admin Account Details
- **Email**: admin@gmail.com
- **Password**: Admin1234@
- **Role**: admin
- **Name**: System Administrator

### Running the Seeding Script

#### Prerequisites
1. Ensure MongoDB is running (via Docker Compose)
2. Ensure the backend environment is configured
3. Install dependencies: `bun install`

#### Steps

1. **Start the database services:**
   ```bash
   # From project root
   docker-compose up -d
   ```

2. **Run the admin seeding script:**
   ```bash
   # From backend directory
   cd backend
   bun run seed:admin
   ```

3. **Verify the admin account:**
   - Check the console output for success message
   - The admin user will be created in the database
   - You can now login with the admin credentials

### Script Features

- **Duplicate Prevention**: Checks if admin already exists before creating
- **Password Hashing**: Securely hashes the password using bcryptjs
- **Error Handling**: Comprehensive error handling and logging
- **Database Connection**: Automatically connects and disconnects from database
- **Logging**: Detailed logging for debugging and monitoring

### Expected Output

```
🌱 Starting admin user seeding...
📊 Connected to database
✅ Admin user created successfully!
📧 Email: admin@gmail.com
🔑 Password: Admin1234@
👤 Role: admin
🆔 User ID: 507f1f77bcf86cd799439011
🎉 Admin seeding completed successfully!

🔐 You can now login with:
   Email: admin@gmail.com
   Password: Admin1234@

📊 Disconnected from database
```

### Troubleshooting

#### Common Issues

1. **Database Connection Failed**
   - Ensure MongoDB is running: `docker-compose ps`
   - Check MongoDB connection string in `.env`
   - Verify database is accessible

2. **Admin Already Exists**
   - The script will show a warning and skip creation
   - This is normal behavior to prevent duplicates

3. **Permission Errors**
   - Ensure you have write permissions to the database
   - Check MongoDB user permissions

4. **Script Fails to Run**
   - Ensure all dependencies are installed: `bun install`
   - Check TypeScript compilation: `bun run type-check`
   - Verify environment variables are set

### Security Notes

- The admin password is hardcoded for development purposes only
- In production, use a secure password and consider using environment variables
- The script uses bcryptjs with 12 salt rounds for password hashing
- Admin credentials should be changed after initial setup

### Next Steps

After seeding the admin account:

1. **Login to the system** using the admin credentials
2. **Access admin features** (when implemented)
3. **Create additional admin/staff accounts** as needed
4. **Manage inventory and users** through the admin interface

### Development Workflow

1. **Reset Database**: Drop and recreate database if needed
2. **Run Seeding**: Execute the seeding script
3. **Test Admin Features**: Verify admin functionality
4. **Create Test Data**: Add sample products, users, etc.

---

*This seeding script is designed for development and testing purposes. Always use secure practices in production environments.*

# Backend Documentation - Pradeep Opticals

## Overview

The backend is an Express.js API server built with TypeScript and Bun runtime, providing comprehensive e-commerce functionality for the Pradeep Opticals platform. It follows a layered architecture pattern with clear separation of concerns.

## Architecture

### Framework: Express.js with TypeScript
- **Runtime**: Bun (high-performance JavaScript runtime)
- **Language**: TypeScript with strict mode
- **Architecture**: Layered (Routes → Middleware → Controller → Service → Repository)
- **Database**: MongoDB with Mongoose ODM
- **File Storage**: MinIO (S3-compatible object storage)
- **Authentication**: JWT-based with role-based access control

### Project Structure
```
backend/src/
├── models/                  # Mongoose schemas
│   ├── User.ts
│   ├── Product.ts
│   ├── Order.ts
│   ├── Category.ts
│   └── Brand.ts
├── routes/                  # API route definitions
│   ├── auth.ts
│   ├── products.ts
│   ├── users.ts
│   ├── orders.ts
│   ├── cart.ts
│   └── upload.ts
├── controllers/             # Request handlers
│   ├── authController.ts
│   ├── productController.ts
│   ├── userController.ts
│   ├── orderController.ts
│   └── cartController.ts
├── services/                # Business logic layer
│   ├── authService.ts
│   ├── productService.ts
│   ├── userService.ts
│   ├── orderService.ts
│   └── emailService.ts
├── repositories/            # Data access layer
│   ├── userRepository.ts
│   ├── productRepository.ts
│   └── orderRepository.ts
├── middleware/              # Custom middleware
│   ├── auth.ts
│   ├── validation.ts
│   ├── errorHandler.ts
│   ├── rateLimiter.ts
│   └── fileUpload.ts
├── utils/                   # Utility functions
│   ├── logger.ts
│   ├── email.ts
│   ├── fileUpload.ts
│   ├── password.ts
│   └── jwt.ts
├── types/                   # TypeScript definitions
│   ├── auth.ts
│   ├── product.ts
│   ├── user.ts
│   └── common.ts
├── config/                  # Configuration files
│   ├── database.ts
│   ├── minio.ts
│   └── redis.ts
└── index.ts                 # Application entry point
```

## Database Models

### User Model
```typescript
interface IUser extends Document {
  _id: ObjectId;
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin';
  profile: {
    avatar?: string;
    phone?: string;
    dateOfBirth?: Date;
    preferences: {
      theme: 'light' | 'dark';
      notifications: boolean;
    };
  };
  addresses: Address[];
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    index: true 
  },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user',
    index: true 
  },
  profile: {
    avatar: String,
    phone: String,
    dateOfBirth: Date,
    preferences: {
      theme: { type: String, enum: ['light', 'dark'], default: 'light' },
      notifications: { type: Boolean, default: true }
    }
  },
  addresses: [addressSchema],
  isActive: { type: Boolean, default: true, index: true },
  lastLoginAt: Date
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  versionKey: false
});
```

### Product Model
```typescript
interface IProduct extends Document {
  _id: ObjectId;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: {
    _id: ObjectId;
    name: string;
    slug: string;
  };
  brand: {
    _id: ObjectId;
    name: string;
    slug: string;
  };
  variants: ProductVariant[];
  specifications: ProductSpecification[];
  inventory: {
    quantity: number;
    inStock: boolean;
    lowStockThreshold: number;
  };
  rating: {
    average: number;
    count: number;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  status: 'active' | 'inactive' | 'draft';
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true, index: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, min: 0 },
  images: [{ type: String }],
  category: {
    _id: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true }
  },
  brand: {
    _id: { type: Schema.Types.ObjectId, ref: 'Brand', required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true }
  },
  variants: [productVariantSchema],
  specifications: [productSpecificationSchema],
  inventory: {
    quantity: { type: Number, required: true, min: 0 },
    inStock: { type: Boolean, default: true, index: true },
    lowStockThreshold: { type: Number, default: 5 }
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  seo: {
    title: String,
    description: String,
    keywords: [String]
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'draft'], 
    default: 'active',
    index: true 
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  versionKey: false
});
```

### Order Model
```typescript
interface IOrder extends Document {
  _id: ObjectId;
  orderNumber: string;
  userId: ObjectId;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  payment: {
    method: 'credit_card' | 'paypal' | 'apple_pay';
    status: 'pending' | 'completed' | 'failed';
    transactionId?: string;
  };
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  total: {
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
  };
  tracking?: {
    carrier: string;
    trackingNumber: string;
    estimatedDelivery: Date;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>({
  orderNumber: { type: String, required: true, unique: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: [orderItemSchema],
  shippingAddress: addressSchema,
  billingAddress: addressSchema,
  payment: {
    method: { 
      type: String, 
      enum: ['credit_card', 'paypal', 'apple_pay'], 
      required: true 
    },
    status: { 
      type: String, 
      enum: ['pending', 'completed', 'failed'], 
      default: 'pending' 
    },
    transactionId: String
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
    index: true 
  },
  total: {
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, required: true, min: 0 },
    shipping: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 }
  },
  tracking: {
    carrier: String,
    trackingNumber: String,
    estimatedDelivery: Date
  },
  notes: String
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  versionKey: false
});
```

## API Routes

### Authentication Routes (`/api/v1/auth`)
```typescript
// POST /api/v1/auth/login
// User login with email and password
router.post('/login', validateLogin, authController.login);

// POST /api/v1/auth/register
// User registration
router.post('/register', validateRegister, authController.register);

// POST /api/v1/auth/logout
// User logout (token invalidation)
router.post('/logout', authenticate, authController.logout);

// POST /api/v1/auth/refresh
// Refresh JWT token
router.post('/refresh', authController.refreshToken);

// GET /api/v1/auth/me
// Get current user profile
router.get('/me', authenticate, authController.getProfile);
```

### Product Routes (`/api/v1/products`)
```typescript
// GET /api/v1/products
// Get paginated products with filtering
router.get('/', productController.getProducts);

// GET /api/v1/products/:id
// Get single product by ID
router.get('/:id', productController.getProduct);

// GET /api/v1/products/search
// Search products with suggestions
router.get('/search', productController.searchProducts);

// POST /api/v1/products
// Create new product (admin only)
router.post('/', authenticate, authorize('admin'), validateProduct, productController.createProduct);

// PUT /api/v1/products/:id
// Update product (admin only)
router.put('/:id', authenticate, authorize('admin'), validateProduct, productController.updateProduct);

// DELETE /api/v1/products/:id
// Delete product (admin only)
router.delete('/:id', authenticate, authorize('admin'), productController.deleteProduct);
```

### User Routes (`/api/v1/users`)
```typescript
// GET /api/v1/users/profile
// Get user profile
router.get('/profile', authenticate, userController.getProfile);

// PUT /api/v1/users/profile
// Update user profile
router.put('/profile', authenticate, validateProfile, userController.updateProfile);

// GET /api/v1/users/addresses
// Get user addresses
router.get('/addresses', authenticate, userController.getAddresses);

// POST /api/v1/users/addresses
// Add new address
router.post('/addresses', authenticate, validateAddress, userController.addAddress);

// PUT /api/v1/users/addresses/:id
// Update address
router.put('/addresses/:id', authenticate, validateAddress, userController.updateAddress);

// DELETE /api/v1/users/addresses/:id
// Delete address
router.delete('/addresses/:id', authenticate, userController.deleteAddress);
```

### Cart Routes (`/api/v1/cart`)
```typescript
// GET /api/v1/cart
// Get user's cart
router.get('/', authenticate, cartController.getCart);

// POST /api/v1/cart/items
// Add item to cart
router.post('/items', authenticate, validateCartItem, cartController.addItem);

// PUT /api/v1/cart/items/:id
// Update cart item
router.put('/items/:id', authenticate, validateCartItem, cartController.updateItem);

// DELETE /api/v1/cart/items/:id
// Remove item from cart
router.delete('/items/:id', authenticate, cartController.removeItem);

// DELETE /api/v1/cart
// Clear cart
router.delete('/', authenticate, cartController.clearCart);
```

### Order Routes (`/api/v1/orders`)
```typescript
// GET /api/v1/orders
// Get user's orders
router.get('/', authenticate, orderController.getOrders);

// GET /api/v1/orders/:id
// Get single order
router.get('/:id', authenticate, orderController.getOrder);

// POST /api/v1/orders
// Create new order
router.post('/', authenticate, validateOrder, orderController.createOrder);

// PUT /api/v1/orders/:id/cancel
// Cancel order
router.put('/:id/cancel', authenticate, orderController.cancelOrder);
```

## Middleware

### Authentication Middleware
```typescript
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'AUTH_REQUIRED',
        message: 'Authentication required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_TOKEN',
        message: 'Invalid or expired token'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'INVALID_TOKEN',
      message: 'Invalid token'
    });
  }
};
```

### Authorization Middleware
```typescript
export const authorize = (roles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'AUTH_REQUIRED',
        message: 'Authentication required'
      });
    }

    const userRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!userRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};
```

### Validation Middleware
```typescript
export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: error.details[0].message
    });
  }

  next();
};
```

### Rate Limiting Middleware
```typescript
export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS!) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS!) || 100,
  message: {
    success: false,
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
```

## Services

### Auth Service
```typescript
export class AuthService {
  async login(email: string, password: string): Promise<{ user: IUser; token: string }> {
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !user.isActive) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return { user, token };
  }

  async register(userData: RegisterData): Promise<{ user: IUser; token: string }> {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    const user = new User({
      ...userData,
      password: hashedPassword
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return { user, token };
  }
}
```

### Product Service
```typescript
export class ProductService {
  async getProducts(filters: ProductFilters): Promise<PaginatedResult<IProduct>> {
    const {
      page = 1,
      limit = 12,
      category,
      brand,
      minPrice,
      maxPrice,
      inStock,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search
    } = filters;

    const query: any = { status: 'active' };

    if (category) query['category.slug'] = category;
    if (brand) query['brand.slug'] = brand;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = minPrice;
      if (maxPrice) query.price.$lte = maxPrice;
    }
    if (inStock !== undefined) query['inventory.inStock'] = inStock;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category._id', 'name slug')
        .populate('brand._id', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query)
    ]);

    return {
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  }
}
```

## Repositories

### User Repository
```typescript
export class UserRepository {
  async findById(id: string): Promise<IUser | null> {
    return User.findById(id).select('-password').lean();
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email }).select('-password').lean();
  }

  async create(userData: CreateUserData): Promise<IUser> {
    const user = new User(userData);
    await user.save();
    return user;
  }

  async update(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, updateData, { new: true }).select('-password').lean();
  }

  async delete(id: string): Promise<boolean> {
    const result = await User.findByIdAndDelete(id);
    return !!result;
  }

  async findWithPagination(page: number, limit: number, filters: any): Promise<PaginatedResult<IUser>> {
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      User.find(filters)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filters)
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  }
}
```

## Error Handling

### Custom Error Classes
```typescript
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(message, 403);
  }
}
```

### Global Error Handler
```typescript
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (error.code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value';
  }

  // Log error
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(statusCode).json({
    success: false,
    error: error.name || 'INTERNAL_ERROR',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};
```

## File Upload

### MinIO Configuration
```typescript
import { Client } from 'minio';

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT!,
  port: parseInt(process.env.MINIO_PORT!),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY!,
  secretKey: process.env.MINIO_SECRET_KEY!
});

export const uploadFile = async (
  file: Express.Multer.File,
  folder: string = 'uploads'
): Promise<string> => {
  const fileName = `${folder}/${Date.now()}-${file.originalname}`;
  
  await minioClient.putObject(
    process.env.MINIO_BUCKET_NAME!,
    fileName,
    file.buffer,
    file.size,
    {
      'Content-Type': file.mimetype
    }
  );

  return `${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${process.env.MINIO_BUCKET_NAME}/${fileName}`;
};
```

### File Upload Middleware
```typescript
import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE!) || 5 * 1024 * 1024, // 5MB
    files: 5
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = process.env.ALLOWED_FILE_TYPES!.split(',');
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

export const uploadMiddleware = upload.array('files', 5);
```

## Logging

### Winston Logger Configuration
```typescript
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});
```

## Database Indexing

### Product Indexes
```typescript
// Compound indexes for efficient queries
productSchema.index({ 'category.slug': 1, 'status': 1, 'price': 1 });
productSchema.index({ 'brand.slug': 1, 'status': 1 });
productSchema.index({ 'name': 'text', 'description': 'text' });
productSchema.index({ 'status': 1, 'createdAt': -1 });
productSchema.index({ 'inventory.inStock': 1, 'status': 1 });
```

### User Indexes
```typescript
userSchema.index({ 'email': 1 }, { unique: true });
userSchema.index({ 'role': 1, 'isActive': 1 });
userSchema.index({ 'createdAt': -1 });
```

### Order Indexes
```typescript
orderSchema.index({ 'userId': 1, 'createdAt': -1 });
orderSchema.index({ 'orderNumber': 1 }, { unique: true });
orderSchema.index({ 'status': 1, 'createdAt': -1 });
```

## Development Scripts

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "bun --hot src/index.ts",
    "build": "bun build src/index.ts --outdir ./dist --target node",
    "start": "bun dist/index.js",
    "test": "bun test",
    "test:watch": "bun test --watch",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "type-check": "tsc --noEmit",
    "seed": "bun run src/scripts/seed.ts",
    "migrate": "bun run src/scripts/migrate.ts"
  }
}
```

## Environment Variables

### Required Environment Variables
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/ecommerce_db
MONGODB_TEST_URI=mongodb://localhost:27017/ecommerce_test_db

# Server Configuration
PORT=5000
NODE_ENV=development
API_VERSION=v1

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# MinIO Configuration
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET_NAME=ecommerce-uploads
MINIO_USE_SSL=false

# CORS Configuration
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# File Upload Configuration
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=debug
LOG_FILE_PATH=./logs/app.log
```

## Testing

### Test Setup
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { app } from '../src/index';
import { connectDB, disconnectDB } from '../src/config/database';

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

describe('Auth API', () => {
  it('should register a new user', async () => {
    const response = await app.request('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      })
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.user.email).toBe('test@example.com');
  });
});
```

## Performance Optimization

### Database Optimization
- **Connection Pooling**: Mongoose connection pooling
- **Query Optimization**: Proper indexing and lean queries
- **Aggregation Pipelines**: Complex queries with aggregation
- **Caching**: Redis for frequently accessed data

### API Optimization
- **Response Compression**: Gzip compression
- **Pagination**: Efficient pagination for large datasets
- **Field Selection**: Only return required fields
- **Caching Headers**: Proper cache control headers

---

*This backend documentation provides comprehensive information about the Express.js API server architecture, implementation patterns, and development guidelines for AI LLMs to understand and work with the backend codebase effectively.*

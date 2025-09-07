# API Documentation - Pradeep Opticals

## API Overview

The Pradeep Opticals API is a RESTful web service built with Express.js and TypeScript, providing comprehensive e-commerce functionality for eyewear products.

## Base Information

- **Base URL**: `http://localhost:5000/api/v1`
- **Protocol**: HTTP/HTTPS
- **Content Type**: `application/json`
- **Authentication**: JWT Bearer Token
- **Rate Limiting**: 100 requests per 15 minutes per IP

## Authentication

### Authentication Flow

```typescript
// 1. Login Request
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// 2. Login Response
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    },
    "token": "jwt_token_here"
  },
  "message": "Login successful"
}

// 3. Authenticated Request
GET /api/v1/users/profile
Authorization: Bearer jwt_token_here
```

### Authentication Endpoints

#### POST /api/v1/auth/login
User login with email and password.

**Request Body:**
```typescript
{
  email: string;      // Valid email address
  password: string;   // Minimum 8 characters
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    user: User;
    token: string;
  },
  message: string;
}
```

#### POST /api/v1/auth/register
User registration with email, password, and name.

**Request Body:**
```typescript
{
  email: string;      // Valid email address
  password: string;   // Minimum 8 characters
  name: string;       // Minimum 2 characters
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    user: User;
    token: string;
  },
  message: string;
}
```

#### POST /api/v1/auth/logout
User logout (token invalidation).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  success: true,
  message: "Logout successful";
}
```

## Products API

### Product Endpoints

#### GET /api/v1/products
Get paginated list of products with filtering and sorting.

**Query Parameters:**
```typescript
{
  page?: number;           // Page number (default: 1)
  limit?: number;          // Items per page (default: 12)
  category?: string;       // Category slug
  brand?: string;          // Brand slug
  minPrice?: number;       // Minimum price
  maxPrice?: number;       // Maximum price
  inStock?: boolean;       // Filter by stock availability
  sortBy?: string;         // Sort field (name, price, createdAt)
  sortOrder?: 'asc' | 'desc'; // Sort order (default: desc)
  search?: string;         // Search query
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  },
  message: string;
}
```

#### GET /api/v1/products/:id
Get single product by ID.

**Path Parameters:**
- `id`: Product ID (string)

**Response:**
```typescript
{
  success: true,
  data: Product;
  message: string;
}
```

#### GET /api/v1/products/search
Search products with suggestions.

**Query Parameters:**
```typescript
{
  q: string;              // Search query
  limit?: number;         // Number of suggestions (default: 5)
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    suggestions: string[];
    products: Product[];
  },
  message: string;
}
```

### Product Data Models

#### Product Interface
```typescript
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  images: string[];
  category: {
    id: string;
    name: string;
    slug: string;
  };
  brand: {
    id: string;
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
```

#### ProductVariant Interface
```typescript
interface ProductVariant {
  id: string;
  name: string;
  type: 'color' | 'size' | 'lens_type';
  value: string;
  priceAdjustment: number;
  inStock: boolean;
  imageUrl?: string;
}
```

## User API

### User Endpoints

#### GET /api/v1/users/profile
Get current user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  success: true,
  data: User;
  message: string;
}
```

#### PUT /api/v1/users/profile
Update user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  name?: string;
  phone?: string;
  dateOfBirth?: string; // ISO date string
  preferences?: {
    theme?: 'light' | 'dark';
    notifications?: boolean;
  };
}
```

**Response:**
```typescript
{
  success: true,
  data: User;
  message: string;
}
```

#### GET /api/v1/users/addresses
Get user addresses.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  success: true,
  data: Address[];
  message: string;
}
```

#### POST /api/v1/users/addresses
Add new address.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  type: 'shipping' | 'billing';
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}
```

**Response:**
```typescript
{
  success: true,
  data: Address;
  message: string;
}
```

### User Data Models

#### User Interface
```typescript
interface User {
  id: string;
  email: string;
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
  createdAt: Date;
  updatedAt: Date;
}
```

#### Address Interface
```typescript
interface Address {
  id: string;
  type: 'shipping' | 'billing';
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## Cart API

### Cart Endpoints

#### GET /api/v1/cart
Get user's shopping cart.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  success: true,
  data: {
    items: CartItem[];
    total: {
      subtotal: number;
      tax: number;
      shipping: number;
      discount: number;
      total: number;
    };
  },
  message: string;
}
```

#### POST /api/v1/cart/items
Add item to cart.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  productId: string;
  quantity: number;
  selectedVariant?: {
    variantId: string;
    value: string;
  };
}
```

**Response:**
```typescript
{
  success: true,
  data: CartItem;
  message: string;
}
```

#### PUT /api/v1/cart/items/:itemId
Update cart item quantity.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `itemId`: Cart item ID

**Request Body:**
```typescript
{
  quantity: number;
}
```

**Response:**
```typescript
{
  success: true,
  data: CartItem;
  message: string;
}
```

#### DELETE /api/v1/cart/items/:itemId
Remove item from cart.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `itemId`: Cart item ID

**Response:**
```typescript
{
  success: true,
  message: string;
}
```

#### DELETE /api/v1/cart
Clear entire cart.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  success: true,
  message: string;
}
```

### Cart Data Models

#### CartItem Interface
```typescript
interface CartItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
  };
  quantity: number;
  selectedVariant?: {
    variantId: string;
    name: string;
    value: string;
    priceAdjustment: number;
  };
  addedAt: Date;
}
```

## Orders API

### Order Endpoints

#### GET /api/v1/orders
Get user's orders.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  status?: OrderStatus;
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    orders: Order[];
    pagination: PaginationMeta;
  },
  message: string;
}
```

#### GET /api/v1/orders/:orderId
Get single order details.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `orderId`: Order ID

**Response:**
```typescript
{
  success: true,
  data: Order;
  message: string;
}
```

#### POST /api/v1/orders
Create new order from cart.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  shippingAddressId: string;
  billingAddressId: string;
  paymentMethod: 'credit_card' | 'paypal' | 'apple_pay';
  paymentDetails: {
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
    cardholderName?: string;
  };
  notes?: string;
}
```

**Response:**
```typescript
{
  success: true,
  data: Order;
  message: string;
}
```

### Order Data Models

#### Order Interface
```typescript
interface Order {
  id: string;
  orderNumber: string;
  userId: string;
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
```

#### OrderItem Interface
```typescript
interface OrderItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    imageUrl: string;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selectedVariant?: {
    name: string;
    value: string;
  };
}
```

## Categories API

### Category Endpoints

#### GET /api/v1/categories
Get all product categories.

**Response:**
```typescript
{
  success: true,
  data: Category[];
  message: string;
}
```

#### GET /api/v1/categories/:slug
Get category by slug with products.

**Path Parameters:**
- `slug`: Category slug

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    category: Category;
    products: {
      data: Product[];
      pagination: PaginationMeta;
    };
  },
  message: string;
}
```

### Category Data Models

#### Category Interface
```typescript
interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentCategory?: {
    id: string;
    name: string;
    slug: string;
  };
  childCategories: Category[];
  productCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## Brands API

### Brand Endpoints

#### GET /api/v1/brands
Get all brands.

**Response:**
```typescript
{
  success: true,
  data: Brand[];
  message: string;
}
```

#### GET /api/v1/brands/:slug
Get brand by slug with products.

**Path Parameters:**
- `slug`: Brand slug

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    brand: Brand;
    products: {
      data: Product[];
      pagination: PaginationMeta;
    };
  },
  message: string;
}
```

### Brand Data Models

#### Brand Interface
```typescript
interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  productCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## File Upload API

### Upload Endpoints

#### POST /api/v1/upload
Upload file to MinIO storage.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
```
file: File;           // File to upload
folder?: string;      // Upload folder (products, users, etc.)
```

**Response:**
```typescript
{
  success: true,
  data: {
    url: string;      // File URL
    filename: string; // Generated filename
    size: number;     // File size in bytes
    mimeType: string; // File MIME type
  },
  message: string;
}
```

## Error Handling

### Error Response Format

```typescript
{
  success: false,
  error: string;        // Error code
  message: string;      // Human-readable message
  details?: {          // Additional error context
    field?: string;    // Field that caused error
    value?: any;       // Value that caused error
    constraint?: string; // Validation constraint
  };
  stack?: string;      // Stack trace (development only)
}
```

### HTTP Status Codes

- **200 OK**: Successful request
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource already exists
- **422 Unprocessable Entity**: Validation errors
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

### Common Error Codes

```typescript
// Authentication Errors
AUTH_REQUIRED = "Authentication required"
INVALID_CREDENTIALS = "Invalid email or password"
TOKEN_EXPIRED = "Token has expired"
TOKEN_INVALID = "Invalid token"

// Validation Errors
VALIDATION_ERROR = "Validation failed"
REQUIRED_FIELD = "Field is required"
INVALID_EMAIL = "Invalid email format"
PASSWORD_TOO_SHORT = "Password too short"

// Resource Errors
PRODUCT_NOT_FOUND = "Product not found"
USER_NOT_FOUND = "User not found"
ORDER_NOT_FOUND = "Order not found"
CART_ITEM_NOT_FOUND = "Cart item not found"

// Business Logic Errors
INSUFFICIENT_STOCK = "Insufficient stock"
CART_EMPTY = "Cart is empty"
INVALID_PAYMENT = "Invalid payment method"
ORDER_CANNOT_BE_CANCELLED = "Order cannot be cancelled"
```

## Rate Limiting

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### Rate Limit Exceeded Response

```typescript
{
  success: false,
  error: "RATE_LIMIT_EXCEEDED",
  message: "Too many requests. Please try again later.",
  details: {
    limit: 100,
    remaining: 0,
    resetTime: "2024-01-01T00:00:00Z"
  }
}
```

## Pagination

### Pagination Meta

```typescript
interface PaginationMeta {
  page: number;        // Current page
  limit: number;       // Items per page
  total: number;       // Total items
  pages: number;       // Total pages
  hasNext: boolean;    // Has next page
  hasPrev: boolean;    // Has previous page
}
```

### Pagination Query Parameters

```typescript
{
  page?: number;       // Page number (default: 1)
  limit?: number;      // Items per page (default: 12, max: 100)
}
```

## Webhooks (Future)

### Webhook Events

```typescript
// Order Events
ORDER_CREATED = "order.created"
ORDER_UPDATED = "order.updated"
ORDER_CANCELLED = "order.cancelled"

// Payment Events
PAYMENT_COMPLETED = "payment.completed"
PAYMENT_FAILED = "payment.failed"

// User Events
USER_REGISTERED = "user.registered"
USER_UPDATED = "user.updated"
```

### Webhook Payload

```typescript
{
  event: string;       // Event type
  data: any;          // Event data
  timestamp: string;   // ISO timestamp
  signature: string;   // Webhook signature
}
```

---

*This API documentation provides comprehensive information about all endpoints, data models, and integration patterns for AI LLMs to understand and work with the API effectively.*

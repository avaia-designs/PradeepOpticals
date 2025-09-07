# Architecture Documentation - Pradeep Opticals

## System Architecture Overview

The Pradeep Opticals e-commerce platform follows a modern, scalable architecture with clear separation of concerns and microservices-ready design patterns.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  Web Browser (Next.js Frontend)  │  Mobile App (Future)        │
│  - React Components              │  - React Native              │
│  - Tailwind CSS                  │  - Shared API                │
│  - TypeScript                    │  - Real-time Updates         │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                         │
├─────────────────────────────────────────────────────────────────┤
│  Load Balancer  │  Rate Limiting  │  Authentication  │  CORS   │
│  - Nginx        │  - Redis        │  - JWT           │  - CORS │
│  - SSL/TLS      │  - Rate Limits  │  - OAuth2        │  - CORS │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Application Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (Next.js)           │  Backend (Express.js)          │
│  - Server Components          │  - REST API                    │
│  - Client Components          │  - GraphQL (Future)            │
│  - Static Generation          │  - WebSocket (Future)          │
│  - API Routes                 │  - Microservices (Future)      │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Business Logic Layer                      │
├─────────────────────────────────────────────────────────────────┤
│  Services                      │  Domain Models                 │
│  - Product Service            │  - Product                      │
│  - User Service               │  - User                         │
│  - Order Service              │  - Order                        │
│  - Payment Service            │  - Payment                      │
│  - Notification Service       │  - Notification                 │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Access Layer                         │
├─────────────────────────────────────────────────────────────────┤
│  Repositories                  │  Data Sources                  │
│  - Product Repository         │  - MongoDB (Primary)           │
│  - User Repository            │  - Redis (Cache)               │
│  - Order Repository           │  - MinIO (Files)               │
│  - Payment Repository         │  - Elasticsearch (Search)      │
└─────────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Next.js App Router Structure

```
src/app/
├── layout.tsx                 # Root layout with providers
├── page.tsx                   # Homepage
├── globals.css               # Global styles and theme
├── (auth)/                   # Authentication route group
│   ├── login/
│   └── register/
├── (dashboard)/              # Dashboard route group
│   ├── account/
│   ├── orders/
│   └── wishlist/
├── products/                 # Product pages
│   ├── page.tsx             # Product listing
│   ├── [id]/                # Product detail
│   └── category/[slug]/     # Category pages
├── cart/                    # Shopping cart
├── checkout/                # Checkout process
└── api/                     # API routes (if needed)
```

### Component Architecture

```
src/components/
├── ui/                      # Shadcn/ui components
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   └── ...
├── layout/                  # Layout components
│   ├── header.tsx
│   ├── footer.tsx
│   └── main-layout.tsx
├── products/                # Product components
│   ├── product-card.tsx
│   ├── product-grid.tsx
│   ├── product-filters.tsx
│   └── product-sort.tsx
├── forms/                   # Form components
│   ├── login-form.tsx
│   ├── checkout-form.tsx
│   └── contact-form.tsx
└── common/                  # Shared components
    ├── loading.tsx
    ├── error-boundary.tsx
    └── seo-head.tsx
```

### State Management Architecture

```
State Management Flow:
User Action → Component → Hook → Service → API → Store → UI Update

Zustand Stores:
├── cart-store.ts            # Shopping cart state
├── user-store.ts            # User authentication state
├── ui-store.ts              # UI state (modals, themes)
└── product-store.ts         # Product-related state

TanStack Query:
├── use-products.ts          # Product data fetching
├── use-user.ts              # User data fetching
├── use-orders.ts            # Order data fetching
└── use-search.ts            # Search functionality
```

## Backend Architecture

### Layered Architecture Pattern

```
Request Flow:
HTTP Request → Routes → Middleware → Controller → Service → Repository → Database
                     ↓
Response Flow:
HTTP Response ← Routes ← Middleware ← Controller ← Service ← Repository ← Database
```

### Directory Structure

```
backend/src/
├── routes/                  # API route definitions
│   ├── auth.ts
│   ├── products.ts
│   ├── users.ts
│   └── orders.ts
├── controllers/             # Request handlers
│   ├── authController.ts
│   ├── productController.ts
│   └── userController.ts
├── services/                # Business logic
│   ├── authService.ts
│   ├── productService.ts
│   └── userService.ts
├── repositories/            # Data access
│   ├── productRepository.ts
│   └── userRepository.ts
├── models/                  # Database schemas
│   ├── User.ts
│   ├── Product.ts
│   └── Order.ts
├── middleware/              # Custom middleware
│   ├── auth.ts
│   ├── validation.ts
│   └── errorHandler.ts
├── utils/                   # Utility functions
│   ├── logger.ts
│   ├── email.ts
│   └── fileUpload.ts
└── types/                   # TypeScript definitions
    ├── auth.ts
    ├── product.ts
    └── common.ts
```

### API Design Patterns

#### RESTful API Structure
```
GET    /api/v1/products           # List products
GET    /api/v1/products/:id       # Get product
POST   /api/v1/products           # Create product
PUT    /api/v1/products/:id       # Update product
DELETE /api/v1/products/:id       # Delete product

GET    /api/v1/users/profile      # Get user profile
PUT    /api/v1/users/profile      # Update user profile
POST   /api/v1/auth/login         # User login
POST   /api/v1/auth/register      # User registration
POST   /api/v1/auth/logout        # User logout

GET    /api/v1/cart               # Get cart
POST   /api/v1/cart/items         # Add to cart
PUT    /api/v1/cart/items/:id     # Update cart item
DELETE /api/v1/cart/items/:id     # Remove from cart
```

#### Response Format
```typescript
// Success Response
{
  success: true,
  data: T,
  message: string,
  meta?: {
    pagination?: PaginationMeta,
    timestamp?: string
  }
}

// Error Response
{
  success: false,
  error: string,
  message: string,
  details?: Record<string, any>,
  stack?: string // Only in development
}
```

## Database Architecture

### MongoDB Schema Design

#### Product Collection
```typescript
{
  _id: ObjectId,
  name: string,
  description: string,
  price: number,
  originalPrice?: number,
  images: string[],
  category: {
    _id: ObjectId,
    name: string,
    slug: string
  },
  brand: {
    _id: ObjectId,
    name: string,
    slug: string
  },
  variants: ProductVariant[],
  specifications: ProductSpecification[],
  inventory: {
    quantity: number,
    inStock: boolean,
    lowStockThreshold: number
  },
  seo: {
    title: string,
    description: string,
    keywords: string[]
  },
  status: 'active' | 'inactive' | 'draft',
  createdAt: Date,
  updatedAt: Date
}
```

#### User Collection
```typescript
{
  _id: ObjectId,
  email: string,
  password: string, // Hashed
  name: string,
  role: 'user' | 'admin',
  profile: {
    avatar?: string,
    phone?: string,
    dateOfBirth?: Date,
    preferences: {
      theme: 'light' | 'dark',
      notifications: boolean
    }
  },
  addresses: Address[],
  isActive: boolean,
  lastLoginAt?: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Order Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  orderNumber: string,
  items: OrderItem[],
  shippingAddress: Address,
  billingAddress: Address,
  payment: {
    method: 'credit_card' | 'paypal' | 'apple_pay',
    status: 'pending' | 'completed' | 'failed',
    transactionId?: string
  },
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled',
  total: {
    subtotal: number,
    tax: number,
    shipping: number,
    discount: number,
    total: number
  },
  tracking: {
    carrier?: string,
    trackingNumber?: string,
    estimatedDelivery?: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Indexing Strategy

#### Product Indexes
```javascript
// Compound indexes for efficient queries
db.products.createIndex({ "category.slug": 1, "status": 1, "price": 1 })
db.products.createIndex({ "brand.slug": 1, "status": 1 })
db.products.createIndex({ "name": "text", "description": "text" })
db.products.createIndex({ "status": 1, "createdAt": -1 })
```

#### User Indexes
```javascript
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "role": 1, "isActive": 1 })
db.users.createIndex({ "createdAt": -1 })
```

#### Order Indexes
```javascript
db.orders.createIndex({ "userId": 1, "createdAt": -1 })
db.orders.createIndex({ "orderNumber": 1 }, { unique: true })
db.orders.createIndex({ "status": 1, "createdAt": -1 })
```

## Security Architecture

### Authentication Flow
```
1. User Login Request
2. Credentials Validation
3. JWT Token Generation
4. Token Storage (HttpOnly Cookie)
5. Token Validation on Protected Routes
6. Token Refresh (if needed)
7. Logout (Token Invalidation)
```

### Authorization Levels
```
Public Routes:
- Homepage
- Product listing
- Product details
- Authentication pages

Protected Routes (User):
- User profile
- Shopping cart
- Checkout
- Order history
- Wishlist

Protected Routes (Admin):
- Product management
- User management
- Order management
- Analytics dashboard
```

### Security Measures
```
Frontend Security:
- Input validation with Zod
- XSS protection
- CSRF protection
- Content Security Policy
- Secure token storage

Backend Security:
- JWT authentication
- Password hashing (bcrypt)
- Input validation (Joi)
- Rate limiting
- CORS configuration
- SQL injection prevention
- File upload validation
```

## Performance Architecture

### Caching Strategy

#### Frontend Caching
```
Browser Cache:
- Static assets (CSS, JS, images)
- API responses (TanStack Query)
- Local storage (user preferences)

CDN Cache:
- Static assets
- Images
- Fonts
```

#### Backend Caching
```
Redis Cache:
- Session data
- API responses
- Rate limiting counters
- Search results

Database Cache:
- Query result caching
- Index optimization
- Connection pooling
```

### Performance Optimizations

#### Frontend Optimizations
```
Next.js Optimizations:
- Image optimization
- Font optimization
- Code splitting
- Static generation
- Server-side rendering

React Optimizations:
- Component memoization
- Callback optimization
- State optimization
- Lazy loading
```

#### Backend Optimizations
```
Database Optimizations:
- Proper indexing
- Query optimization
- Connection pooling
- Read replicas

API Optimizations:
- Response compression
- Pagination
- Field selection
- Caching headers
```

## Monitoring and Observability

### Logging Strategy
```
Frontend Logging:
- User actions
- Error tracking
- Performance metrics
- API call tracking

Backend Logging:
- Request/response logs
- Error logs
- Business logic logs
- Performance logs
```

### Metrics Collection
```
Application Metrics:
- Response times
- Error rates
- Throughput
- User engagement

Infrastructure Metrics:
- CPU usage
- Memory usage
- Database performance
- Network latency
```

### Alerting
```
Critical Alerts:
- System downtime
- High error rates
- Database issues
- Security breaches

Warning Alerts:
- High response times
- Low disk space
- High memory usage
- Failed payments
```

## Scalability Architecture

### Horizontal Scaling
```
Load Balancing:
- Application load balancer
- Database read replicas
- CDN distribution
- Microservices architecture

Auto-scaling:
- Container orchestration
- Database sharding
- Cache clustering
- Queue management
```

### Vertical Scaling
```
Resource Optimization:
- Memory optimization
- CPU optimization
- Storage optimization
- Network optimization
```

## Deployment Architecture

### Development Environment
```
Local Development:
- Docker Compose
- Hot reload
- Local databases
- Mock services

CI/CD Pipeline:
- Code quality checks
- Automated testing
- Build process
- Deployment automation
```

### Production Environment
```
Infrastructure:
- Cloud hosting (AWS/Azure/GCP)
- Container orchestration (Kubernetes)
- Database hosting
- CDN distribution

Monitoring:
- Application monitoring
- Infrastructure monitoring
- Log aggregation
- Performance tracking
```

## Future Architecture Considerations

### Microservices Migration
```
Service Decomposition:
- User Service
- Product Service
- Order Service
- Payment Service
- Notification Service
- Search Service

Communication:
- API Gateway
- Service mesh
- Event-driven architecture
- Message queues
```

### Advanced Features
```
Real-time Features:
- WebSocket connections
- Server-sent events
- Real-time notifications
- Live chat support

AI/ML Integration:
- Product recommendations
- Search optimization
- Fraud detection
- Customer insights
```

---

*This architecture documentation provides a comprehensive overview of the system design, patterns, and implementation details for AI LLMs to understand the technical structure and make informed decisions about the codebase.*

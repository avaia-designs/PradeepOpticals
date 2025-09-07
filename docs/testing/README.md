# Testing Documentation - Pradeep Opticals

## Overview

This document outlines the comprehensive testing strategy for the Pradeep Opticals e-commerce platform, covering unit tests, integration tests, end-to-end tests, and performance testing.

## Testing Philosophy

### Testing Pyramid
```
        /\
       /  \
      / E2E \     <- Few, High-level, Slow
     /______\
    /        \
   /Integration\  <- Some, Medium-level, Medium
  /____________\
 /              \
/   Unit Tests   \  <- Many, Low-level, Fast
/________________\
```

### Testing Principles
- **Test Early and Often**: Write tests alongside development
- **Test Behavior, Not Implementation**: Focus on what the code does, not how
- **Maintain High Coverage**: Aim for 80%+ code coverage
- **Fast Feedback**: Tests should run quickly and provide clear feedback
- **Reliable Tests**: Tests should be deterministic and not flaky

## Testing Stack

### Frontend Testing
- **Framework**: Jest + React Testing Library
- **Utilities**: @testing-library/jest-dom, @testing-library/user-event
- **Mocking**: Jest mocks, MSW (Mock Service Worker)
- **Visual Testing**: Storybook (planned)
- **E2E Testing**: Playwright (planned)

### Backend Testing
- **Framework**: Bun Test (built-in)
- **Database**: MongoDB Memory Server
- **HTTP Testing**: Supertest
- **Mocking**: Jest mocks
- **Coverage**: c8 (planned)

## Frontend Testing

### Unit Testing

#### Component Testing
```typescript
// ProductCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from './ProductCard';
import { Product } from '@/types';

const mockProduct: Product = {
  id: '1',
  name: 'Test Glasses',
  price: 99.99,
  imageUrl: 'https://example.com/image.jpg',
  inStock: true,
  rating: 4.5,
  reviewCount: 10
};

describe('ProductCard', () => {
  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} onAddToCart={jest.fn()} />);
    
    expect(screen.getByText('Test Glasses')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  it('calls onAddToCart when add to cart button is clicked', () => {
    const mockOnAddToCart = jest.fn();
    render(<ProductCard product={mockProduct} onAddToCart={mockOnAddToCart} />);
    
    const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
    fireEvent.click(addToCartButton);
    
    expect(mockOnAddToCart).toHaveBeenCalledWith(mockProduct.id);
  });

  it('shows out of stock message when product is not in stock', () => {
    const outOfStockProduct = { ...mockProduct, inStock: false };
    render(<ProductCard product={outOfStockProduct} onAddToCart={jest.fn()} />);
    
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });
});
```

#### Hook Testing
```typescript
// useProducts.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProducts } from './useProducts';
import { productService } from '@/lib/services/product-service';

// Mock the service
jest.mock('@/lib/services/product-service');
const mockProductService = productService as jest.Mocked<typeof productService>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useProducts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches products successfully', async () => {
    const mockProducts = {
      data: [mockProduct],
      pagination: { page: 1, limit: 12, total: 1, pages: 1 }
    };
    
    mockProductService.getProducts.mockResolvedValue(mockProducts);

    const { result } = renderHook(() => useProducts({ page: 1, limit: 12 }), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockProducts);
    expect(mockProductService.getProducts).toHaveBeenCalledWith({ page: 1, limit: 12 });
  });

  it('handles error state', async () => {
    const error = new Error('Failed to fetch products');
    mockProductService.getProducts.mockRejectedValue(error);

    const { result } = renderHook(() => useProducts({ page: 1, limit: 12 }), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(error);
  });
});
```

#### Store Testing
```typescript
// cart-store.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCartStore } from './cart-store';
import { cartService } from '@/lib/services/cart-service';

jest.mock('@/lib/services/cart-service');
const mockCartService = cartService as jest.Mocked<typeof cartService>;

describe('Cart Store', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
    jest.clearAllMocks();
  });

  it('adds item to cart', async () => {
    const mockItem = {
      id: '1',
      productId: 'product-1',
      product: { name: 'Test Product', price: 99.99, imageUrl: 'test.jpg' },
      quantity: 1,
      addedAt: new Date()
    };

    mockCartService.addItem.mockResolvedValue(mockItem);

    const { result } = renderHook(() => useCartStore());

    await act(async () => {
      await result.current.addItem(mockItem);
    });

    expect(result.current.items).toContain(mockItem);
    expect(result.current.total).toBe(99.99);
  });

  it('removes item from cart', async () => {
    const mockItem = {
      id: '1',
      productId: 'product-1',
      product: { name: 'Test Product', price: 99.99, imageUrl: 'test.jpg' },
      quantity: 1,
      addedAt: new Date()
    };

    // Add item first
    useCartStore.getState().items = [mockItem];
    useCartStore.getState().total = 99.99;

    mockCartService.removeItem.mockResolvedValue(undefined);

    const { result } = renderHook(() => useCartStore());

    await act(async () => {
      await result.current.removeItem('1');
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.total).toBe(0);
  });
});
```

### Integration Testing

#### API Integration Testing
```typescript
// api-client.test.ts
import { apiClient } from './api-client';
import { server } from '../mocks/server';
import { rest } from 'msw';

describe('API Client', () => {
  it('handles successful API calls', async () => {
    const mockData = { id: '1', name: 'Test Product' };
    
    server.use(
      rest.get('/api/v1/products/1', (req, res, ctx) => {
        return res(ctx.json({ success: true, data: mockData }));
      })
    );

    const response = await apiClient.get('/products/1');
    expect(response.data).toEqual({ success: true, data: mockData });
  });

  it('handles API errors', async () => {
    server.use(
      rest.get('/api/v1/products/1', (req, res, ctx) => {
        return res(ctx.status(404), ctx.json({ success: false, error: 'NOT_FOUND' }));
      })
    );

    await expect(apiClient.get('/products/1')).rejects.toThrow();
  });

  it('includes authentication headers', async () => {
    const token = 'test-token';
    localStorage.setItem('auth_token', token);

    server.use(
      rest.get('/api/v1/products', (req, res, ctx) => {
        expect(req.headers.get('Authorization')).toBe(`Bearer ${token}`);
        return res(ctx.json({ success: true, data: [] }));
      })
    );

    await apiClient.get('/products');
  });
});
```

#### Page Integration Testing
```typescript
// ProductPage.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProductPage } from './ProductPage';
import { server } from '../mocks/server';
import { rest } from 'msw';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('ProductPage', () => {
  it('displays products and handles user interactions', async () => {
    server.use(
      rest.get('/api/v1/products', (req, res, ctx) => {
        return res(ctx.json({
          success: true,
          data: {
            data: [mockProduct],
            pagination: { page: 1, limit: 12, total: 1, pages: 1 }
          }
        }));
      })
    );

    render(<ProductPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Test Glasses')).toBeInTheDocument();
    });

    const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
    expect(addToCartButton).toBeInTheDocument();
  });
});
```

## Backend Testing

### Unit Testing

#### Service Testing
```typescript
// auth-service.test.ts
import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { AuthService } from '../services/auth-service';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';

// Mock dependencies
mock.module('../models/User', () => ({
  User: {
    findOne: mock(),
    create: mock()
  }
}));

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  it('should login user with valid credentials', async () => {
    const mockUser = {
      _id: 'user-id',
      email: 'test@example.com',
      password: 'hashed-password',
      isActive: true,
      lastLoginAt: null,
      save: mock().mockResolvedValue({})
    };

    User.findOne.mockResolvedValue(mockUser);
    bcrypt.compare = mock().mockResolvedValue(true);

    const result = await authService.login('test@example.com', 'password123');

    expect(result.user.email).toBe('test@example.com');
    expect(result.token).toBeDefined();
    expect(mockUser.save).toHaveBeenCalled();
  });

  it('should throw error for invalid credentials', async () => {
    User.findOne.mockResolvedValue(null);

    await expect(authService.login('test@example.com', 'wrong-password'))
      .rejects.toThrow('Invalid credentials');
  });
});
```

#### Controller Testing
```typescript
// auth-controller.test.ts
import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { Request, Response } from 'express';
import { authController } from '../controllers/auth-controller';
import { AuthService } from '../services/auth-service';

// Mock the service
mock.module('../services/auth-service', () => ({
  AuthService: mock().mockImplementation(() => ({
    login: mock(),
    register: mock()
  }))
}));

describe('AuthController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      body: { email: 'test@example.com', password: 'password123' }
    };
    mockRes = {
      status: mock().mockReturnThis(),
      json: mock().mockReturnThis()
    };
    mockNext = mock();
  });

  it('should login user successfully', async () => {
    const mockResult = {
      user: { id: '1', email: 'test@example.com' },
      token: 'jwt-token'
    };

    AuthService.prototype.login = mock().mockResolvedValue(mockResult);

    await authController.login(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: true,
      data: mockResult,
      message: 'Login successful'
    });
  });
});
```

### Integration Testing

#### API Endpoint Testing
```typescript
// auth-routes.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { app } from '../index';
import { connectDB, disconnectDB } from '../config/database';
import { User } from '../models/User';

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

describe('Auth Routes', () => {
  it('POST /api/v1/auth/register should create new user', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    };

    const response = await app.request('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.user.email).toBe(userData.email);
  });

  it('POST /api/v1/auth/login should authenticate user', async () => {
    // First create a user
    const user = new User({
      email: 'test@example.com',
      password: 'hashed-password',
      name: 'Test User'
    });
    await user.save();

    const response = await app.request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.token).toBeDefined();
  });
});
```

#### Database Integration Testing
```typescript
// product-repository.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import { connectDB, disconnectDB } from '../config/database';
import { ProductRepository } from '../repositories/product-repository';
import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { Brand } from '../models/Brand';

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

beforeEach(async () => {
  await Product.deleteMany({});
  await Category.deleteMany({});
  await Brand.deleteMany({});
});

describe('ProductRepository', () => {
  let productRepository: ProductRepository;
  let category: any;
  let brand: any;

  beforeEach(async () => {
    productRepository = new ProductRepository();
    
    category = await Category.create({
      name: 'Sunglasses',
      slug: 'sunglasses'
    });

    brand = await Brand.create({
      name: 'Ray-Ban',
      slug: 'ray-ban'
    });
  });

  it('should create product successfully', async () => {
    const productData = {
      name: 'Test Sunglasses',
      description: 'Test description',
      price: 99.99,
      category: {
        _id: category._id,
        name: category.name,
        slug: category.slug
      },
      brand: {
        _id: brand._id,
        name: brand.name,
        slug: brand.slug
      },
      inventory: {
        quantity: 10,
        inStock: true,
        lowStockThreshold: 5
      }
    };

    const product = await productRepository.create(productData);

    expect(product.name).toBe(productData.name);
    expect(product.price).toBe(productData.price);
    expect(product.category._id.toString()).toBe(category._id.toString());
  });

  it('should find products with filters', async () => {
    // Create test products
    await Product.create([
      {
        name: 'Sunglasses 1',
        price: 99.99,
        category: { _id: category._id, name: category.name, slug: category.slug },
        brand: { _id: brand._id, name: brand.name, slug: brand.slug },
        inventory: { quantity: 10, inStock: true, lowStockThreshold: 5 }
      },
      {
        name: 'Sunglasses 2',
        price: 199.99,
        category: { _id: category._id, name: category.name, slug: category.slug },
        brand: { _id: brand._id, name: brand.name, slug: brand.slug },
        inventory: { quantity: 5, inStock: true, lowStockThreshold: 5 }
      }
    ]);

    const result = await productRepository.findWithPagination(1, 10, {
      'category.slug': 'sunglasses',
      price: { $gte: 100 }
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe('Sunglasses 2');
  });
});
```

## End-to-End Testing

### Playwright Setup
```typescript
// e2e/product-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Product Flow', () => {
  test('user can browse products and add to cart', async ({ page }) => {
    // Navigate to products page
    await page.goto('/products');
    
    // Wait for products to load
    await expect(page.locator('[data-testid="product-card"]')).toBeVisible();
    
    // Click on first product
    await page.locator('[data-testid="product-card"]').first().click();
    
    // Verify product detail page
    await expect(page.locator('h1')).toContainText('Test Glasses');
    
    // Add to cart
    await page.locator('[data-testid="add-to-cart"]').click();
    
    // Verify cart update
    await expect(page.locator('[data-testid="cart-count"]')).toContainText('1');
    
    // Go to cart page
    await page.locator('[data-testid="cart-link"]').click();
    
    // Verify cart contents
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);
  });

  test('user can search for products', async ({ page }) => {
    await page.goto('/');
    
    // Type in search box
    await page.locator('[data-testid="search-input"]').fill('sunglasses');
    
    // Wait for suggestions
    await expect(page.locator('[data-testid="search-suggestions"]')).toBeVisible();
    
    // Click on suggestion
    await page.locator('[data-testid="search-suggestion"]').first().click();
    
    // Verify search results
    await expect(page.locator('[data-testid="product-card"]')).toBeVisible();
  });
});
```

## Performance Testing

### Load Testing
```typescript
// performance/load-test.ts
import { check, sleep } from 'k6';
import http from 'k6/http';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.1'],    // Error rate under 10%
  },
};

export default function() {
  // Test product listing
  let response = http.get('http://localhost:5000/api/v1/products');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);

  // Test product detail
  response = http.get('http://localhost:5000/api/v1/products/1');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 300ms': (r) => r.timings.duration < 300,
  });

  sleep(1);
}
```

## Test Configuration

### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### Test Setup
```typescript
// src/setupTests.ts
import '@testing-library/jest-dom';
import { server } from './mocks/server';

// Establish API mocking before all tests
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished
afterAll(() => server.close());
```

## Mocking Strategies

### API Mocking with MSW
```typescript
// mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/v1/products', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          data: mockProducts,
          pagination: {
            page: 1,
            limit: 12,
            total: mockProducts.length,
            pages: 1
          }
        }
      })
    );
  }),

  rest.post('/api/v1/auth/login', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          user: mockUser,
          token: 'mock-jwt-token'
        }
      })
    );
  }),
];
```

### Database Mocking
```typescript
// mocks/database.ts
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

export const setupTestDB = async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
};

export const teardownTestDB = async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
};
```

## Continuous Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:7
        ports:
          - 27017:27017
      
      redis:
        image: redis:7
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest
      
      - name: Install dependencies
        run: |
          cd frontend && npm install
          cd ../backend && bun install
      
      - name: Run frontend tests
        run: |
          cd frontend
          npm run test:ci
      
      - name: Run backend tests
        run: |
          cd backend
          bun test
      
      - name: Run E2E tests
        run: |
          cd frontend
          npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./frontend/coverage/lcov.info,./backend/coverage/lcov.info
```

## Test Data Management

### Test Fixtures
```typescript
// fixtures/products.ts
export const mockProducts = [
  {
    id: '1',
    name: 'Test Sunglasses',
    price: 99.99,
    imageUrl: 'https://example.com/image1.jpg',
    inStock: true,
    rating: 4.5,
    reviewCount: 10
  },
  {
    id: '2',
    name: 'Test Prescription Glasses',
    price: 199.99,
    imageUrl: 'https://example.com/image2.jpg',
    inStock: false,
    rating: 4.2,
    reviewCount: 5
  }
];

export const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user'
};
```

## Best Practices

### Test Organization
- **One test file per component/service**
- **Group related tests with describe blocks**
- **Use descriptive test names**
- **Keep tests focused and atomic**

### Test Data
- **Use factories for test data creation**
- **Clean up test data after each test**
- **Use realistic test data**
- **Avoid hardcoded values**

### Assertions
- **Test behavior, not implementation**
- **Use specific assertions**
- **Test error cases**
- **Verify side effects**

### Performance
- **Run tests in parallel when possible**
- **Use mocks for external dependencies**
- **Keep tests fast and reliable**
- **Monitor test execution time**

---

*This testing documentation provides comprehensive guidance for implementing a robust testing strategy across the Pradeep Opticals e-commerce platform, ensuring code quality and reliability.*

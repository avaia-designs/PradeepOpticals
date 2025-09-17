import { Request } from 'express';

// Base model interface that all models must extend
export interface BaseModel {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
}

// Authenticated request interface
export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: UserRole;
    permissions: string[];
  };
}

// User role enum
export enum UserRole {
  USER = 'user',
  STAFF = 'staff',
  ADMIN = 'admin'
}

// Appointment status enum
export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show'
}

// Order status enum
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

// API Response interfaces
export interface SuccessResponse<T> {
  success: true;
  data: T;
  message: string;
  meta?: {
    pagination?: PaginationMeta;
    timestamp?: string;
  };
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  details?: Record<string, any>;
  stack?: string;
}

// Generic API Response type
export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

// Cart interface
export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  totalAmount: number;
  itemCount: number;
}

export interface CartItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specifications?: {
    material?: string;
    color?: string;
    size?: string;
  };
}

// API Response Product interface (what frontend expects)
export interface ApiProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: {
    _id: string;
    name: string;
  };
  subcategory?: {
    _id: string;
    name: string;
  };
  brand?: {
    _id: string;
    name: string;
  };
  images: string[];
  inventory: number;
  sku: string;
  specifications: {
    material?: string;
    color?: string;
    size?: string;
    weight?: number;
    dimensions?: {
      width?: number;
      height?: number;
      depth?: number;
    };
  };
  tags: string[];
  isActive: boolean;
  featured: boolean;
  rating?: number;
  reviewCount: number;
  discountPercentage?: number;
  createdAt: string;
  modifiedAt: string;
}

// Environment variables interface
export interface EnvironmentConfig {
  PORT: number;
  NODE_ENV: string;
  API_VERSION: string;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  FRONTEND_URL: string;
  ALLOWED_ORIGINS: string[];
  MINIO_ENDPOINT: string;
  MINIO_PORT: number;
  MINIO_ACCESS_KEY: string;
  MINIO_SECRET_KEY: string;
  MINIO_BUCKET_NAME: string;
  MINIO_USE_SSL: boolean;
  MAX_FILE_SIZE: number;
  ALLOWED_FILE_TYPES: string[];
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  LOG_LEVEL: string;
  LOG_FILE_PATH: string;
}

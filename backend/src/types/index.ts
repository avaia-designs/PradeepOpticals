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
  ADMIN = 'admin'
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

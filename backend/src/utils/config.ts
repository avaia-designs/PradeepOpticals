import dotenv from 'dotenv';
import { EnvironmentConfig } from '../types';

// Load environment variables
dotenv.config();

/**
 * Configuration utility that loads and validates environment variables
 * Provides type-safe access to configuration values
 */
export class Config {
  private static instance: EnvironmentConfig;

  static load(): EnvironmentConfig {
    if (!this.instance) {
      this.instance = this.validateConfig({
        PORT: parseInt(process.env.PORT || '5000', 10),
        NODE_ENV: process.env.NODE_ENV || 'development',
        API_VERSION: process.env.API_VERSION || 'v1',
        MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce_db',
        JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
        JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
        FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
        ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
        MINIO_ENDPOINT: process.env.MINIO_ENDPOINT || 'localhost',
        MINIO_PORT: parseInt(process.env.MINIO_PORT || '9000', 10),
        MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY || 'minioadmin',
        MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY || 'minioadmin123',
        MINIO_BUCKET_NAME: process.env.MINIO_BUCKET_NAME || 'ecommerce-uploads',
        MINIO_USE_SSL: process.env.MINIO_USE_SSL === 'true',
        MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
        ALLOWED_FILE_TYPES: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(','),
        RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
        RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
        LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
        LOG_FILE_PATH: process.env.LOG_FILE_PATH || './logs/app.log'
      });
    }
    return this.instance;
  }

  private static validateConfig(config: EnvironmentConfig): EnvironmentConfig {
    // Validate required configuration values
    if (config.NODE_ENV === 'production' && (!config.JWT_SECRET || config.JWT_SECRET === 'your-super-secret-jwt-key-here')) {
      throw new Error('JWT_SECRET must be set to a secure value in production');
    }

    if (!config.MONGODB_URI) {
      throw new Error('MONGODB_URI is required');
    }

    if (config.NODE_ENV === 'production' && config.ALLOWED_ORIGINS.includes('*')) {
      throw new Error('Wildcard CORS origins are not allowed in production');
    }

    return config;
  }

  static get(): EnvironmentConfig {
    if (!this.instance) {
      return this.load();
    }
    return this.instance;
  }
}

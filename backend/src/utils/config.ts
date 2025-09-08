import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

export interface Config {
  // Server Configuration
  PORT: number;
  NODE_ENV: string;
  API_VERSION: string;

  // Database Configuration
  MONGODB_URI: string;
  MONGODB_TEST_URI: string;

  // JWT Configuration
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;

  // MinIO Configuration
  MINIO_ENDPOINT: string;
  MINIO_PORT: number;
  MINIO_ACCESS_KEY: string;
  MINIO_SECRET_KEY: string;
  MINIO_BUCKET_NAME: string;
  MINIO_USE_SSL: boolean;

  // CORS Configuration
  FRONTEND_URL: string;
  ALLOWED_ORIGINS: string[];

  // File Upload Configuration
  MAX_FILE_SIZE: number;
  ALLOWED_FILE_TYPES: string[];

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;

  // Logging
  LOG_LEVEL: string;
  LOG_FILE_PATH: string;
}

class ConfigManager {
  private static instance: ConfigManager;
  private config: Config;

  private constructor() {
    this.config = this.loadConfig();
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  public get(): Config {
    return this.config;
  }

  private loadConfig(): Config {
    return {
      // Server Configuration
      PORT: parseInt(process.env.PORT || '5000', 10),
      NODE_ENV: process.env.NODE_ENV || 'development',
      API_VERSION: process.env.API_VERSION || 'v1',

      // Database Configuration
      MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce_db',
      MONGODB_TEST_URI: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/ecommerce_test_db',

      // JWT Configuration
      JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

      // MinIO Configuration
      MINIO_ENDPOINT: process.env.MINIO_ENDPOINT || 'localhost',
      MINIO_PORT: parseInt(process.env.MINIO_PORT || '9000', 10),
      MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY || 'minioadmin123',
      MINIO_BUCKET_NAME: process.env.MINIO_BUCKET_NAME || 'ecommerce-uploads',
      MINIO_USE_SSL: process.env.MINIO_USE_SSL === 'true',

      // CORS Configuration
      FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
      ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],

      // File Upload Configuration
      MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
      ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES?.split(',') || [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp'
      ],

      // Rate Limiting
      RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
      RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

      // Logging
      LOG_LEVEL: process.env.LOG_LEVEL || 'info',
      LOG_FILE_PATH: process.env.LOG_FILE_PATH || './logs/app.log'
    };
  }

  /**
   * Validate required configuration
   */
  public validate(): void {
    const required = [
      'JWT_SECRET',
      'MONGODB_URI'
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    // Validate JWT secret strength
    if (this.config.JWT_SECRET.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters long');
    }

    // Validate MongoDB URI format
    if (!this.config.MONGODB_URI.startsWith('mongodb://') && !this.config.MONGODB_URI.startsWith('mongodb+srv://')) {
      throw new Error('MONGODB_URI must be a valid MongoDB connection string');
    }
  }

  /**
   * Check if running in development mode
   */
  public isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }

  /**
   * Check if running in production mode
   */
  public isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }

  /**
   * Check if running in test mode
   */
  public isTest(): boolean {
    return this.config.NODE_ENV === 'test';
  }
}

// Export singleton instance
export const Config = ConfigManager.getInstance();
export default Config;
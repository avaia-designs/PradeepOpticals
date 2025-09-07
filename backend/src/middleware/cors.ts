import cors from 'cors';
import { Config } from '../utils/config';

/**
 * CORS middleware configuration
 * Implements security-first CORS policy with proper origin validation
 */
export const corsMiddleware = (): any => {
  const config = Config.get();

  return cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Check if origin is in allowed list
      if (config.ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }

      // In development, allow localhost with any port
      if (config.NODE_ENV === 'development' && origin.includes('localhost')) {
        return callback(null, true);
      }

      // Reject origin
      callback(new Error('Not allowed by CORS policy'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Correlation-ID'
    ],
    exposedHeaders: ['X-Correlation-ID'],
    maxAge: 86400 // 24 hours
  });
};

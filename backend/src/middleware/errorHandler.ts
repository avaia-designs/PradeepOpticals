import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../types';
import { Logger } from '../utils/logger';
import { Config } from '../utils/config';

/**
 * Global error handling middleware
 * Must be the last middleware in the chain
 * Returns consistent error format and logs errors with correlation IDs
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const correlationId = req.headers['x-correlation-id'] as string || Logger.generateCorrelationId();
  const config = Config.get();

  // Log error with correlation ID
  Logger.error('Unhandled error occurred', error, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    correlationId
  }, correlationId);

  // Determine error status and message
  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Invalid input data provided';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    errorCode = 'INVALID_ID';
    message = 'Invalid ID format provided';
  } else if (error.name === 'MongoError' && (error as any).code === 11000) {
    statusCode = 409;
    errorCode = 'DUPLICATE_ENTRY';
    message = 'Resource already exists';
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    errorCode = 'UNAUTHORIZED';
    message = 'Authentication required';
  } else if (error.name === 'ForbiddenError') {
    statusCode = 403;
    errorCode = 'FORBIDDEN';
    message = 'Insufficient permissions';
  } else if (error.name === 'NotFoundError') {
    statusCode = 404;
    errorCode = 'NOT_FOUND';
    message = 'Resource not found';
  }

  // Prepare error response
  const errorResponse: ErrorResponse = {
    success: false,
    error: errorCode,
    message,
    details: config.NODE_ENV === 'development' ? {
      stack: error.stack,
      originalError: error.message
    } : undefined
  };

  // Add correlation ID to response headers
  res.setHeader('X-Correlation-ID', correlationId);

  res.status(statusCode).json(errorResponse);
};

/**
 * 404 handler for unmatched routes
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  const correlationId = Logger.generateCorrelationId();
  
  Logger.warn('Route not found', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    correlationId
  }, correlationId);

  res.setHeader('X-Correlation-ID', correlationId);
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: `Route ${req.method} ${req.url} not found`
  });
};

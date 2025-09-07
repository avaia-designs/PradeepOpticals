import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';

/**
 * Correlation ID middleware
 * Generates and attaches correlation ID to requests for tracing
 * Must be applied early in the middleware chain
 */
export const correlationIdMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Check if correlation ID already exists in headers
    let correlationId = req.headers['x-correlation-id'] as string;

    // Generate new correlation ID if not present
    if (!correlationId) {
      correlationId = Logger.generateCorrelationId();
    }

    // Attach correlation ID to request and response
    req.headers['x-correlation-id'] = correlationId;
    res.setHeader('X-Correlation-ID', correlationId);

    // Add correlation ID to response locals for use in other middleware
    res.locals.correlationId = correlationId;

    next();
  };
};

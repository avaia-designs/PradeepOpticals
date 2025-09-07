import { Request, Response, NextFunction } from 'express';

/**
 * Response time middleware
 * Measures and adds response time to response headers
 * Must be applied early in the middleware chain
 */
export const responseTimeMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();

    // Override res.end to capture response time
    const originalEnd = res.end;
    res.end = function(chunk?: any, encoding?: any) {
      const responseTime = Date.now() - startTime;
      res.setHeader('X-Response-Time', responseTime.toString());
      return originalEnd.call(this, chunk, encoding);
    };

    next();
  };
};

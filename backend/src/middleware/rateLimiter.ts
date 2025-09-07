import { Request, Response, NextFunction } from 'express';
import { Config } from '../utils/config';
import { Logger } from '../utils/logger';

/**
 * Simple in-memory rate limiter
 * In production, this should be replaced with Redis-based rate limiting
 */
class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();
  private config = Config.get();

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowMs = this.config.RATE_LIMIT_WINDOW_MS;
    const maxRequests = this.config.RATE_LIMIT_MAX_REQUESTS;

    const record = this.requests.get(identifier);

    if (!record || now > record.resetTime) {
      // New window or expired window
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }

    if (record.count >= maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }

  getRemainingRequests(identifier: string): number {
    const record = this.requests.get(identifier);
    if (!record) return this.config.RATE_LIMIT_MAX_REQUESTS;
    return Math.max(0, this.config.RATE_LIMIT_MAX_REQUESTS - record.count);
  }

  getResetTime(identifier: string): number {
    const record = this.requests.get(identifier);
    return record ? record.resetTime : Date.now() + this.config.RATE_LIMIT_WINDOW_MS;
  }

  // Clean up expired entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

const rateLimiter = new RateLimiter();

// Clean up expired entries every 5 minutes
setInterval(() => {
  rateLimiter.cleanup();
}, 5 * 60 * 1000);

/**
 * Rate limiting middleware
 * Implements sliding window rate limiting per IP address
 */
export const rateLimitMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const identifier = req.ip || 'unknown';
    const correlationId = res.locals.correlationId;

    if (!rateLimiter.isAllowed(identifier)) {
      const resetTime = rateLimiter.getResetTime(identifier);
      const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

      Logger.warn('Rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url,
        method: req.method,
        retryAfter
      }, correlationId);

      res.setHeader('Retry-After', retryAfter.toString());
      res.status(429).json({
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later',
        details: {
          retryAfter
        }
      });
      return;
    }

    // Add rate limit headers to response
    const remaining = rateLimiter.getRemainingRequests(identifier);
    const resetTime = rateLimiter.getResetTime(identifier);
    
    res.setHeader('X-RateLimit-Limit', Config.get().RATE_LIMIT_MAX_REQUESTS.toString());
    res.setHeader('X-RateLimit-Remaining', remaining.toString());
    res.setHeader('X-RateLimit-Reset', new Date(resetTime).toISOString());

    next();
  };
};

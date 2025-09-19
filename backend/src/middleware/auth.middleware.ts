import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthenticatedRequest } from '../types';
import { Logger } from '../utils/logger';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Access token is required'
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    const userData = await AuthService.verifyToken(token);
    
    // Attach user to request
    (req as AuthenticatedRequest).user = {
      id: userData.id,
      email: userData.email,
      role: userData.role,
      permissions: [] // Will be populated based on role if needed
    };

    Logger.debug('User authenticated', { userId: userData.id, email: userData.email });
    next();
  } catch (error) {
    Logger.error('Authentication failed', error as Error);
    res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Invalid or expired token'
    });
  }
};

/**
 * Authorization middleware for specific roles
 */
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Authentication required'
      });
      return;
    }

    if (!roles.includes(authReq.user.role)) {
      Logger.warn('Access denied - insufficient permissions', {
        userId: authReq.user.id,
        userRole: authReq.user.role,
        requiredRoles: roles
      });
      
      res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Insufficient permissions'
      });
      return;
    }

    next();
  };
};

/**
 * Optional authentication middleware
 * Attaches user to request if token is present, but doesn't require it
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const userData = await AuthService.verifyToken(token);
      
      (req as AuthenticatedRequest).user = {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        permissions: []
      };
    }

    next();
  } catch (error) {
    // For optional auth, we don't fail on invalid tokens
    Logger.debug('Optional authentication failed', error as Error);
    next();
  }
};

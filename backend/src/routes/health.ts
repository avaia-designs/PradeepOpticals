import { Router, Request, Response } from 'express';
import { SuccessResponse } from '../types';
import { Logger } from '../utils/logger';

const router = Router();

/**
 * Health check endpoint
 * Returns server status and basic information
 */
router.get('/', (req: Request, res: Response): void => {
  const correlationId = res.locals.correlationId;
  
  Logger.info('Health check requested', {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  }, correlationId);

  const response: SuccessResponse<{
    status: string;
    timestamp: string;
    uptime: number;
    environment: string;
  }> = {
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    },
    message: 'Server is running successfully'
  };

  res.json(response);
});

/**
 * Detailed health check endpoint
 * Returns more comprehensive system information
 */
router.get('/detailed', (req: Request, res: Response): void => {
  const correlationId = res.locals.correlationId;
  
  Logger.info('Detailed health check requested', {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  }, correlationId);

  const response: SuccessResponse<{
    status: string;
    timestamp: string;
    uptime: number;
    environment: string;
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    version: string;
  }> = {
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        percentage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100)
      },
      version: process.env.npm_package_version || '1.0.0'
    },
    message: 'Detailed health information retrieved successfully'
  };

  res.json(response);
});

export default router;

import { EnvironmentConfig } from '../types';

/**
 * Logger utility for consistent logging across the application
 * Implements structured logging with correlation IDs and proper log levels
 */
export class Logger {
  private static logLevel: string;

  static initialize(config: EnvironmentConfig): void {
    this.logLevel = config.LOG_LEVEL;
  }

  static info(message: string, data?: Record<string, any>, correlationId?: string): void {
    if (this.shouldLog('info')) {
      console.info(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'INFO',
        message,
        correlationId,
        ...data
      }));
    }
  }

  static error(message: string, error?: Error, data?: Record<string, any>, correlationId?: string): void {
    if (this.shouldLog('error')) {
      console.error(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'ERROR',
        message,
        error: error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : undefined,
        correlationId,
        ...data
      }));
    }
  }

  static warn(message: string, data?: Record<string, any>, correlationId?: string): void {
    if (this.shouldLog('warn')) {
      console.warn(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'WARN',
        message,
        correlationId,
        ...data
      }));
    }
  }

  static debug(message: string, data?: Record<string, any>, correlationId?: string): void {
    if (this.shouldLog('debug')) {
      console.debug(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'DEBUG',
        message,
        correlationId,
        ...data
      }));
    }
  }

  private static shouldLog(level: string): boolean {
    const levels = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const requestedLevelIndex = levels.indexOf(level);
    return requestedLevelIndex <= currentLevelIndex;
  }

  static generateCorrelationId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

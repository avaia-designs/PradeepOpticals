import winston from 'winston';
import path from 'path';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which level to use based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }),
  
  // File transport for errors
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'combined.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  })
];

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  exitOnError: false
});

// Create a stream object with a 'write' function that will be used by morgan
(logger as any).stream = {
  write: (message: string) => {
    logger.http(message.substring(0, message.lastIndexOf('\n')));
  },
};

export class Logger {
  /**
   * Log info message
   */
  static info(message: string, meta?: any): void {
    logger.info(message, meta);
  }

  /**
   * Log warning message
   */
  static warn(message: string, meta?: any): void {
    logger.warn(message, meta);
  }

  /**
   * Log error message
   */
  static error(message: string, error?: Error, meta?: any): void {
    logger.error(message, {
      error: error?.message,
      stack: error?.stack,
      ...meta
    });
  }

  /**
   * Log debug message
   */
  static debug(message: string, meta?: any): void {
    logger.debug(message, meta);
  }

  /**
   * Log HTTP request
   */
  static http(message: string, meta?: any): void {
    logger.http(message, meta);
  }

  /**
   * Log user action
   */
  static userAction(action: string, data?: any): void {
    logger.info(`[USER_ACTION] ${action}`, data);
  }

  /**
   * Log business event
   */
  static businessEvent(event: string, data?: any): void {
    logger.info(`[BUSINESS_EVENT] ${event}`, data);
  }

  /**
   * Log security event
   */
  static securityEvent(event: string, data?: any): void {
    logger.warn(`[SECURITY_EVENT] ${event}`, data);
  }

  /**
   * Log performance metric
   */
  static performance(operation: string, duration: number, meta?: any): void {
    logger.info(`[PERFORMANCE] ${operation} took ${duration}ms`, meta);
  }

  /**
   * Generate correlation ID for request tracing
   */
  static generateCorrelationId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default logger;
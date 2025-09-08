import express from 'express';
import helmet from 'helmet';
import { Config } from './utils/config';
import { Logger } from './utils/logger';
import { database } from './utils/database';
import { EnvironmentConfig } from './types';
import {
  corsMiddleware,
  requestLogger,
  correlationIdMiddleware,
  rateLimitMiddleware,
  responseTimeMiddleware,
  errorHandler,
  notFoundHandler
} from './middleware';
import routes from './routes';

/**
 * Main Express application entry point
 * Follows the architecture pattern: Request → Routes → Middleware → Controller → Validation → Service → Repository → Database
 */
class Application {
  private app: express.Application;
  private config: EnvironmentConfig;

  constructor() {
    this.app = express();
    this.config = Config.get();
    
    // Logger is already initialized as a static class
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Setup middleware in correct order
   * Security → Request parsing → Authentication → User resolver → Authorization → Validation → Rate limiting → Logging
   */
  private setupMiddleware(): void {
    // Security middleware (FIRST)
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      crossOriginEmbedderPolicy: false
    }));

    // CORS middleware
    this.app.use(corsMiddleware());

    // Request parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Response time middleware (early in chain)
    this.app.use(responseTimeMiddleware());

    // Correlation ID middleware (early in chain)
    this.app.use(correlationIdMiddleware());

    // Request logging middleware
    this.app.use(requestLogger());

    // Rate limiting middleware
    this.app.use(rateLimitMiddleware());

    Logger.info('Middleware setup completed');
  }

  /**
   * Setup application routes
   */
  private setupRoutes(): void {
    // API routes with version prefix
    this.app.use(`/api/${this.config.API_VERSION}`, routes);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'Pradeep Opticals API Server',
        version: '1.0.0',
        documentation: `/api/${this.config.API_VERSION}/health`
      });
    });

    Logger.info('Routes setup completed');
  }

  /**
   * Setup error handling (MUST be last)
   */
  private setupErrorHandling(): void {
    // 404 handler for unmatched routes
    this.app.use(notFoundHandler);

    // Global error handler (MUST be last)
    this.app.use(errorHandler);

    Logger.info('Error handling setup completed');
  }

  /**
   * Start the server
   */
  async start(): Promise<void> {
    try {
      // Connect to database
      await database.connect();

      // Start HTTP server
      this.app.listen(this.config.PORT, () => {
        Logger.info('Server started successfully', {
          port: this.config.PORT,
          environment: this.config.NODE_ENV,
          apiVersion: this.config.API_VERSION,
          databaseStatus: database.getConnectionStatus()
        });

        console.log(`
🚀 Pradeep Opticals API Server Started!
📍 Port: ${this.config.PORT}
🌍 Environment: ${this.config.NODE_ENV}
📚 API Documentation: http://localhost:${this.config.PORT}/api/${this.config.API_VERSION}/health
🔗 Frontend URL: ${this.config.FRONTEND_URL}
        `);
      });

    } catch (error) {
      Logger.error('Failed to start server', error as Error);
      process.exit(1);
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    Logger.info('Shutting down server...');
    
    try {
      await database.disconnect();
      Logger.info('Server shutdown completed');
      process.exit(0);
    } catch (error) {
      Logger.error('Error during shutdown', error as Error);
      process.exit(1);
    }
  }
}

// Create and start application
const app = new Application();

// Handle graceful shutdown
process.on('SIGTERM', () => app.shutdown());
process.on('SIGINT', () => app.shutdown());

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  Logger.error('Uncaught Exception', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  Logger.error('Unhandled Rejection', new Error(String(reason)), { promise });
  process.exit(1);
});

// Start the application
app.start().catch((error) => {
  Logger.error('Failed to start application', error);
  process.exit(1);
});

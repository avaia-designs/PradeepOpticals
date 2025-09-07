import mongoose from 'mongoose';
import { Config } from './config';
import { Logger } from './logger';

/**
 * Database connection utility
 * Handles MongoDB connection with proper error handling and reconnection logic
 */
export class Database {
  private static instance: Database;
  private isConnected = false;

  private constructor() {}

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  /**
   * Connect to MongoDB database
   */
  async connect(): Promise<void> {
    const config = Config.get();
    
    try {
      const options = {
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        bufferCommands: false, // Disable mongoose buffering
      };

      await mongoose.connect(config.MONGODB_URI, options);
      
      this.isConnected = true;
      
      Logger.info('Database connected successfully', {
        uri: config.MONGODB_URI.replace(/\/\/.*@/, '//***:***@'), // Hide credentials in logs
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name
      });

      // Handle connection events
      mongoose.connection.on('error', (error) => {
        Logger.error('Database connection error', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        Logger.warn('Database disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        Logger.info('Database reconnected');
        this.isConnected = true;
      });

    } catch (error) {
      Logger.error('Failed to connect to database', error as Error, {
        uri: config.MONGODB_URI.replace(/\/\/.*@/, '//***:***@')
      });
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB database
   */
  async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      this.isConnected = false;
      Logger.info('Database disconnected successfully');
    } catch (error) {
      Logger.error('Error disconnecting from database', error as Error);
      throw error;
    }
  }

  /**
   * Check if database is connected
   */
  isDatabaseConnected(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  /**
   * Get database connection status
   */
  getConnectionStatus(): string {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    return states[mongoose.connection.readyState as keyof typeof states] || 'unknown';
  }
}

// Export singleton instance
export const database = Database.getInstance();

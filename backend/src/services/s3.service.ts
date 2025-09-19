import { Client } from 'minio';
import { Config } from '../utils/config';
import { Logger } from '../utils/logger';

export interface S3Config {
  endpoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  bucketName: string;
  region?: string;
}

export interface S3UploadResult {
  url: string;
  key: string;
  bucket: string;
}

export class S3Service {
  private static client: Client;
  private static config: S3Config;

  /**
   * Initialize S3-compatible storage client
   * Currently using MinIO as the S3-compatible implementation
   */
  static initialize(): void {
    const configData = Config.get();
    
    this.config = {
      endpoint: configData.S3_ENDPOINT,
      port: configData.S3_PORT,
      useSSL: configData.S3_USE_SSL,
      accessKey: configData.S3_ACCESS_KEY,
      secretKey: configData.S3_SECRET_KEY,
      bucketName: configData.S3_BUCKET_NAME,
      region: configData.S3_REGION
    };
    
    // Initialize MinIO client (S3-compatible)
    this.client = new Client({
      endPoint: this.config.endpoint,
      port: this.config.port,
      useSSL: this.config.useSSL,
      accessKey: this.config.accessKey,
      secretKey: this.config.secretKey
    });

    Logger.info('S3-compatible storage client initialized', {
      provider: 'MinIO',
      endpoint: this.config.endpoint,
      port: this.config.port,
      bucket: this.config.bucketName,
      region: this.config.region
    });
  }

  /**
   * Ensure bucket exists
   */
  static async ensureBucketExists(): Promise<void> {
    try {
      const exists = await this.client.bucketExists(this.config.bucketName);
      
      if (!exists) {
        await this.client.makeBucket(this.config.bucketName, this.config.region || 'us-east-1');
        Logger.info('S3 bucket created', { 
          bucketName: this.config.bucketName,
          region: this.config.region 
        });
      }
    } catch (error) {
      Logger.error('Failed to ensure bucket exists', error as Error);
      throw error;
    }
  }

  /**
   * Upload file to S3-compatible storage
   */
  static async uploadFile(
    buffer: Buffer, 
    key: string, 
    mimeType: string
  ): Promise<S3UploadResult> {
    try {
      await this.client.putObject(this.config.bucketName, key, buffer, buffer.length, {
        'Content-Type': mimeType
      });

      const url = `${this.config.useSSL ? 'https' : 'http'}://${this.config.endpoint}:${this.config.port}/${this.config.bucketName}/${key}`;
      
      const result: S3UploadResult = {
        url,
        key,
        bucket: this.config.bucketName
      };
      
      Logger.info('File uploaded to S3-compatible storage', { 
        key, 
        mimeType, 
        size: buffer.length,
        bucket: this.config.bucketName 
      });
      
      return result;
    } catch (error) {
      Logger.error('Failed to upload file to S3-compatible storage', error as Error, { key, mimeType });
      throw error;
    }
  }

  /**
   * Delete file from S3-compatible storage
   */
  static async deleteFile(key: string): Promise<void> {
    try {
      await this.client.removeObject(this.config.bucketName, key);
      
      Logger.info('File deleted from S3-compatible storage', { 
        key,
        bucket: this.config.bucketName 
      });
    } catch (error) {
      Logger.error('Failed to delete file from S3-compatible storage', error as Error, { key });
      throw error;
    }
  }

  /**
   * Get file info from S3-compatible storage
   */
  static async getFileInfo(key: string): Promise<any> {
    try {
      const stat = await this.client.statObject(this.config.bucketName, key);
      
      return stat;
    } catch (error) {
      Logger.error('Failed to get file info from S3-compatible storage', error as Error, { key });
      throw error;
    }
  }

  /**
   * Generate presigned URL for file access
   */
  static async getPresignedUrl(key: string, expiry: number = 7 * 24 * 60 * 60): Promise<string> {
    try {
      const url = await this.client.presignedGetObject(this.config.bucketName, key, expiry);
      
      return url;
    } catch (error) {
      Logger.error('Failed to generate presigned URL', error as Error, { key });
      throw error;
    }
  }

  /**
   * List files in a directory
   */
  static async listFiles(prefix: string = ''): Promise<any[]> {
    try {
      const objects: any[] = [];
      
      const stream = this.client.listObjects(this.config.bucketName, prefix, true);
      
      return new Promise((resolve, reject) => {
        stream.on('data', (obj: any) => objects.push(obj));
        stream.on('error', reject);
        stream.on('end', () => resolve(objects));
      });
    } catch (error) {
      Logger.error('Failed to list files from S3-compatible storage', error as Error, { prefix });
      throw error;
    }
  }

  /**
   * Get the current S3 configuration
   */
  static getConfig(): S3Config {
    return { ...this.config };
  }

  /**
   * Check if the service is properly initialized
   */
  static isInitialized(): boolean {
    return this.client !== undefined && this.config !== undefined;
  }
}

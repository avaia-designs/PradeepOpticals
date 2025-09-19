import { apiClient } from '../api-client';
import { ErrorHandler } from '../utils/error-handler';

export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

export interface FileUploadOptions {
  onProgress?: (progress: number) => void;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
}

export class FileUploadService {
  private static readonly DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly DEFAULT_ALLOWED_TYPES = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ];

  /**
   * Upload a single file to the general upload endpoint
   */
  static async uploadFile(
    file: File, 
    options: FileUploadOptions = {}
  ): Promise<FileUploadResponse> {
    try {
      // Validate file
      this.validateFile(file, options);

      const response = await apiClient.uploadFile<FileUploadResponse>(
        '/upload',
        file,
        options.onProgress
      );

      return response.data;
    } catch (error) {
      ErrorHandler.handleFileUploadError(error);
      throw error;
    }
  }

  /**
   * Upload multiple files
   */
  static async uploadFiles(
    files: File[],
    options: FileUploadOptions = {}
  ): Promise<FileUploadResponse[]> {
    try {
      // Validate all files
      files.forEach(file => this.validateFile(file, options));

      const uploadPromises = files.map(file => this.uploadFile(file, options));
      const results = await Promise.all(uploadPromises);

      return results;
    } catch (error) {
      ErrorHandler.handleFileUploadError(error);
      throw error;
    }
  }

  /**
   * Upload product images (for new products)
   */
  static async uploadProductImages(
    files: File[],
    options: FileUploadOptions = {}
  ): Promise<string[]> {
    try {
      const results = await this.uploadFiles(files, options);
      return results.map(result => result.url);
    } catch (error) {
      ErrorHandler.handleFileUploadError(error);
      throw error;
    }
  }

  /**
   * Validate file before upload
   */
  private static validateFile(file: File, options: FileUploadOptions): void {
    const maxSize = options.maxSize || this.DEFAULT_MAX_SIZE;
    const allowedTypes = options.allowedTypes || this.DEFAULT_ALLOWED_TYPES;

    // Check file size
    if (file.size > maxSize) {
      throw new Error(`File size must be less than ${this.formatFileSize(maxSize)}`);
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }
  }

  /**
   * Format file size for display
   */
  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Create a preview URL for a file
   */
  static createPreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  /**
   * Revoke a preview URL to free memory
   */
  static revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
  }
}

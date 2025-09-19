import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { S3Service } from '../services/s3.service';
import { Logger } from '../utils/logger';
import { AuthenticatedRequest } from '../types';
import config from '../utils/config';

/**
 * Upload controller
 * Handles file upload operations
 */
export class UploadController {
  /**
   * Upload single file
   * POST /api/v1/upload
   */
  static async uploadFile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'NO_FILE',
          message: 'No file provided'
        });
        return;
      }

      const file = req.file;
      const fileName = `${Date.now()}-${file.originalname}`;
      const filePath = `temp/${fileName}`;

      // Upload to S3-compatible storage
      const result = await S3Service.uploadFile(file.buffer, filePath, file.mimetype);
      const url = result.url;

      Logger.info('File uploaded successfully', { 
        fileName: file.originalname, 
        size: file.size, 
        mimeType: file.mimetype,
        url 
      });

      res.status(200).json({
        success: true,
        data: {
          url,
          filename: file.originalname,
          size: file.size,
          mimeType: file.mimetype
        },
        message: 'File uploaded successfully'
      });
    } catch (error) {
      Logger.error('Failed to upload file', error as Error);
      next(error);
    }
  }

  /**
   * Upload multiple files
   * POST /api/v1/upload/multiple
   */
  static async uploadMultipleFiles(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.files || req.files.length === 0) {
        res.status(400).json({
          success: false,
          error: 'NO_FILES',
          message: 'No files provided'
        });
        return;
      }

      const files = req.files as Express.Multer.File[];
      const uploadPromises = files.map(async (file) => {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.originalname}`;
        const filePath = `temp/${fileName}`;
        const result = await S3Service.uploadFile(file.buffer, filePath, file.mimetype);
        
        return {
          url: result.url,
          filename: file.originalname,
          size: file.size,
          mimeType: file.mimetype
        };
      });

      const results = await Promise.all(uploadPromises);

      Logger.info('Multiple files uploaded successfully', { 
        count: files.length,
        totalSize: files.reduce((sum, file) => sum + file.size, 0)
      });

      res.status(200).json({
        success: true,
        data: results,
        message: `${files.length} files uploaded successfully`
      });
    } catch (error) {
      Logger.error('Failed to upload multiple files', error as Error);
      next(error);
    }
  }

  /**
   * Delete file
   * DELETE /api/v1/upload
   */
  static async deleteFile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { url } = req.body;

      if (!url) {
        res.status(400).json({
          success: false,
          error: 'NO_URL',
          message: 'File URL is required'
        });
        return;
      }

      // Extract file path from URL
      const urlParts = url.split('/');
      const filePath = urlParts.slice(-2).join('/'); // Get last two parts (bucket/filename)

      await S3Service.deleteFile(filePath);

      Logger.info('File deleted successfully', { url });

      res.status(200).json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      Logger.error('Failed to delete file', error as Error);
      next(error);
    }
  }
}

/**
 * Multer configuration for file uploads
 */
export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.get().MAX_FILE_SIZE,
    files: 10 // Maximum 10 files per request
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = config.get().ALLOWED_FILE_TYPES;
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`));
    }
  }
});

import { Router } from 'express';
import { UploadController, uploadMiddleware } from '../controllers/upload.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

/**
 * File upload routes
 * All routes require authentication and staff/admin authorization
 */

/**
 * Upload single file
 * POST /api/v1/upload
 */
router.post('/', authenticate, authorize(['staff', 'admin']), uploadMiddleware.single('file'), UploadController.uploadFile);

/**
 * Upload multiple files
 * POST /api/v1/upload/multiple
 */
router.post('/multiple', authenticate, authorize(['staff', 'admin']), uploadMiddleware.array('files', 10), UploadController.uploadMultipleFiles);

/**
 * Delete file
 * DELETE /api/v1/upload
 */
router.delete('/', authenticate, authorize(['staff', 'admin']), UploadController.deleteFile);

export default router;

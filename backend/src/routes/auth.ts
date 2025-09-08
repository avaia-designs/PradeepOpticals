import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate, authValidation } from '../middleware/validation.middleware';

const router = Router();

/**
 * Authentication routes
 * All routes are prefixed with /api/v1/auth
 */

// Public routes (no authentication required)
router.post('/register', validate(authValidation.register), AuthController.register);
router.post('/login', validate(authValidation.login), AuthController.login);

// Protected routes (authentication required)
router.use(authenticate);

// User profile routes
router.get('/profile', AuthController.getProfile);
router.put('/profile', validate(authValidation.updateProfile), AuthController.updateProfile);
router.put('/change-password', validate(authValidation.changePassword), AuthController.changePassword);
router.post('/logout', AuthController.logout);

// Admin-only routes
router.put('/reset-password/:userId', authorize('admin'), validate(authValidation.resetPassword), AuthController.resetPassword);

export default router;

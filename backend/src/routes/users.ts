import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate, authValidation } from '../middleware/validation.middleware';

const router = Router();

/**
 * User management routes
 * All routes are prefixed with /api/v1/users
 * All routes require authentication
 */
router.use(authenticate);

// Admin only routes
router.use(authorize('admin'));

// User management routes
router.get('/', UserController.getAllUsers);
router.get('/statistics', UserController.getUserStatistics);
router.get('/staff', UserController.getStaffMembers);
router.get('/customers', UserController.getCustomers);
router.get('/:id', UserController.getUserById);
router.post('/staff', validate(authValidation.register), UserController.createStaffAccount);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

export default router;

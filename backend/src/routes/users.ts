import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate, authValidation } from '../middleware/validation.middleware';

const router = Router();

/**
 * User management routes
 * All routes are prefixed with /api/v1/users
 * All routes require authentication and admin authorization
 */

// User management routes (Admin only)
router.get('/', authenticate, authorize(['admin']), UserController.getAllUsers);
router.get('/statistics', authenticate, authorize(['admin']), UserController.getUserStatistics);
router.get('/staff', authenticate, authorize(['admin']), UserController.getStaffMembers);
router.get('/customers', authenticate, authorize(['admin']), UserController.getCustomers);
router.get('/:id', authenticate, authorize(['admin']), UserController.getUserById);
router.post('/staff', authenticate, authorize(['admin']), validate(authValidation.register), UserController.createStaffAccount);
router.put('/:id', authenticate, authorize(['admin']), UserController.updateUser);
router.delete('/:id', authenticate, authorize(['admin']), UserController.deleteUser);

export default router;

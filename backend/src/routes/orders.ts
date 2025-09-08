import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

/**
 * Order routes
 * All routes are prefixed with /api/v1/orders
 */

// Public routes (no authentication required)
// None for orders

// Protected routes (authentication required)
router.use(authenticate);

// User order routes
router.post('/checkout', OrderController.checkout);
router.get('/', OrderController.getUserOrders);
router.get('/:id', OrderController.getOrderById);
router.put('/:id/cancel', OrderController.cancelOrder);

// Staff/Admin only routes
router.use(authorize('staff', 'admin'));

// Staff order management routes
router.post('/walk-in', OrderController.createWalkInOrder);
router.get('/all', OrderController.getAllOrders);
router.put('/:id', OrderController.updateOrder);

// Admin only routes
router.use(authorize('admin'));

// Admin order statistics
router.get('/statistics', OrderController.getOrderStatistics);

export default router;

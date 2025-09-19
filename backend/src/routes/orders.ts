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

// User order routes (authentication required)
router.post('/checkout', authenticate, OrderController.checkout);
router.get('/', authenticate, OrderController.getUserOrders);
router.get('/:id', authenticate, OrderController.getOrderById);
router.put('/:id/cancel', authenticate, OrderController.cancelOrder);

// Staff order management routes (Staff/Admin only)
router.post('/walk-in', authenticate, authorize(['staff', 'admin']), OrderController.createWalkInOrder);
router.get('/all', authenticate, authorize(['staff', 'admin']), OrderController.getAllOrders);
router.put('/:id', authenticate, authorize(['staff', 'admin']), OrderController.updateOrder);

// Admin order statistics (Admin only)
router.get('/statistics', authenticate, authorize(['admin']), OrderController.getOrderStatistics);

export default router;

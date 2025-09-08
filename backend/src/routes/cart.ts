import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * Cart routes
 * All routes are prefixed with /api/v1/cart
 * All routes require authentication
 */
router.use(authenticate);

// Cart operations
router.get('/', CartController.getCart);
router.post('/items', CartController.addItem);
router.put('/items/:productId', CartController.updateItemQuantity);
router.delete('/items/:productId', CartController.removeItem);
router.delete('/', CartController.clearCart);

// Discount operations
router.post('/discount', CartController.applyDiscount);
router.delete('/discount', CartController.removeDiscount);

export default router;

import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.middleware';
import { validate, productValidation } from '../middleware/validation.middleware';

const router = Router();

/**
 * Product routes
 * All routes are prefixed with /api/v1/products
 */

// Public routes (no authentication required)
router.get('/', ProductController.getProducts);
router.get('/categories', ProductController.getCategories);
router.get('/brands', ProductController.getBrands);
router.get('/featured', ProductController.getFeaturedProducts);
router.get('/:id', ProductController.getProductById);

// Protected routes (Staff/Admin only)
router.use(authenticate);
router.use(authorize('staff', 'admin'));

// Product management routes
router.post('/', validate(productValidation.create), ProductController.createProduct);
router.put('/:id', validate(productValidation.update), ProductController.updateProduct);
router.delete('/:id', ProductController.deleteProduct);
router.put('/:id/inventory', ProductController.updateInventory);

export default router;

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

// Product management routes (Staff/Admin only)
router.post('/', authenticate, authorize(['staff', 'admin']), validate(productValidation.create), ProductController.createProduct);
router.put('/:id', authenticate, authorize(['staff', 'admin']), validate(productValidation.update), ProductController.updateProduct);
router.delete('/:id', authenticate, authorize(['staff', 'admin']), ProductController.deleteProduct);
router.put('/:id/inventory', authenticate, authorize(['staff', 'admin']), ProductController.updateInventory);

export default router;

import { Router } from 'express';
import healthRoutes from './health';

const router = Router();

/**
 * Main API routes
 * All routes are prefixed with /api/v1
 */
router.use('/health', healthRoutes);

// TODO: Add more route modules as they are created
// router.use('/users', userRoutes);
// router.use('/products', productRoutes);
// router.use('/orders', orderRoutes);
// router.use('/auth', authRoutes);

export default router;

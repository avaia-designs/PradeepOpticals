import { Router } from 'express';
import healthRoutes from './health';
import authRoutes from './auth';
import productRoutes from './products';
import cartRoutes from './cart';
import orderRoutes from './orders';
import appointmentRoutes from './appointments';
import userRoutes from './users';

const router = Router();

/**
 * Main API routes
 * All routes are prefixed with /api/v1
 */
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/users', userRoutes);

export default router;

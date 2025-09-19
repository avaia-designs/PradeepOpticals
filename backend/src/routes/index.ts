import { Router } from 'express';
import healthRoutes from './health';
import authRoutes from './auth';
import productRoutes from './products';
import cartRoutes from './cart';
import orderRoutes from './orders';
import appointmentRoutes from './appointments';
import quotationRoutes from './quotation';
import shopSettingsRoutes from './shopSettings';
import notificationRoutes from './notification';
import adminRoutes from './admin';
import userRoutes from './users';
import uploadRoutes from './upload';

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
router.use('/quotations', quotationRoutes);
router.use('/shop-settings', shopSettingsRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);
router.use('/users', userRoutes);
router.use('/upload', uploadRoutes);

export default router;

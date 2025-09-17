import { Router } from 'express';
import {
  getShopSettings,
  updateShopSettings,
  getAvailableSlots,
  resetShopSettings
} from '../controllers/shopSettings.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   GET /api/v1/shop-settings
 * @desc    Get current shop settings
 * @access  Public
 */
router.get('/', getShopSettings);

/**
 * @route   PUT /api/v1/shop-settings
 * @desc    Update shop settings (Admin only)
 * @access  Private (Admin)
 */
router.put('/', authenticate, authorize(['admin']), updateShopSettings);

/**
 * @route   GET /api/v1/shop-settings/available-slots
 * @desc    Get available appointment slots for a date
 * @access  Public
 */
router.get('/available-slots', getAvailableSlots);

/**
 * @route   POST /api/v1/shop-settings/reset
 * @desc    Reset shop settings to default (Admin only)
 * @access  Private (Admin)
 */
router.post('/reset', authenticate, authorize(['admin']), resetShopSettings);

export default router;

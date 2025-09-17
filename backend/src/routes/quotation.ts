import { Router } from 'express';
import {
  createQuotation,
  getUserQuotations,
  getAllQuotations,
  getQuotationById,
  approveQuotation,
  rejectQuotation,
  convertQuotationToOrder,
  updateQuotation,
  deleteQuotation
} from '../controllers/quotation.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   POST /api/v1/quotations
 * @desc    Create a new quotation request
 * @access  Private (Customer, Staff, Admin)
 */
router.post('/', authenticate, createQuotation);

/**
 * @route   GET /api/v1/quotations
 * @desc    Get quotations for authenticated user
 * @access  Private (Customer, Staff, Admin)
 */
router.get('/', authenticate, getUserQuotations);

/**
 * @route   GET /api/v1/quotations/all
 * @desc    Get all quotations (Staff/Admin only)
 * @access  Private (Staff, Admin)
 */
router.get('/all', authenticate, authorize(['staff', 'admin']), getAllQuotations);

/**
 * @route   GET /api/v1/quotations/:id
 * @desc    Get quotation by ID
 * @access  Private (Customer, Staff, Admin)
 */
router.get('/:id', authenticate, getQuotationById);

/**
 * @route   PUT /api/v1/quotations/:id/approve
 * @desc    Approve quotation (Staff/Admin only)
 * @access  Private (Staff, Admin)
 */
router.put('/:id/approve', authenticate, authorize(['staff', 'admin']), approveQuotation);

/**
 * @route   PUT /api/v1/quotations/:id/reject
 * @desc    Reject quotation (Staff/Admin only)
 * @access  Private (Staff, Admin)
 */
router.put('/:id/reject', authenticate, authorize(['staff', 'admin']), rejectQuotation);

/**
 * @route   POST /api/v1/quotations/:id/convert
 * @desc    Convert quotation to order (Staff/Admin only)
 * @access  Private (Staff, Admin)
 */
router.post('/:id/convert', authenticate, authorize(['staff', 'admin']), convertQuotationToOrder);

/**
 * @route   PUT /api/v1/quotations/:id
 * @desc    Update quotation (Staff/Admin only)
 * @access  Private (Staff, Admin)
 */
router.put('/:id', authenticate, authorize(['staff', 'admin']), updateQuotation);

/**
 * @route   DELETE /api/v1/quotations/:id
 * @desc    Delete quotation
 * @access  Private (Customer, Staff, Admin)
 */
router.delete('/:id', authenticate, deleteQuotation);

export default router;

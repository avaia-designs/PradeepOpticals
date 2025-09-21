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
  deleteQuotation,
  customerApproveQuotation,
  customerRejectQuotation,
  addStaffReply
} from '../controllers/quotation.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/auth.middleware';
import {
  validateCreateQuotation,
  validateUpdateQuotation,
  validateApproveQuotation,
  validateRejectQuotation,
  validateCustomerRejectQuotation,
  validateStaffReply
} from '../middleware/quotationValidation.middleware';

const router = Router();

/**
 * @route   POST /api/v1/quotations
 * @desc    Create a new quotation request
 * @access  Private (Customer, Staff, Admin)
 */
router.post('/', authenticate, validateCreateQuotation, createQuotation);

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
router.put('/:id/approve', authenticate, authorize(['staff', 'admin']), validateApproveQuotation, approveQuotation);

/**
 * @route   PUT /api/v1/quotations/:id/reject
 * @desc    Reject quotation (Staff/Admin only)
 * @access  Private (Staff, Admin)
 */
router.put('/:id/reject', authenticate, authorize(['staff', 'admin']), validateRejectQuotation, rejectQuotation);

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
router.put('/:id', authenticate, authorize(['staff', 'admin']), validateUpdateQuotation, updateQuotation);

/**
 * @route   DELETE /api/v1/quotations/:id
 * @desc    Delete quotation
 * @access  Private (Customer, Staff, Admin)
 */
router.delete('/:id', authenticate, deleteQuotation);

/**
 * @route   PUT /api/v1/quotations/:id/customer-approve
 * @desc    Customer approve quotation
 * @access  Private (Customer)
 */
router.put('/:id/customer-approve', authenticate, customerApproveQuotation);

/**
 * @route   PUT /api/v1/quotations/:id/customer-reject
 * @desc    Customer reject quotation
 * @access  Private (Customer)
 */
router.put('/:id/customer-reject', authenticate, validateCustomerRejectQuotation, customerRejectQuotation);

/**
 * @route   POST /api/v1/quotations/:id/staff-reply
 * @desc    Add staff reply to quotation
 * @access  Private (Staff, Admin)
 */
router.post('/:id/staff-reply', authenticate, authorize(['staff', 'admin']), validateStaffReply, addStaffReply);

export default router;

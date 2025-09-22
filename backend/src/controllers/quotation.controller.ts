import { Request, Response, NextFunction } from 'express';
import { Quotation, QuotationStatus } from '../models/Quotation';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { User } from '../models/User';
import { ApiResponse } from '../types';
import { generateOrderNumber, generateQuotationNumber } from '../utils/orderUtils';
import { NotificationService } from '../services/notification.service';
import { QuotationService } from '../services/quotation.service';

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

/**
 * Create a new quotation request
 */
export const createQuotation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const quotationData = {
      userId: req.user?.id || undefined,
      customerName: req.body.customerName,
      customerEmail: req.body.customerEmail,
      customerPhone: req.body.customerPhone,
      items: req.body.items,
      notes: req.body.notes,
      prescriptionFile: req.body.prescriptionFile
    };

    const quotation = await QuotationService.createQuotation(quotationData);

    const response: ApiResponse = {
      success: true,
      data: quotation,
      message: 'Quotation created successfully'
    };

    res.status(201).json(response);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: 'PRODUCT_NOT_FOUND',
          message: error.message
        });
      }
      if (error.message.includes('Insufficient inventory')) {
        return res.status(400).json({
          success: false,
          error: 'INSUFFICIENT_INVENTORY',
          message: error.message
        });
      }
    }
    next(error);
  }
};

/**
 * Get quotations for a user
 */
export const getUserQuotations = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'User not authenticated'
      });
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [quotations, total] = await Promise.all([
      Quotation.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Quotation.countDocuments({ userId })
    ]);

    const response: ApiResponse = {
      success: true,
      data: quotations,
      message: 'Quotations retrieved successfully',
      meta: {
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all quotations (Staff/Admin only)
 */
export const getAllQuotations = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const userRole = req.user?.role;

    if (!['staff', 'admin'].includes(userRole || '')) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Access denied. Staff or Admin role required.'
      });
    }

    const skip = (Number(page) - 1) * Number(limit);
    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    const [quotations, total] = await Promise.all([
      Quotation.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Quotation.countDocuments(filter)
    ]);

    const response: ApiResponse = {
      success: true,
      data: quotations,
      message: 'Quotations retrieved successfully',
      meta: {
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Get quotation by ID
 */
export const getQuotationById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const quotation = await Quotation.findById(id).lean();

    if (!quotation) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Quotation not found'
      });
    }

    // Check if user has access to this quotation
    if (quotation.userId !== userId && !['staff', 'admin'].includes(userRole || '')) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Access denied'
      });
    }

    const response: ApiResponse = {
      success: true,
      data: quotation,
      message: 'Quotation retrieved successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Approve quotation (Staff/Admin only)
 */
export const approveQuotation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { staffNotes } = req.body;
    const staffId = req.user?.id;
    const userRole = req.user?.role;

    if (!['staff', 'admin'].includes(userRole || '')) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Access denied. Staff or Admin role required.'
      });
    }

    const quotation = await Quotation.findById(id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Quotation not found'
      });
    }

    if (quotation.status !== QuotationStatus.PENDING) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_STATUS',
        message: 'Only pending quotations can be approved'
      });
    }

    quotation.status = QuotationStatus.APPROVED;
    quotation.approvedAt = new Date();
    quotation.approvedBy = staffId!;
    if (staffNotes) {
      quotation.staffNotes = staffNotes;
    }
    await quotation.save();

    // Create notification for customer
    try {
      await NotificationService.createQuotationApprovalNotification(
        quotation.userId,
        {
          quotationNumber: quotation.quotationNumber,
          totalAmount: quotation.totalAmount
        }
      );
    } catch (notificationError) {
      console.error('Failed to create quotation approval notification:', notificationError);
    }

    const response: ApiResponse = {
      success: true,
      data: quotation,
      message: 'Quotation approved successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Reject quotation (Staff/Admin only)
 */
export const rejectQuotation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { reason, staffNotes } = req.body;
    const staffId = req.user?.id;
    const userRole = req.user?.role;

    if (!['staff', 'admin'].includes(userRole || '')) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Access denied. Staff or Admin role required.'
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Rejection reason is required'
      });
    }

    const quotation = await Quotation.findById(id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Quotation not found'
      });
    }

    if (quotation.status !== QuotationStatus.PENDING) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_STATUS',
        message: 'Only pending quotations can be rejected'
      });
    }

    quotation.status = QuotationStatus.REJECTED;
    quotation.rejectedAt = new Date();
    quotation.rejectedBy = staffId!;
    quotation.rejectedReason = reason;
    if (staffNotes) {
      quotation.staffNotes = staffNotes;
    }
    await quotation.save();

    // Create notification for customer
    try {
      await NotificationService.createQuotationRejectionNotification(
        quotation.userId,
        {
          quotationNumber: quotation.quotationNumber,
          reason
        }
      );
    } catch (notificationError) {
      console.error('Failed to create quotation rejection notification:', notificationError);
    }

    const response: ApiResponse = {
      success: true,
      data: quotation,
      message: 'Quotation rejected successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Convert quotation to order (Staff/Admin only)
 */
export const convertQuotationToOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const staffId = req.user?.id;
    const userRole = req.user?.role;

    if (!['staff', 'admin'].includes(userRole || '')) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Access denied. Staff or Admin role required.'
      });
    }

    const quotation = await Quotation.findById(id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Quotation not found'
      });
    }

    if (quotation.status !== QuotationStatus.APPROVED) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_STATUS',
        message: 'Only approved quotations can be converted to orders'
      });
    }

    // Create order from quotation
    const orderNumber = generateOrderNumber();
    
    const order = new Order({
      orderNumber,
      userId: quotation.userId,
      items: quotation.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        specifications: item.specifications
      })),
      subtotal: quotation.subtotal,
      tax: quotation.tax,
      shipping: 0, // Free shipping for quotations
      discount: quotation.discount,
      totalAmount: quotation.totalAmount,
      status: 'confirmed',
      shippingAddress: {
        firstName: quotation.customerName.split(' ')[0] || '',
        lastName: quotation.customerName.split(' ').slice(1).join(' ') || '',
        street: 'N/A', // Will be updated during checkout
        city: 'N/A',
        state: 'N/A',
        zipCode: 'N/A',
        country: 'N/A',
        phone: quotation.customerPhone
      },
      paymentMethod: 'quotation',
      paymentStatus: 'pending',
      notes: quotation.notes,
      prescriptionFile: quotation.prescriptionFile,
      isWalkIn: false,
      staffId
    });

    await order.save();

    // Update quotation status
    quotation.status = QuotationStatus.CONVERTED;
    quotation.convertedAt = new Date();
    quotation.convertedToOrder = order._id.toString();
    await quotation.save();

    // Update product inventory
    for (const item of quotation.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { inventory: -item.quantity } }
      );
    }

    // Create notification for customer
    try {
      await NotificationService.createQuotationConversionNotification(
        quotation.userId,
        {
          quotationNumber: quotation.quotationNumber,
          orderNumber: order.orderNumber
        }
      );
    } catch (notificationError) {
      console.error('Failed to create quotation conversion notification:', notificationError);
    }

    const response: ApiResponse = {
      success: true,
      data: {
        quotation,
        order
      },
      message: 'Quotation converted to order successfully'
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Update quotation (Staff/Admin only)
 */
export const updateQuotation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { items, notes, staffNotes } = req.body;
    const userRole = req.user?.role;

    if (!['staff', 'admin'].includes(userRole || '')) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Access denied. Staff or Admin role required.'
      });
    }

    const quotation = await Quotation.findById(id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Quotation not found'
      });
    }

    if (quotation.status !== QuotationStatus.PENDING) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_STATUS',
        message: 'Only pending quotations can be updated'
      });
    }

    // Update items if provided
    if (items && Array.isArray(items)) {
      let subtotal = 0;
      const validatedItems = [];

      for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) {
          return res.status(400).json({
            success: false,
            error: 'PRODUCT_NOT_FOUND',
            message: `Product with ID ${item.productId} not found`
          });
        }

        const unitPrice = item.unitPrice || product.price;
        const totalPrice = unitPrice * item.quantity;
        subtotal += totalPrice;

        validatedItems.push({
          productId: product._id.toString(),
          productName: product.name,
          productImage: product.images[0] || '',
          quantity: item.quantity,
          unitPrice,
          totalPrice,
          specifications: item.specifications || {}
        });
      }

      quotation.items = validatedItems;
      quotation.subtotal = subtotal;
      quotation.totalAmount = subtotal + quotation.tax - quotation.discount;
    }

    // Update other fields
    if (notes !== undefined) quotation.notes = notes;
    if (staffNotes !== undefined) quotation.staffNotes = staffNotes;

    await quotation.save();

    const response: ApiResponse = {
      success: true,
      data: quotation,
      message: 'Quotation updated successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Customer approve quotation
 */
export const customerApproveQuotation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'User not authenticated'
      });
    }

    const quotation = await Quotation.findById(id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Quotation not found'
      });
    }

    // Check if user owns this quotation
    if (quotation.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Access denied'
      });
    }

    if (quotation.status !== QuotationStatus.APPROVED) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_STATUS',
        message: 'Only staff-approved quotations can be customer-approved'
      });
    }

    // Check if quotation is still valid
    if (quotation.validUntil < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'EXPIRED',
        message: 'Quotation has expired'
      });
    }

    // Update quotation status to customer approved
    quotation.status = QuotationStatus.CONVERTED; // Ready for order conversion
    quotation.customerApprovedAt = new Date();
    await quotation.save();

    // Create notification for staff
    try {
      await NotificationService.createCustomerApprovalNotification(
        quotation.approvedBy || 'staff',
        {
          quotationNumber: quotation.quotationNumber,
          customerName: quotation.customerName
        }
      );
    } catch (notificationError) {
      console.error('Failed to create customer approval notification:', notificationError);
    }

    const response: ApiResponse = {
      success: true,
      data: quotation,
      message: 'Quotation approved successfully. Ready for order conversion.'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Customer reject quotation
 */
export const customerRejectQuotation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'User not authenticated'
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Rejection reason is required'
      });
    }

    const quotation = await Quotation.findById(id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Quotation not found'
      });
    }

    // Check if user owns this quotation
    if (quotation.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Access denied'
      });
    }

    if (quotation.status !== QuotationStatus.APPROVED) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_STATUS',
        message: 'Only staff-approved quotations can be customer-rejected'
      });
    }

    // Update quotation status
    quotation.status = QuotationStatus.REJECTED;
    quotation.customerRejectedAt = new Date();
    quotation.customerRejectionReason = reason;
    await quotation.save();

    // Create notification for staff
    try {
      await NotificationService.createCustomerRejectionNotification(
        quotation.approvedBy || 'staff',
        {
          quotationNumber: quotation.quotationNumber,
          customerName: quotation.customerName,
          reason
        }
      );
    } catch (notificationError) {
      console.error('Failed to create customer rejection notification:', notificationError);
    }

    const response: ApiResponse = {
      success: true,
      data: quotation,
      message: 'Quotation rejected successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Add staff reply to quotation
 */
export const addStaffReply = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const staffId = req.user?.id;
    const userRole = req.user?.role;

    if (!['staff', 'admin'].includes(userRole || '')) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Access denied. Staff or Admin role required.'
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Message is required'
      });
    }

    const quotation = await Quotation.findById(id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Quotation not found'
      });
    }

    // Add staff reply to quotation
    if (!quotation.staffReplies) {
      quotation.staffReplies = [];
    }

    quotation.staffReplies.push({
      message,
      staffId: staffId!,
      repliedAt: new Date()
    });

    await quotation.save();

    // Create notification for customer
    try {
      await NotificationService.createStaffReplyNotification(
        quotation.userId,
        {
          quotationNumber: quotation.quotationNumber,
          message
        }
      );
    } catch (notificationError) {
      console.error('Failed to create staff reply notification:', notificationError);
    }

    const response: ApiResponse = {
      success: true,
      data: quotation,
      message: 'Staff reply added successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete quotation
 */
export const deleteQuotation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const quotation = await Quotation.findById(id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Quotation not found'
      });
    }

    // Check if user has permission to delete
    if (quotation.userId !== userId && !['staff', 'admin'].includes(userRole || '')) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Access denied'
      });
    }

    // Only allow deletion of pending quotations
    if (quotation.status !== QuotationStatus.PENDING) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_STATUS',
        message: 'Only pending quotations can be deleted'
      });
    }

    await Quotation.findByIdAndDelete(id);

    const response: ApiResponse = {
      success: true,
      data: null,
      message: 'Quotation deleted successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

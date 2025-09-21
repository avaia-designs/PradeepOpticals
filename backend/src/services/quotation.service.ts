import { Quotation, QuotationStatus, IQuotation } from '../models/Quotation';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { generateQuotationNumber, generateOrderNumber } from '../utils/orderUtils';
import { Logger } from '../utils/logger';

export interface CreateQuotationData {
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: Array<{
    productId: string;
    quantity: number;
    specifications?: Record<string, any>;
  }>;
  notes?: string;
  prescriptionFile?: string;
}

export interface QuotationFilters {
  status?: QuotationStatus;
  userId?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface QuotationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  converted: number;
  expired: number;
}

export class QuotationService {
  /**
   * Create a new quotation
   */
  static async createQuotation(data: CreateQuotationData): Promise<IQuotation> {
    try {
      Logger.info('Creating new quotation', { customerEmail: data.customerEmail });

      // Validate and calculate totals
      let subtotal = 0;
      const validatedItems = [];

      for (const item of data.items) {
        const product = await Product.findById(item.productId);
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        if (product.inventory < item.quantity) {
          throw new Error(`Insufficient inventory for product ${product.name}`);
        }

        const unitPrice = product.price;
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

      // Calculate tax and discount
      const tax = subtotal * 0.1; // 10% tax
      const discount = 0; // No discount initially
      const totalAmount = subtotal + tax - discount;

      // Generate quotation number
      const quotationNumber = generateQuotationNumber();
      
      // Set validity period (30 days from now)
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 30);

      // Create quotation
      const quotation = new Quotation({
        quotationNumber,
        userId: data.userId || null,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        items: validatedItems,
        subtotal,
        tax,
        discount,
        totalAmount,
        status: QuotationStatus.PENDING,
        notes: data.notes,
        prescriptionFile: data.prescriptionFile,
        validUntil
      });

      await quotation.save();

      Logger.info('Quotation created successfully', { 
        quotationId: quotation._id,
        quotationNumber: quotation.quotationNumber 
      });

      return quotation;
    } catch (error) {
      Logger.error('Failed to create quotation', error as Error, { customerEmail: data.customerEmail });
      throw error;
    }
  }

  /**
   * Get quotations with filters
   */
  static async getQuotations(filters: QuotationFilters): Promise<{
    quotations: IQuotation[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    try {
      const { page = 1, limit = 10, status, userId, search } = filters;
      const skip = (page - 1) * limit;
      
      const query: any = {};

      if (status) {
        query.status = status;
      }

      if (userId) {
        query.userId = userId;
      }

      if (search) {
        query.$or = [
          { quotationNumber: { $regex: search, $options: 'i' } },
          { customerName: { $regex: search, $options: 'i' } },
          { customerEmail: { $regex: search, $options: 'i' } }
        ];
      }

      const [quotations, total] = await Promise.all([
        Quotation.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Quotation.countDocuments(query)
      ]);

      return {
        quotations,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      Logger.error('Failed to get quotations', error as Error, { filters });
      throw error;
    }
  }

  /**
   * Get quotation by ID
   */
  static async getQuotationById(id: string): Promise<IQuotation | null> {
    try {
      const quotation = await Quotation.findById(id).lean();
      return quotation;
    } catch (error) {
      Logger.error('Failed to get quotation by ID', error as Error, { quotationId: id });
      throw error;
    }
  }

  /**
   * Approve quotation
   */
  static async approveQuotation(id: string, staffId: string, staffNotes?: string): Promise<IQuotation> {
    try {
      const quotation = await Quotation.findById(id);
      if (!quotation) {
        throw new Error('Quotation not found');
      }

      if (quotation.status !== QuotationStatus.PENDING) {
        throw new Error('Only pending quotations can be approved');
      }

      quotation.status = QuotationStatus.APPROVED;
      quotation.approvedAt = new Date();
      quotation.approvedBy = staffId;
      if (staffNotes) {
        quotation.staffNotes = staffNotes;
      }

      await quotation.save();

      Logger.info('Quotation approved', { 
        quotationId: id, 
        quotationNumber: quotation.quotationNumber,
        staffId 
      });

      return quotation;
    } catch (error) {
      Logger.error('Failed to approve quotation', error as Error, { quotationId: id, staffId });
      throw error;
    }
  }

  /**
   * Reject quotation
   */
  static async rejectQuotation(id: string, staffId: string, reason: string, staffNotes?: string): Promise<IQuotation> {
    try {
      const quotation = await Quotation.findById(id);
      if (!quotation) {
        throw new Error('Quotation not found');
      }

      if (quotation.status !== QuotationStatus.PENDING) {
        throw new Error('Only pending quotations can be rejected');
      }

      quotation.status = QuotationStatus.REJECTED;
      quotation.rejectedAt = new Date();
      quotation.rejectedBy = staffId;
      quotation.rejectedReason = reason;
      if (staffNotes) {
        quotation.staffNotes = staffNotes;
      }

      await quotation.save();

      Logger.info('Quotation rejected', { 
        quotationId: id, 
        quotationNumber: quotation.quotationNumber,
        staffId,
        reason 
      });

      return quotation;
    } catch (error) {
      Logger.error('Failed to reject quotation', error as Error, { quotationId: id, staffId, reason });
      throw error;
    }
  }

  /**
   * Customer approve quotation
   */
  static async customerApproveQuotation(id: string, userId: string): Promise<IQuotation> {
    try {
      const quotation = await Quotation.findById(id);
      if (!quotation) {
        throw new Error('Quotation not found');
      }

      if (quotation.userId !== userId) {
        throw new Error('Access denied');
      }

      if (quotation.status !== QuotationStatus.APPROVED) {
        throw new Error('Only staff-approved quotations can be customer-approved');
      }

      if (quotation.validUntil < new Date()) {
        throw new Error('Quotation has expired');
      }

      quotation.status = QuotationStatus.CONVERTED;
      quotation.customerApprovedAt = new Date();
      await quotation.save();

      Logger.info('Quotation customer approved', { 
        quotationId: id, 
        quotationNumber: quotation.quotationNumber,
        userId 
      });

      return quotation;
    } catch (error) {
      Logger.error('Failed to customer approve quotation', error as Error, { quotationId: id, userId });
      throw error;
    }
  }

  /**
   * Customer reject quotation
   */
  static async customerRejectQuotation(id: string, userId: string, reason: string): Promise<IQuotation> {
    try {
      const quotation = await Quotation.findById(id);
      if (!quotation) {
        throw new Error('Quotation not found');
      }

      if (quotation.userId !== userId) {
        throw new Error('Access denied');
      }

      if (quotation.status !== QuotationStatus.APPROVED) {
        throw new Error('Only staff-approved quotations can be customer-rejected');
      }

      quotation.status = QuotationStatus.REJECTED;
      quotation.customerRejectedAt = new Date();
      quotation.customerRejectionReason = reason;
      await quotation.save();

      Logger.info('Quotation customer rejected', { 
        quotationId: id, 
        quotationNumber: quotation.quotationNumber,
        userId,
        reason 
      });

      return quotation;
    } catch (error) {
      Logger.error('Failed to customer reject quotation', error as Error, { quotationId: id, userId, reason });
      throw error;
    }
  }

  /**
   * Add staff reply to quotation
   */
  static async addStaffReply(id: string, staffId: string, message: string): Promise<IQuotation> {
    try {
      const quotation = await Quotation.findById(id);
      if (!quotation) {
        throw new Error('Quotation not found');
      }

      if (!quotation.staffReplies) {
        quotation.staffReplies = [];
      }

      quotation.staffReplies.push({
        message,
        staffId,
        repliedAt: new Date()
      });

      await quotation.save();

      Logger.info('Staff reply added to quotation', { 
        quotationId: id, 
        quotationNumber: quotation.quotationNumber,
        staffId 
      });

      return quotation;
    } catch (error) {
      Logger.error('Failed to add staff reply', error as Error, { quotationId: id, staffId });
      throw error;
    }
  }

  /**
   * Convert quotation to order
   */
  static async convertQuotationToOrder(id: string, staffId: string): Promise<{ quotation: IQuotation; order: any }> {
    try {
      const quotation = await Quotation.findById(id);
      if (!quotation) {
        throw new Error('Quotation not found');
      }

      if (quotation.status !== QuotationStatus.CONVERTED) {
        throw new Error('Only customer-approved quotations can be converted to orders');
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

      Logger.info('Quotation converted to order', { 
        quotationId: id, 
        quotationNumber: quotation.quotationNumber,
        orderId: order._id,
        orderNumber: order.orderNumber,
        staffId 
      });

      return { quotation, order };
    } catch (error) {
      Logger.error('Failed to convert quotation to order', error as Error, { quotationId: id, staffId });
      throw error;
    }
  }

  /**
   * Get quotation statistics
   */
  static async getQuotationStats(): Promise<QuotationStats> {
    try {
      const [total, pending, approved, rejected, converted, expired] = await Promise.all([
        Quotation.countDocuments(),
        Quotation.countDocuments({ status: QuotationStatus.PENDING }),
        Quotation.countDocuments({ status: QuotationStatus.APPROVED }),
        Quotation.countDocuments({ status: QuotationStatus.REJECTED }),
        Quotation.countDocuments({ status: QuotationStatus.CONVERTED }),
        Quotation.countDocuments({ 
          validUntil: { $lt: new Date() },
          status: { $in: [QuotationStatus.PENDING, QuotationStatus.APPROVED] }
        })
      ]);

      return {
        total,
        pending,
        approved,
        rejected,
        converted,
        expired
      };
    } catch (error) {
      Logger.error('Failed to get quotation stats', error as Error);
      throw error;
    }
  }

  /**
   * Update quotation
   */
  static async updateQuotation(id: string, updateData: {
    items?: any[];
    notes?: string;
    staffNotes?: string;
  }): Promise<IQuotation> {
    try {
      const quotation = await Quotation.findById(id);
      if (!quotation) {
        throw new Error('Quotation not found');
      }

      if (quotation.status !== QuotationStatus.PENDING) {
        throw new Error('Only pending quotations can be updated');
      }

      // Update items if provided
      if (updateData.items && Array.isArray(updateData.items)) {
        let subtotal = 0;
        const validatedItems = [];

        for (const item of updateData.items) {
          const product = await Product.findById(item.productId);
          if (!product) {
            throw new Error(`Product with ID ${item.productId} not found`);
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
      if (updateData.notes !== undefined) quotation.notes = updateData.notes;
      if (updateData.staffNotes !== undefined) quotation.staffNotes = updateData.staffNotes;

      await quotation.save();

      Logger.info('Quotation updated', { 
        quotationId: id, 
        quotationNumber: quotation.quotationNumber 
      });

      return quotation;
    } catch (error) {
      Logger.error('Failed to update quotation', error as Error, { quotationId: id });
      throw error;
    }
  }

  /**
   * Delete quotation
   */
  static async deleteQuotation(id: string): Promise<void> {
    try {
      const quotation = await Quotation.findById(id);
      if (!quotation) {
        throw new Error('Quotation not found');
      }

      if (quotation.status !== QuotationStatus.PENDING) {
        throw new Error('Only pending quotations can be deleted');
      }

      await Quotation.findByIdAndDelete(id);

      Logger.info('Quotation deleted', { 
        quotationId: id, 
        quotationNumber: quotation.quotationNumber 
      });
    } catch (error) {
      Logger.error('Failed to delete quotation', error as Error, { quotationId: id });
      throw error;
    }
  }
}

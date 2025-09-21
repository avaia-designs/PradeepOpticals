import mongoose, { Schema, Document } from 'mongoose';
import { BaseModel } from '../types';

// Quotation status enum
export enum QuotationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CONVERTED = 'converted',
  EXPIRED = 'expired'
}

// Quotation item interface
export interface IQuotationItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specifications?: {
    material?: string;
    color?: string;
    size?: string;
    lensType?: string;
    prescription?: string;
  };
}

// Quotation interface extending BaseModel
export interface IQuotation extends BaseModel {
  quotationNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: IQuotationItem[];
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  status: QuotationStatus;
  notes?: string;
  prescriptionFile?: string;
  validUntil: Date;
  approvedAt?: Date;
  approvedBy?: string; // Staff member who approved
  rejectedAt?: Date;
  rejectedBy?: string; // Staff member who rejected
  rejectedReason?: string;
  convertedAt?: Date;
  convertedToOrder?: string; // Order ID if converted
  staffNotes?: string; // Internal notes from staff
  customerApprovedAt?: Date;
  customerRejectedAt?: Date;
  customerRejectionReason?: string;
  staffReplies?: Array<{
    message: string;
    staffId: string;
    repliedAt: Date;
  }>;
}

// Quotation document interface for Mongoose
export interface IQuotationDocument extends Omit<IQuotation, '_id'>, Document {
  _id: mongoose.Types.ObjectId;
}

// Quotation schema definition
const quotationSchema = new Schema<IQuotationDocument>({
  quotationNumber: {
    type: String,
    required: [true, 'Quotation number is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^QUO-\d{8}-\d{4}$/, 'Quotation number must be in format QUO-YYYYMMDD-XXXX']
  },
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    index: true
  },
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    minlength: [2, 'Customer name must be at least 2 characters long'],
    maxlength: [100, 'Customer name cannot exceed 100 characters']
  },
  customerEmail: {
    type: String,
    required: [true, 'Customer email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  customerPhone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  items: [{
    productId: {
      type: String,
      required: [true, 'Product ID is required']
    },
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    productImage: {
      type: String,
      required: [true, 'Product image is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price cannot be negative']
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Total price cannot be negative']
    },
    specifications: {
      material: String,
      color: String,
      size: String,
      lensType: String,
      prescription: String
    }
  }],
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal cannot be negative']
  },
  tax: {
    type: Number,
    required: [true, 'Tax is required'],
    min: [0, 'Tax cannot be negative'],
    default: 0
  },
  discount: {
    type: Number,
    required: [true, 'Discount is required'],
    min: [0, 'Discount cannot be negative'],
    default: 0
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  status: {
    type: String,
    enum: Object.values(QuotationStatus),
    default: QuotationStatus.PENDING,
    index: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  prescriptionFile: {
    type: String,
    default: null
  },
  validUntil: {
    type: Date,
    required: [true, 'Valid until date is required'],
    index: true
  },
  approvedAt: {
    type: Date,
    default: null
  },
  approvedBy: {
    type: String,
    default: null,
    index: true
  },
  rejectedAt: {
    type: Date,
    default: null
  },
  rejectedBy: {
    type: String,
    default: null,
    index: true
  },
  rejectedReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  },
  convertedAt: {
    type: Date,
    default: null
  },
  convertedToOrder: {
    type: String,
    default: null,
    index: true
  },
  staffNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Staff notes cannot exceed 1000 characters']
  },
  customerApprovedAt: {
    type: Date,
    default: null
  },
  customerRejectedAt: {
    type: Date,
    default: null
  },
  customerRejectionReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Customer rejection reason cannot exceed 500 characters']
  },
  staffReplies: [{
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Staff reply message cannot exceed 1000 characters']
    },
    staffId: {
      type: String,
      required: true
    },
    repliedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'modifiedAt' },
  versionKey: false
});

// Compound indexes for optimized queries
quotationSchema.index({ userId: 1, createdAt: -1 });
quotationSchema.index({ status: 1, createdAt: -1 });
quotationSchema.index({ validUntil: 1, status: 1 });
quotationSchema.index({ approvedBy: 1, createdAt: -1 });

// Pre-save middleware to generate quotation number
quotationSchema.pre('save', async function(next) {
  if (this.isNew && !this.quotationNumber) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    this.quotationNumber = `QUO-${dateStr}-${randomNum}`;
  }
  next();
});

// Pre-save middleware to set valid until date (30 days from creation)
quotationSchema.pre('save', function(next) {
  if (this.isNew && !this.validUntil) {
    this.validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  }
  next();
});

// Static method to find quotations by user
quotationSchema.statics.findByUser = function(userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

// Static method to find quotations by status
quotationSchema.statics.findByStatus = function(status: QuotationStatus) {
  return this.find({ status }).sort({ createdAt: -1 });
};

// Static method to find expired quotations
quotationSchema.statics.findExpired = function() {
  return this.find({
    validUntil: { $lt: new Date() },
    status: { $in: [QuotationStatus.PENDING, QuotationStatus.APPROVED] }
  });
};

// Instance method to approve quotation
quotationSchema.methods.approve = function(staffId: string, staffNotes?: string) {
  this.status = QuotationStatus.APPROVED;
  this.approvedAt = new Date();
  this.approvedBy = staffId;
  if (staffNotes) {
    this.staffNotes = staffNotes;
  }
  return this.save();
};

// Instance method to reject quotation
quotationSchema.methods.reject = function(staffId: string, reason: string, staffNotes?: string) {
  this.status = QuotationStatus.REJECTED;
  this.rejectedAt = new Date();
  this.rejectedBy = staffId;
  this.rejectedReason = reason;
  if (staffNotes) {
    this.staffNotes = staffNotes;
  }
  return this.save();
};

// Instance method to convert quotation to order
quotationSchema.methods.convertToOrder = function(orderId: string) {
  this.status = QuotationStatus.CONVERTED;
  this.convertedAt = new Date();
  this.convertedToOrder = orderId;
  return this.save();
};

// Instance method to check if quotation is expired
quotationSchema.methods.isExpired = function() {
  return this.validUntil < new Date();
};

// Instance method to calculate total
quotationSchema.methods.calculateTotal = function() {
  this.subtotal = this.items.reduce((sum: number, item: IQuotationItem) => sum + item.totalPrice, 0);
  this.totalAmount = this.subtotal + this.tax - this.discount;
  return this.totalAmount;
};

// Export the Quotation model
export const Quotation = mongoose.model<IQuotationDocument>('Quotation', quotationSchema);

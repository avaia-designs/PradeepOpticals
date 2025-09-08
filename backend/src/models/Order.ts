import mongoose, { Schema, Document } from 'mongoose';
import { BaseModel } from '../types';

// Order status enum
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

// Order item interface
export interface IOrderItem {
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
  };
}

// Shipping address interface
export interface IShippingAddress {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

// Order interface extending BaseModel
export interface IOrder extends BaseModel {
  orderNumber: string;
  userId: string;
  items: IOrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: IShippingAddress;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  notes?: string;
  prescriptionFile?: string;
  isWalkIn: boolean;
  staffId?: string; // For walk-in orders created by staff
}

// Order document interface for Mongoose
export interface IOrderDocument extends Omit<IOrder, '_id'>, Document {
  _id: mongoose.Types.ObjectId;
}

// Order schema definition
const orderSchema = new Schema<IOrderDocument>({
  orderNumber: {
    type: String,
    required: [true, 'Order number is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^ORD-\d{8}-\d{4}$/, 'Order number must be in format ORD-YYYYMMDD-XXXX']
  },
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    index: true
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
      size: String
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
  shipping: {
    type: Number,
    required: [true, 'Shipping cost is required'],
    min: [0, 'Shipping cost cannot be negative'],
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
    enum: Object.values(OrderStatus),
    default: OrderStatus.PENDING,
    index: true
  },
  shippingAddress: {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters long']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters long']
    },
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true,
      minlength: [5, 'Street address must be at least 5 characters long']
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      minlength: [2, 'City must be at least 2 characters long']
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      minlength: [2, 'State must be at least 2 characters long']
    },
    zipCode: {
      type: String,
      required: [true, 'ZIP code is required'],
      trim: true,
      match: [/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code']
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      minlength: [2, 'Country must be at least 2 characters long']
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
    }
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    trim: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
    index: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  prescriptionFile: {
    type: String,
    default: null
  },
  isWalkIn: {
    type: Boolean,
    default: false,
    index: true
  },
  staffId: {
    type: String,
    default: null,
    index: true
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'modifiedAt' },
  versionKey: false
});

// Compound indexes for optimized queries
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ isWalkIn: 1, createdAt: -1 });
orderSchema.index({ staffId: 1, createdAt: -1 });

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    this.orderNumber = `ORD-${dateStr}-${randomNum}`;
  }
  next();
});

// Static method to find orders by user
orderSchema.statics.findByUser = function(userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

// Static method to find orders by status
orderSchema.statics.findByStatus = function(status: OrderStatus) {
  return this.find({ status }).sort({ createdAt: -1 });
};

// Static method to find walk-in orders
orderSchema.statics.findWalkInOrders = function() {
  return this.find({ isWalkIn: true }).sort({ createdAt: -1 });
};

// Instance method to update status
orderSchema.methods.updateStatus = function(newStatus: OrderStatus, notes?: string) {
  this.status = newStatus;
  if (notes) {
    this.notes = notes;
  }
  return this.save();
};

// Instance method to calculate total
orderSchema.methods.calculateTotal = function() {
  this.subtotal = this.items.reduce((sum: number, item: IOrderItem) => sum + item.totalPrice, 0);
  this.totalAmount = this.subtotal + this.tax + this.shipping - this.discount;
  return this.totalAmount;
};

// Export the Order model
export const Order = mongoose.model<IOrderDocument>('Order', orderSchema);

import mongoose, { Schema, Document } from 'mongoose';

/**
 * Cart item interface
 */
export interface ICartItem {
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specifications?: {
    material?: string;
    color?: string;
    size?: string;
  };
}

/**
 * Cart interface extending BaseModel
 */
export interface ICart extends Document {
  _id: mongoose.Types.ObjectId;
  userId: string;
  items: ICartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  totalAmount: number;
  itemCount: number;
  createdAt: Date;
  modifiedAt: Date;
}

/**
 * Cart item schema
 */
const cartItemSchema = new Schema<ICartItem>({
  productId: { 
    type: String, 
    required: true,
    ref: 'Product'
  },
  productName: { 
    type: String, 
    required: true 
  },
  productImage: { 
    type: String 
  },
  quantity: { 
    type: Number, 
    required: true, 
    min: 1 
  },
  unitPrice: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  totalPrice: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  specifications: {
    material: String,
    color: String,
    size: String
  }
}, { _id: false });

/**
 * Cart schema
 */
const cartSchema = new Schema<ICart>({
  userId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  items: [cartItemSchema],
  subtotal: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  tax: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  shipping: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  discount: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  totalAmount: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  itemCount: { 
    type: Number, 
    default: 0, 
    min: 0 
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'modifiedAt' },
  versionKey: false
});

// Indexes for better performance
cartSchema.index({ userId: 1 });
cartSchema.index({ 'items.productId': 1 });

export const Cart = mongoose.model<ICart>('Cart', cartSchema);

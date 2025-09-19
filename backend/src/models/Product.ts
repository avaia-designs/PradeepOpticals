import mongoose, { Schema, Document } from 'mongoose';
import { BaseModel } from '../types';

// Product interface extending BaseModel
export interface IProduct extends BaseModel {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: mongoose.Types.ObjectId;
  brand?: mongoose.Types.ObjectId;
  images: string[];
  inventory: number;
  sku: string;
  specifications: {
    material?: string;
    color?: string;
    size?: string;
    weight?: number;
    dimensions?: {
      width?: number;
      height?: number;
      depth?: number;
    };
  };
  tags: string[];
  isActive: boolean;
  featured: boolean;
  rating?: number;
  reviewCount: number;
}

// Product document interface for Mongoose
export interface IProductDocument extends Omit<IProduct, '_id'>, Document {
  _id: mongoose.Types.ObjectId;
}

// Product schema definition
const productSchema = new Schema<IProductDocument>({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    minlength: [2, 'Product name must be at least 2 characters long'],
    maxlength: [100, 'Product name cannot exceed 100 characters'],
    index: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    minlength: [10, 'Product description must be at least 10 characters long'],
    maxlength: [1000, 'Product description cannot exceed 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative'],
    index: true
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative'],
    validate: {
      validator: function(this: IProductDocument, value: number) {
        return !value || value >= this.price;
      },
      message: 'Original price must be greater than or equal to current price'
    }
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product category is required'],
    index: true
  },
  brand: {
    type: Schema.Types.ObjectId,
    ref: 'Brand',
    index: true
  },
  images: [{
    type: String,
    required: true
  }],
  inventory: {
    type: Number,
    required: [true, 'Inventory count is required'],
    min: [0, 'Inventory cannot be negative'],
    default: 0,
    index: true
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z0-9\-_]+$/, 'SKU must contain only uppercase letters, numbers, hyphens, and underscores']
  },
  specifications: {
    material: String,
    color: String,
    size: String,
    weight: Number,
    dimensions: {
      width: Number,
      height: Number,
      depth: Number
    }
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  featured: {
    type: Boolean,
    default: false,
    index: true
  },
  rating: {
    type: Number,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5'],
    default: 0
  },
  reviewCount: {
    type: Number,
    min: [0, 'Review count cannot be negative'],
    default: 0
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'modifiedAt' },
  versionKey: false,
  toJSON: {
    transform: function(doc, ret: any) {
      // Calculate discount percentage if original price exists
      if (ret.originalPrice && ret.price < ret.originalPrice) {
        ret.discountPercentage = Math.round(((ret.originalPrice - ret.price) / ret.originalPrice) * 100);
      }
      return ret;
    }
  }
});

// Compound indexes for optimized queries
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ brand: 1, isActive: 1 });
productSchema.index({ price: 1, isActive: 1 });
productSchema.index({ featured: 1, isActive: 1 });
productSchema.index({ rating: -1, isActive: 1 });
productSchema.index({ createdAt: -1, isActive: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Static method to find active products
productSchema.statics.findActiveProducts = function() {
  return this.find({ isActive: true });
};

// Static method to find featured products
productSchema.statics.findFeaturedProducts = function() {
  return this.find({ featured: true, isActive: true });
};

// Static method to find products by category
productSchema.statics.findByCategory = function(category: string) {
  return this.find({ category, isActive: true });
};

// Instance method to check if product is in stock
productSchema.methods.isInStock = function(): boolean {
  return this.inventory > 0;
};

// Instance method to update inventory
productSchema.methods.updateInventory = function(quantity: number): boolean {
  if (this.inventory + quantity < 0) {
    return false; // Insufficient inventory
  }
  this.inventory += quantity;
  return true;
};

// Export the Product model
export const Product = mongoose.model<IProductDocument>('Product', productSchema);

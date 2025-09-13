import mongoose, { Schema, Document } from 'mongoose';
import { BaseModel } from '../types';

// Brand interface extending BaseModel
export interface IBrand extends BaseModel {
  name: string;
  slug: string;
  description: string;
  logo?: string;
  website?: string;
  isActive: boolean;
  productCount: number;
  country?: string;
  establishedYear?: number;
}

// Brand document interface for Mongoose
export interface IBrandDocument extends Omit<IBrand, '_id'>, Document {
  _id: mongoose.Types.ObjectId;
}

// Brand schema definition
const brandSchema = new Schema<IBrandDocument>({
  name: {
    type: String,
    required: [true, 'Brand name is required'],
    trim: true,
    unique: true,
    minlength: [2, 'Brand name must be at least 2 characters long'],
    maxlength: [100, 'Brand name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: [true, 'Brand slug is required'],
    trim: true,
    unique: true,
    lowercase: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
  },
  description: {
    type: String,
    required: [true, 'Brand description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  logo: {
    type: String,
    trim: true,
    default: null
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Website must be a valid URL'],
    default: null
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  productCount: {
    type: Number,
    default: 0,
    min: [0, 'Product count cannot be negative']
  },
  country: {
    type: String,
    trim: true,
    maxlength: [100, 'Country name cannot exceed 100 characters'],
    default: null
  },
  establishedYear: {
    type: Number,
    min: [1800, 'Established year must be after 1800'],
    max: [new Date().getFullYear(), 'Established year cannot be in the future'],
    default: null
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'modifiedAt' },
  versionKey: false
});

// Indexes for optimized queries
brandSchema.index({ slug: 1, isActive: 1 });
brandSchema.index({ isActive: 1, productCount: -1 });
brandSchema.index({ country: 1, isActive: 1 });

// Pre-save middleware to generate slug if not provided
brandSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  next();
});

// Static method to find active brands
brandSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ name: 1 });
};

// Static method to find brands with product count
brandSchema.statics.findWithProductCount = function() {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: 'brand._id',
        as: 'products'
      }
    },
    {
      $addFields: {
        productCount: { $size: '$products' }
      }
    },
    { $sort: { name: 1 } }
  ]);
};

// Instance method to update product count
brandSchema.methods.updateProductCount = async function() {
  const Product = mongoose.model('Product');
  const count = await Product.countDocuments({ 'brand._id': this._id, isActive: true });
  this.productCount = count;
  return this.save();
};

// Export the Brand model
export const Brand = mongoose.model<IBrandDocument>('Brand', brandSchema);

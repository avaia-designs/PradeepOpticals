import mongoose, { Schema, Document } from 'mongoose';
import { BaseModel } from '../types';

// Category interface extending BaseModel
export interface ICategory extends BaseModel {
  name: string;
  slug: string;
  description: string;
  image?: string;
  isActive: boolean;
  parentCategory?: string;
  productCount: number;
}

// Category document interface for Mongoose
export interface ICategoryDocument extends Omit<ICategory, '_id'>, Document {
  _id: mongoose.Types.ObjectId;
}

// Category schema definition
const categorySchema = new Schema<ICategoryDocument>({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true,
    minlength: [2, 'Category name must be at least 2 characters long'],
    maxlength: [100, 'Category name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: [true, 'Category slug is required'],
    trim: true,
    unique: true,
    lowercase: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
  },
  description: {
    type: String,
    required: [true, 'Category description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  image: {
    type: String,
    trim: true,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  parentCategory: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  productCount: {
    type: Number,
    default: 0,
    min: [0, 'Product count cannot be negative']
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'modifiedAt' },
  versionKey: false
});

// Indexes for optimized queries
categorySchema.index({ slug: 1, isActive: 1 });
categorySchema.index({ parentCategory: 1, isActive: 1 });
categorySchema.index({ isActive: 1, productCount: -1 });

// Pre-save middleware to generate slug if not provided
categorySchema.pre('save', function(next) {
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

// Static method to find active categories
categorySchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ name: 1 });
};

// Static method to find categories with product count
categorySchema.statics.findWithProductCount = function() {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: 'category._id',
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
categorySchema.methods.updateProductCount = async function() {
  const Product = mongoose.model('Product');
  const count = await Product.countDocuments({ 'category._id': this._id, isActive: true });
  this.productCount = count;
  return this.save();
};

// Export the Category model
export const Category = mongoose.model<ICategoryDocument>('Category', categorySchema);

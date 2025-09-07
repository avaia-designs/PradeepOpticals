import mongoose, { Schema, Document } from 'mongoose';
import { BaseModel, UserRole } from '../types';

// User interface extending BaseModel
export interface IUser extends BaseModel {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  profile: {
    avatar?: string;
    phone?: string;
    dateOfBirth?: Date;
  };
  isActive: boolean;
  lastLoginAt?: Date;
}

// User document interface for Mongoose
export interface IUserDocument extends Omit<IUser, '_id'>, Document {
  _id: mongoose.Types.ObjectId;
}

// User schema definition
const userSchema = new Schema<IUserDocument>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER,
    index: true
  },
  profile: {
    avatar: {
      type: String,
      default: null
    },
    phone: {
      type: String,
      default: null,
      match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
    },
    dateOfBirth: {
      type: Date,
      default: null
    }
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  lastLoginAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'modifiedAt' },
  versionKey: false,
  toJSON: {
    transform: function(doc, ret: any) {
      // Remove password from JSON output
      if ('password' in ret) {
        delete ret.password;
      }
      return ret;
    }
  }
});

// Compound indexes for optimized queries
userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ role: 1, createdAt: -1 });
userSchema.index({ isActive: 1, lastLoginAt: -1 });

// Pre-save middleware for password hashing (to be implemented)
userSchema.pre('save', async function(next) {
  // Password hashing will be implemented in the service layer
  next();
});

// Static method to find active users
userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true });
};

// Instance method to check if user is admin
userSchema.methods.isAdmin = function(): boolean {
  return this.role === UserRole.ADMIN;
};

// Export the User model
export const User = mongoose.model<IUserDocument>('User', userSchema);

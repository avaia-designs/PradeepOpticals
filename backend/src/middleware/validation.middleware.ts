import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { Logger } from '../utils/logger';

/**
 * Generic validation middleware factory
 */
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      Logger.warn('Validation failed', { error: error.details[0].message, body: req.body });
      
      res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: error.details[0].message,
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
      return;
    }
    
    next();
  };
};

/**
 * Validation schemas for authentication
 */
export const authValidation = {
  register: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please enter a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'Password is required'
      }),
    name: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name cannot exceed 50 characters',
        'any.required': 'Name is required'
      }),
    phone: Joi.string()
      .pattern(/^\+?[\d\s\-\(\)]+$/)
      .optional()
      .messages({
        'string.pattern.base': 'Please enter a valid phone number'
      })
  }),

  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please enter a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required'
      })
  }),

  updateProfile: Joi.object({
    name: Joi.string()
      .min(2)
      .max(50)
      .optional()
      .messages({
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name cannot exceed 50 characters'
      }),
    phone: Joi.string()
      .pattern(/^\+?[\d\s\-\(\)]+$/)
      .optional()
      .messages({
        'string.pattern.base': 'Please enter a valid phone number'
      }),
    dateOfBirth: Joi.date()
      .max('now')
      .optional()
      .messages({
        'date.max': 'Date of birth cannot be in the future'
      })
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string()
      .required()
      .messages({
        'any.required': 'Current password is required'
      }),
    newPassword: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .required()
      .messages({
        'string.min': 'New password must be at least 8 characters long',
        'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'New password is required'
      })
  }),

  resetPassword: Joi.object({
    newPassword: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'Password is required'
      })
  })
};

/**
 * Validation schemas for products
 */
export const productValidation = {
  create: Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Product name must be at least 2 characters long',
        'string.max': 'Product name cannot exceed 100 characters',
        'any.required': 'Product name is required'
      }),
    description: Joi.string()
      .min(10)
      .max(1000)
      .required()
      .messages({
        'string.min': 'Product description must be at least 10 characters long',
        'string.max': 'Product description cannot exceed 1000 characters',
        'any.required': 'Product description is required'
      }),
    price: Joi.number()
      .min(0)
      .required()
      .messages({
        'number.min': 'Price cannot be negative',
        'any.required': 'Price is required'
      }),
    originalPrice: Joi.number()
      .min(0)
      .optional()
      .messages({
        'number.min': 'Original price cannot be negative'
      }),
    category: Joi.string()
      .required()
      .messages({
        'any.required': 'Category is required'
      }),
    subcategory: Joi.string()
      .optional(),
    brand: Joi.string()
      .optional(),
    images: Joi.array()
      .items(Joi.string())
      .min(1)
      .required()
      .messages({
        'array.min': 'At least one product image is required',
        'any.required': 'Product images are required'
      }),
    inventory: Joi.number()
      .min(0)
      .required()
      .messages({
        'number.min': 'Inventory cannot be negative',
        'any.required': 'Inventory count is required'
      }),
    sku: Joi.string()
      .pattern(/^[A-Z0-9\-_]+$/)
      .required()
      .messages({
        'string.pattern.base': 'SKU must contain only uppercase letters, numbers, hyphens, and underscores',
        'any.required': 'SKU is required'
      }),
    specifications: Joi.object({
      material: Joi.string().optional(),
      color: Joi.string().optional(),
      size: Joi.string().optional(),
      weight: Joi.number().min(0).optional(),
      dimensions: Joi.object({
        width: Joi.number().min(0).optional(),
        height: Joi.number().min(0).optional(),
        depth: Joi.number().min(0).optional()
      }).optional()
    }).optional(),
    tags: Joi.array()
      .items(Joi.string())
      .optional(),
    featured: Joi.boolean()
      .optional()
  }),

  update: Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .optional(),
    description: Joi.string()
      .min(10)
      .max(1000)
      .optional(),
    price: Joi.number()
      .min(0)
      .optional(),
    originalPrice: Joi.number()
      .min(0)
      .optional(),
    category: Joi.string()
      .optional(),
    subcategory: Joi.string()
      .optional(),
    brand: Joi.string()
      .optional(),
    images: Joi.array()
      .items(Joi.string())
      .min(1)
      .optional(),
    inventory: Joi.number()
      .min(0)
      .optional(),
    sku: Joi.string()
      .pattern(/^[A-Z0-9\-_]+$/)
      .optional(),
    specifications: Joi.object({
      material: Joi.string().optional(),
      color: Joi.string().optional(),
      size: Joi.string().optional(),
      weight: Joi.number().min(0).optional(),
      dimensions: Joi.object({
        width: Joi.number().min(0).optional(),
        height: Joi.number().min(0).optional(),
        depth: Joi.number().min(0).optional()
      }).optional()
    }).optional(),
    tags: Joi.array()
      .items(Joi.string())
      .optional(),
    featured: Joi.boolean()
      .optional(),
    isActive: Joi.boolean()
      .optional()
  })
};

/**
 * Validation schemas for appointments
 */
export const appointmentValidation = {
  create: Joi.object({
    customerName: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Customer name must be at least 2 characters long',
        'string.max': 'Customer name cannot exceed 100 characters',
        'any.required': 'Customer name is required'
      }),
    customerEmail: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please enter a valid email address',
        'any.required': 'Customer email is required'
      }),
    customerPhone: Joi.string()
      .pattern(/^\+?[\d\s\-\(\)]+$/)
      .optional()
      .messages({
        'string.pattern.base': 'Please enter a valid phone number'
      }),
    appointmentDate: Joi.date()
      .min('now')
      .required()
      .messages({
        'date.min': 'Appointment date cannot be in the past',
        'any.required': 'Appointment date is required'
      }),
    startTime: Joi.string()
      .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required()
      .messages({
        'string.pattern.base': 'Start time must be in HH:MM format',
        'any.required': 'Start time is required'
      }),
    endTime: Joi.string()
      .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required()
      .messages({
        'string.pattern.base': 'End time must be in HH:MM format',
        'any.required': 'End time is required'
      }),
    reason: Joi.string()
      .min(10)
      .max(500)
      .required()
      .messages({
        'string.min': 'Appointment reason must be at least 10 characters long',
        'string.max': 'Appointment reason cannot exceed 500 characters',
        'any.required': 'Appointment reason is required'
      }),
    notes: Joi.string()
      .max(1000)
      .optional()
      .messages({
        'string.max': 'Notes cannot exceed 1000 characters'
      })
  })
};

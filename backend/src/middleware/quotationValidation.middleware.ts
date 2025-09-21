import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// Validation schema for creating quotation
const createQuotationSchema = Joi.object({
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
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required().messages({
          'any.required': 'Product ID is required for each item'
        }),
        quantity: Joi.number()
          .integer()
          .min(1)
          .required()
          .messages({
            'number.min': 'Quantity must be at least 1',
            'any.required': 'Quantity is required for each item'
          }),
        specifications: Joi.object({
          material: Joi.string().optional(),
          color: Joi.string().optional(),
          size: Joi.string().optional(),
          lensType: Joi.string().optional(),
          prescription: Joi.string().optional()
        }).optional()
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one item is required',
      'any.required': 'Items array is required'
    }),
  notes: Joi.string()
    .max(1000)
    .optional()
    .messages({
      'string.max': 'Notes cannot exceed 1000 characters'
    }),
  prescriptionFile: Joi.string().optional()
});

// Validation schema for updating quotation
const updateQuotationSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
        unitPrice: Joi.number().min(0).optional(),
        specifications: Joi.object({
          material: Joi.string().optional(),
          color: Joi.string().optional(),
          size: Joi.string().optional(),
          lensType: Joi.string().optional(),
          prescription: Joi.string().optional()
        }).optional()
      })
    )
    .min(1)
    .optional(),
  notes: Joi.string().max(1000).optional(),
  staffNotes: Joi.string().max(1000).optional()
});

// Validation schema for approving quotation
const approveQuotationSchema = Joi.object({
  staffNotes: Joi.string()
    .max(1000)
    .optional()
    .messages({
      'string.max': 'Staff notes cannot exceed 1000 characters'
    })
});

// Validation schema for rejecting quotation
const rejectQuotationSchema = Joi.object({
  reason: Joi.string()
    .min(5)
    .max(500)
    .required()
    .messages({
      'string.min': 'Rejection reason must be at least 5 characters long',
      'string.max': 'Rejection reason cannot exceed 500 characters',
      'any.required': 'Rejection reason is required'
    }),
  staffNotes: Joi.string()
    .max(1000)
    .optional()
    .messages({
      'string.max': 'Staff notes cannot exceed 1000 characters'
    })
});

// Validation schema for customer rejection
const customerRejectQuotationSchema = Joi.object({
  reason: Joi.string()
    .min(5)
    .max(500)
    .required()
    .messages({
      'string.min': 'Rejection reason must be at least 5 characters long',
      'string.max': 'Rejection reason cannot exceed 500 characters',
      'any.required': 'Rejection reason is required'
    })
});

// Validation schema for staff reply
const staffReplySchema = Joi.object({
  message: Joi.string()
    .min(1)
    .max(1000)
    .required()
    .messages({
      'string.min': 'Message cannot be empty',
      'string.max': 'Message cannot exceed 1000 characters',
      'any.required': 'Message is required'
    })
});

/**
 * Validate create quotation request
 */
export const validateCreateQuotation = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = createQuotationSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: errorMessages
    });
  }

  req.body = value;
  next();
};

/**
 * Validate update quotation request
 */
export const validateUpdateQuotation = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = updateQuotationSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: errorMessages
    });
  }

  req.body = value;
  next();
};

/**
 * Validate approve quotation request
 */
export const validateApproveQuotation = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = approveQuotationSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: errorMessages
    });
  }

  req.body = value;
  next();
};

/**
 * Validate reject quotation request
 */
export const validateRejectQuotation = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = rejectQuotationSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: errorMessages
    });
  }

  req.body = value;
  next();
};

/**
 * Validate customer reject quotation request
 */
export const validateCustomerRejectQuotation = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = customerRejectQuotationSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: errorMessages
    });
  }

  req.body = value;
  next();
};

/**
 * Validate staff reply request
 */
export const validateStaffReply = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = staffReplySchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: errorMessages
    });
  }

  req.body = value;
  next();
};

/**
 * Generate a unique order number
 * Format: ORD-YYYYMMDD-XXXX
 */
export const generateOrderNumber = (): string => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${dateStr}-${randomNum}`;
};

/**
 * Generate a unique appointment number
 * Format: APT-YYYYMMDD-XXXX
 */
export const generateAppointmentNumber = (): string => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `APT-${dateStr}-${randomNum}`;
};

/**
 * Generate a unique quotation number
 * Format: QUO-YYYYMMDD-XXXX
 */
export const generateQuotationNumber = (): string => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `QUO-${dateStr}-${randomNum}`;
};

/**
 * Calculate order totals
 */
export const calculateOrderTotals = (items: any[], taxRate: number = 0.1, discount: number = 0) => {
  const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const tax = subtotal * taxRate;
  const totalAmount = subtotal + tax - discount;

  return {
    subtotal,
    tax,
    discount,
    totalAmount
  };
};

/**
 * Validate order items
 */
export const validateOrderItems = (items: any[]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!Array.isArray(items) || items.length === 0) {
    errors.push('Items array is required and must not be empty');
    return { isValid: false, errors };
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    
    if (!item.productId) {
      errors.push(`Item ${i + 1}: Product ID is required`);
    }
    
    if (!item.quantity || item.quantity <= 0) {
      errors.push(`Item ${i + 1}: Quantity must be greater than 0`);
    }
    
    if (!item.unitPrice || item.unitPrice < 0) {
      errors.push(`Item ${i + 1}: Unit price must be greater than or equal to 0`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

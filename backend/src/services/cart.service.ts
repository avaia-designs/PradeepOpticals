import { Product } from '../models';
import { Logger } from '../utils/logger';

export interface CartItem {
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

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  totalAmount: number;
  itemCount: number;
}

export class CartService {
  /**
   * Add item to cart
   */
  static addItem(
    cart: Cart,
    productId: string,
    quantity: number,
    specifications?: {
      material?: string;
      color?: string;
      size?: string;
    }
  ): Cart {
    try {
      Logger.info('Adding item to cart', { productId, quantity });

      // Find existing item
      const existingItemIndex = cart.items.findIndex(item => item.productId === productId);

      if (existingItemIndex > -1) {
        // Update existing item quantity
        cart.items[existingItemIndex].quantity += quantity;
        cart.items[existingItemIndex].totalPrice = 
          cart.items[existingItemIndex].quantity * cart.items[existingItemIndex].unitPrice;
      } else {
        // Add new item - we need to get product details
        // In a real implementation, you'd fetch from database
        // For now, we'll create a placeholder
        const newItem: CartItem = {
          productId,
          productName: 'Product Name', // This should be fetched from database
          productImage: '/placeholder-image.jpg',
          quantity,
          unitPrice: 0, // This should be fetched from database
          totalPrice: 0,
          specifications
        };
        cart.items.push(newItem);
      }

      // Recalculate totals
      this.calculateTotals(cart);

      Logger.info('Item added to cart successfully', { productId, quantity });
      return cart;
    } catch (error) {
      Logger.error('Failed to add item to cart', error as Error, { productId, quantity });
      throw error;
    }
  }

  /**
   * Update item quantity in cart
   */
  static updateItemQuantity(cart: Cart, productId: string, quantity: number): Cart {
    try {
      Logger.info('Updating item quantity in cart', { productId, quantity });

      const itemIndex = cart.items.findIndex(item => item.productId === productId);
      
      if (itemIndex === -1) {
        throw new Error('Item not found in cart');
      }

      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
        cart.items[itemIndex].totalPrice = 
          cart.items[itemIndex].quantity * cart.items[itemIndex].unitPrice;
      }

      // Recalculate totals
      this.calculateTotals(cart);

      Logger.info('Item quantity updated successfully', { productId, quantity });
      return cart;
    } catch (error) {
      Logger.error('Failed to update item quantity', error as Error, { productId, quantity });
      throw error;
    }
  }

  /**
   * Remove item from cart
   */
  static removeItem(cart: Cart, productId: string): Cart {
    try {
      Logger.info('Removing item from cart', { productId });

      cart.items = cart.items.filter(item => item.productId !== productId);

      // Recalculate totals
      this.calculateTotals(cart);

      Logger.info('Item removed from cart successfully', { productId });
      return cart;
    } catch (error) {
      Logger.error('Failed to remove item from cart', error as Error, { productId });
      throw error;
    }
  }

  /**
   * Clear cart
   */
  static clearCart(cart: Cart): Cart {
    try {
      Logger.info('Clearing cart');

      cart.items = [];
      cart.subtotal = 0;
      cart.tax = 0;
      cart.shipping = 0;
      cart.discount = 0;
      cart.totalAmount = 0;
      cart.itemCount = 0;

      Logger.info('Cart cleared successfully');
      return cart;
    } catch (error) {
      Logger.error('Failed to clear cart', error as Error);
      throw error;
    }
  }

  /**
   * Apply discount to cart
   */
  static applyDiscount(cart: Cart, discountAmount: number): Cart {
    try {
      Logger.info('Applying discount to cart', { discountAmount });

      if (discountAmount < 0) {
        throw new Error('Discount amount cannot be negative');
      }

      if (discountAmount > cart.subtotal) {
        throw new Error('Discount amount cannot exceed subtotal');
      }

      cart.discount = discountAmount;
      this.calculateTotals(cart);

      Logger.info('Discount applied successfully', { discountAmount });
      return cart;
    } catch (error) {
      Logger.error('Failed to apply discount', error as Error, { discountAmount });
      throw error;
    }
  }

  /**
   * Remove discount from cart
   */
  static removeDiscount(cart: Cart): Cart {
    try {
      Logger.info('Removing discount from cart');

      cart.discount = 0;
      this.calculateTotals(cart);

      Logger.info('Discount removed successfully');
      return cart;
    } catch (error) {
      Logger.error('Failed to remove discount', error as Error);
      throw error;
    }
  }

  /**
   * Calculate cart totals
   */
  static calculateTotals(cart: Cart): void {
    // Calculate subtotal
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);

    // Calculate item count
    cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    // Calculate tax (assuming 8.5% tax rate)
    cart.tax = cart.subtotal * 0.085;

    // Calculate shipping (free shipping over $50)
    cart.shipping = cart.subtotal >= 50 ? 0 : 10;

    // Calculate total amount
    cart.totalAmount = cart.subtotal + cart.tax + cart.shipping - cart.discount;
  }

  /**
   * Validate cart against current product data
   */
  static async validateCart(cart: Cart): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      for (const item of cart.items) {
        const product = await Product.findById(item.productId);
        
        if (!product) {
          errors.push(`Product ${item.productName} is no longer available`);
          continue;
        }

        if (!product.isActive) {
          errors.push(`Product ${item.productName} is no longer available`);
          continue;
        }

        if (product.inventory < item.quantity) {
          errors.push(`Only ${product.inventory} units of ${item.productName} available`);
          continue;
        }

        if (product.price !== item.unitPrice) {
          errors.push(`Price for ${item.productName} has changed`);
        }
      }

      return {
        valid: errors.length === 0,
        errors
      };
    } catch (error) {
      Logger.error('Failed to validate cart', error as Error);
      return {
        valid: false,
        errors: ['Failed to validate cart']
      };
    }
  }
}
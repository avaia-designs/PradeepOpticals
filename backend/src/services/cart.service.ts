import { Product } from '../models';
import { Cart, ICart, ICartItem } from '../models/cart.model';
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

export interface CartResponse {
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
   * Get user's cart from database
   */
  static async getCart(userId: string): Promise<CartResponse> {
    try {
      let cart = await Cart.findOne({ userId });
      
      if (!cart) {
        // Create empty cart if none exists
        cart = new Cart({
          userId,
          items: [],
          subtotal: 0,
          tax: 0,
          shipping: 0,
          discount: 0,
          totalAmount: 0,
          itemCount: 0
        });
        await cart.save();
      }

      return this.convertToResponse(cart);
    } catch (error) {
      Logger.error('Failed to get cart', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Add item to cart in database
   */
  static async addItem(
    userId: string,
    productId: string,
    quantity: number,
    specifications?: {
      material?: string;
      color?: string;
      size?: string;
    }
  ): Promise<CartResponse> {
    try {
      Logger.info('Adding item to cart', { userId, productId, quantity });

      // Get product details
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      if (!product.isActive) {
        throw new Error('Product is not available');
      }

      if (product.inventory < quantity) {
        throw new Error(`Only ${product.inventory} units available`);
      }

      // Get or create cart
      let cart = await Cart.findOne({ userId });
      if (!cart) {
        cart = new Cart({
          userId,
          items: [],
          subtotal: 0,
          tax: 0,
          shipping: 0,
          discount: 0,
          totalAmount: 0,
          itemCount: 0
        });
      }

      // Check if item already exists
      const existingItemIndex = cart.items.findIndex(item => item.productId === productId);
      
      if (existingItemIndex > -1) {
        // Update existing item
        cart.items[existingItemIndex].quantity += quantity;
        cart.items[existingItemIndex].totalPrice = 
          cart.items[existingItemIndex].quantity * cart.items[existingItemIndex].unitPrice;
      } else {
        // Add new item
        const newItem: ICartItem = {
          productId,
          productName: product.name,
          productImage: (Array.isArray(product.images) && product.images.length > 0 
            ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url)
            : undefined) || '/placeholder-image.jpg',
          quantity,
          unitPrice: product.price,
          totalPrice: product.price * quantity,
          specifications
        };
        cart.items.push(newItem);
      }

      // Recalculate totals
      this.calculateTotals(cart);
      await cart.save();

      Logger.info('Item added to cart successfully', { userId, productId, quantity });
      return this.convertToResponse(cart);
    } catch (error) {
      Logger.error('Failed to add item to cart', error as Error, { userId, productId, quantity });
      throw error;
    }
  }

  /**
   * Update item quantity in cart in database
   */
  static async updateItemQuantity(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<CartResponse> {
    try {
      Logger.info('Updating item quantity in cart', { userId, productId, quantity });

      const cart = await Cart.findOne({ userId });
      if (!cart) {
        throw new Error('Cart not found');
      }

      const itemIndex = cart.items.findIndex(item => item.productId === productId);
      if (itemIndex === -1) {
        throw new Error('Item not found in cart');
      }

      if (quantity <= 0) {
        // Remove item
        cart.items.splice(itemIndex, 1);
      } else {
        // Update quantity
        cart.items[itemIndex].quantity = quantity;
        cart.items[itemIndex].totalPrice = 
          cart.items[itemIndex].quantity * cart.items[itemIndex].unitPrice;
      }

      // Recalculate totals
      this.calculateTotals(cart);
      await cart.save();

      Logger.info('Item quantity updated successfully', { userId, productId, quantity });
      return this.convertToResponse(cart);
    } catch (error) {
      Logger.error('Failed to update item quantity', error as Error, { userId, productId, quantity });
      throw error;
    }
  }

  /**
   * Remove item from cart in database
   */
  static async removeItem(userId: string, productId: string): Promise<CartResponse> {
    try {
      Logger.info('Removing item from cart', { userId, productId });

      const cart = await Cart.findOne({ userId });
      if (!cart) {
        throw new Error('Cart not found');
      }

      cart.items = cart.items.filter(item => item.productId !== productId);
      this.calculateTotals(cart);
      await cart.save();

      Logger.info('Item removed from cart successfully', { userId, productId });
      return this.convertToResponse(cart);
    } catch (error) {
      Logger.error('Failed to remove item from cart', error as Error, { userId, productId });
      throw error;
    }
  }

  /**
   * Clear cart in database
   */
  static async clearCart(userId: string): Promise<CartResponse> {
    try {
      Logger.info('Clearing cart', { userId });

      const cart = await Cart.findOne({ userId });
      if (!cart) {
        // Return empty cart if none exists
        return {
          items: [],
          subtotal: 0,
          tax: 0,
          shipping: 0,
          discount: 0,
          totalAmount: 0,
          itemCount: 0
        };
      }

      cart.items = [];
      this.calculateTotals(cart);
      await cart.save();

      Logger.info('Cart cleared successfully', { userId });
      return this.convertToResponse(cart);
    } catch (error) {
      Logger.error('Failed to clear cart', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Apply discount to cart in database
   */
  static async applyDiscount(userId: string, discountAmount: number): Promise<CartResponse> {
    try {
      Logger.info('Applying discount to cart', { userId, discountAmount });

      const cart = await Cart.findOne({ userId });
      if (!cart) {
        throw new Error('Cart not found');
      }

      if (discountAmount < 0) {
        throw new Error('Discount amount cannot be negative');
      }

      if (discountAmount > cart.subtotal) {
        throw new Error('Discount amount cannot exceed subtotal');
      }

      cart.discount = discountAmount;
      this.calculateTotals(cart);
      await cart.save();

      Logger.info('Discount applied successfully', { userId, discountAmount });
      return this.convertToResponse(cart);
    } catch (error) {
      Logger.error('Failed to apply discount', error as Error, { userId, discountAmount });
      throw error;
    }
  }

  /**
   * Remove discount from cart in database
   */
  static async removeDiscount(userId: string): Promise<CartResponse> {
    try {
      Logger.info('Removing discount from cart', { userId });

      const cart = await Cart.findOne({ userId });
      if (!cart) {
        throw new Error('Cart not found');
      }

      cart.discount = 0;
      this.calculateTotals(cart);
      await cart.save();

      Logger.info('Discount removed successfully', { userId });
      return this.convertToResponse(cart);
    } catch (error) {
      Logger.error('Failed to remove discount', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Convert database cart to response format
   */
  private static convertToResponse(cart: ICart): CartResponse {
    return {
      items: cart.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage || '/placeholder-image.jpg',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        specifications: item.specifications
      })),
      subtotal: cart.subtotal,
      tax: cart.tax,
      shipping: cart.shipping,
      discount: cart.discount,
      totalAmount: cart.totalAmount,
      itemCount: cart.itemCount
    };
  }


  /**
   * Calculate cart totals
   */
  static calculateTotals(cart: ICart): void {
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
  static async validateCart(cart: CartResponse): Promise<{ valid: boolean; errors: string[] }> {
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
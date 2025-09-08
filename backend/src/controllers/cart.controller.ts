import { Request, Response, NextFunction } from 'express';
import { CartService, Cart } from '../services/cart.service';
import { AuthenticatedRequest } from '../types';
import { Logger } from '../utils/logger';

/**
 * Cart controller
 * Handles shopping cart operations
 */
export class CartController {
  /**
   * Get cart contents
   * GET /api/v1/cart
   */
  static async getCart(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // In a real implementation, you would store cart in database or session
      // For now, we'll use a simple in-memory approach
      let cart: Cart = req.session?.cart || {
        items: [],
        subtotal: 0,
        tax: 0,
        shipping: 0,
        discount: 0,
        totalAmount: 0,
        itemCount: 0
      };

      // Validate cart against current product data
      const validation = await CartService.validateCart(cart);
      if (!validation.valid) {
        // Remove invalid items
        cart.items = cart.items.filter(item => 
          !validation.errors.some(error => error.includes(item.productName))
        );
        CartService.calculateTotals(cart);
      }

      Logger.info('Cart retrieved successfully', { itemCount: cart.itemCount });

      res.status(200).json({
        success: true,
        data: cart,
        message: 'Cart retrieved successfully'
      });
    } catch (error) {
      Logger.error('Failed to get cart', error as Error);
      next(error);
    }
  }

  /**
   * Add item to cart
   * POST /api/v1/cart/items
   */
  static async addItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { productId, quantity, specifications } = req.body;

      if (!productId || !quantity || quantity <= 0) {
        res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Product ID and valid quantity are required'
        });
        return;
      }

      // Get current cart
      let cart: Cart = req.session?.cart || {
        items: [],
        subtotal: 0,
        tax: 0,
        shipping: 0,
        discount: 0,
        totalAmount: 0,
        itemCount: 0
      };

      // Add item to cart
      cart = CartService.addItem(cart, productId, quantity, specifications);

      // Store cart in session
      if (req.session) {
        req.session.cart = cart;
      }

      Logger.info('Item added to cart successfully', { productId, quantity });

      res.status(200).json({
        success: true,
        data: cart,
        message: 'Item added to cart successfully'
      });
    } catch (error) {
      Logger.error('Failed to add item to cart', error as Error);
      next(error);
    }
  }

  /**
   * Update item quantity in cart
   * PUT /api/v1/cart/items/:productId
   */
  static async updateItemQuantity(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { productId } = req.params;
      const { quantity } = req.body;

      if (!quantity || quantity < 0) {
        res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Valid quantity is required'
        });
        return;
      }

      // Get current cart
      let cart: Cart = req.session?.cart || {
        items: [],
        subtotal: 0,
        tax: 0,
        shipping: 0,
        discount: 0,
        totalAmount: 0,
        itemCount: 0
      };

      // Update item quantity
      cart = CartService.updateItemQuantity(cart, productId, quantity);

      // Store cart in session
      if (req.session) {
        req.session.cart = cart;
      }

      Logger.info('Item quantity updated successfully', { productId, quantity });

      res.status(200).json({
        success: true,
        data: cart,
        message: 'Item quantity updated successfully'
      });
    } catch (error) {
      Logger.error('Failed to update item quantity', error as Error);
      next(error);
    }
  }

  /**
   * Remove item from cart
   * DELETE /api/v1/cart/items/:productId
   */
  static async removeItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { productId } = req.params;

      // Get current cart
      let cart: Cart = req.session?.cart || {
        items: [],
        subtotal: 0,
        tax: 0,
        shipping: 0,
        discount: 0,
        totalAmount: 0,
        itemCount: 0
      };

      // Remove item from cart
      cart = CartService.removeItem(cart, productId);

      // Store cart in session
      if (req.session) {
        req.session.cart = cart;
      }

      Logger.info('Item removed from cart successfully', { productId });

      res.status(200).json({
        success: true,
        data: cart,
        message: 'Item removed from cart successfully'
      });
    } catch (error) {
      Logger.error('Failed to remove item from cart', error as Error);
      next(error);
    }
  }

  /**
   * Clear cart
   * DELETE /api/v1/cart
   */
  static async clearCart(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Get current cart
      let cart: Cart = req.session?.cart || {
        items: [],
        subtotal: 0,
        tax: 0,
        shipping: 0,
        discount: 0,
        totalAmount: 0,
        itemCount: 0
      };

      // Clear cart
      cart = CartService.clearCart(cart);

      // Store cart in session
      if (req.session) {
        req.session.cart = cart;
      }

      Logger.info('Cart cleared successfully');

      res.status(200).json({
        success: true,
        data: cart,
        message: 'Cart cleared successfully'
      });
    } catch (error) {
      Logger.error('Failed to clear cart', error as Error);
      next(error);
    }
  }

  /**
   * Apply discount to cart
   * POST /api/v1/cart/discount
   */
  static async applyDiscount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { discountAmount } = req.body;

      if (!discountAmount || discountAmount <= 0) {
        res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Valid discount amount is required'
        });
        return;
      }

      // Get current cart
      let cart: Cart = req.session?.cart || {
        items: [],
        subtotal: 0,
        tax: 0,
        shipping: 0,
        discount: 0,
        totalAmount: 0,
        itemCount: 0
      };

      // Apply discount
      cart = CartService.applyDiscount(cart, discountAmount);

      // Store cart in session
      if (req.session) {
        req.session.cart = cart;
      }

      Logger.info('Discount applied successfully', { discountAmount });

      res.status(200).json({
        success: true,
        data: cart,
        message: 'Discount applied successfully'
      });
    } catch (error) {
      Logger.error('Failed to apply discount', error as Error);
      next(error);
    }
  }

  /**
   * Remove discount from cart
   * DELETE /api/v1/cart/discount
   */
  static async removeDiscount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Get current cart
      let cart: Cart = req.session?.cart || {
        items: [],
        subtotal: 0,
        tax: 0,
        shipping: 0,
        discount: 0,
        totalAmount: 0,
        itemCount: 0
      };

      // Remove discount
      cart = CartService.removeDiscount(cart);

      // Store cart in session
      if (req.session) {
        req.session.cart = cart;
      }

      Logger.info('Discount removed successfully');

      res.status(200).json({
        success: true,
        data: cart,
        message: 'Discount removed successfully'
      });
    } catch (error) {
      Logger.error('Failed to remove discount', error as Error);
      next(error);
    }
  }
}

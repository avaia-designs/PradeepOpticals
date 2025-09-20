import { Request, Response, NextFunction } from 'express';
import { CartService, CartResponse } from '../services/cart.service';
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
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'User not authenticated'
        });
        return;
      }
      const userId = req.user.id;
      const cart = await CartService.getCart(userId);

      // Validate cart against current product data
      const validation = await CartService.validateCart(cart);
      if (!validation.valid) {
        Logger.warn('Cart validation failed', { userId, errors: validation.errors });
        // Note: In a production app, you might want to clean up invalid items
        // For now, we'll just log the warnings
      }

      Logger.info('Cart retrieved successfully', { userId, itemCount: cart.itemCount });

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
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'User not authenticated'
        });
        return;
      }
      const userId = req.user.id;
      const { productId, quantity, specifications } = req.body;

      if (!productId || !quantity || quantity <= 0) {
        res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Product ID and valid quantity are required'
        });
        return;
      }

      // Add item to cart in database
      const cart = await CartService.addItem(userId, productId, quantity, specifications);

      Logger.info('Item added to cart successfully', { userId, productId, quantity });

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
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'User not authenticated'
        });
        return;
      }
      const userId = req.user.id;
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

      // Update item quantity in database
      const cart = await CartService.updateItemQuantity(userId, productId, quantity);

      Logger.info('Item quantity updated successfully', { userId, productId, quantity });

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
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'User not authenticated'
        });
        return;
      }
      const userId = req.user.id;
      const { productId } = req.params;

      // Remove item from cart in database
      const cart = await CartService.removeItem(userId, productId);

      Logger.info('Item removed from cart successfully', { userId, productId });

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
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'User not authenticated'
        });
        return;
      }
      const userId = req.user.id;

      // Clear cart in database
      const cart = await CartService.clearCart(userId);

      Logger.info('Cart cleared successfully', { userId });

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
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'User not authenticated'
        });
        return;
      }
      const userId = req.user.id;
      const { discountAmount } = req.body;

      if (!discountAmount || discountAmount <= 0) {
        res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Valid discount amount is required'
        });
        return;
      }

      // Apply discount in database
      const cart = await CartService.applyDiscount(userId, discountAmount);

      Logger.info('Discount applied successfully', { userId, discountAmount });

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
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'User not authenticated'
        });
        return;
      }
      const userId = req.user.id;

      // Remove discount in database
      const cart = await CartService.removeDiscount(userId);

      Logger.info('Discount removed successfully', { userId });

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

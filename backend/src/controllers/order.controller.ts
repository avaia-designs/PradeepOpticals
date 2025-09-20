import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { CartService } from '../services/cart.service';
import { AuthenticatedRequest } from '../types';
import { Logger } from '../utils/logger';

/**
 * Order controller
 * Handles order-related operations
 */
export class OrderController {
  /**
   * Create order from cart
   * POST /api/v1/orders/checkout
   */
  static async checkout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user.id;
      const { shippingAddress, paymentMethod, notes, prescriptionFile } = req.body;

      // Get cart from database
      const cart = await CartService.getCart(userId);
      if (!cart || cart.items.length === 0) {
        res.status(400).json({
          success: false,
          error: 'EMPTY_CART',
          message: 'Cart is empty'
        });
        return;
      }

      // Create order from cart
      const order = await OrderService.createOrderFromCart(
        userId,
        cart,
        shippingAddress,
        paymentMethod,
        notes,
        prescriptionFile
      );

      // Clear cart after successful order
      await CartService.clearCart(userId);

      Logger.info('Order created successfully', { orderId: order._id, userId });

      res.status(201).json({
        success: true,
        data: order,
        message: 'Order created successfully'
      });
    } catch (error) {
      Logger.error('Failed to create order', error as Error);
      next(error);
    }
  }

  /**
   * Create walk-in order (Staff only)
   * POST /api/v1/orders/walk-in
   */
  static async createWalkInOrder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const staffId = req.user.id;
      const orderData = {
        ...req.body,
        staffId
      };

      const order = await OrderService.createWalkInOrder(orderData);

      Logger.info('Walk-in order created successfully', { orderId: order._id, staffId });

      res.status(201).json({
        success: true,
        data: order,
        message: 'Walk-in order created successfully'
      });
    } catch (error) {
      Logger.error('Failed to create walk-in order', error as Error);
      next(error);
    }
  }

  /**
   * Get user orders
   * GET /api/v1/orders
   */
  static async getUserOrders(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await OrderService.getOrdersByUser(userId, page, limit);

      Logger.info('User orders fetched successfully', { userId, count: result.data.length });

      res.status(200).json({
        success: true,
        data: result.data,
        meta: {
          pagination: result.pagination
        },
        message: 'Orders retrieved successfully'
      });
    } catch (error) {
      Logger.error('Failed to fetch user orders', error as Error);
      next(error);
    }
  }

  /**
   * Get order by ID
   * GET /api/v1/orders/:id
   */
  static async getOrderById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const order = await OrderService.getOrderById(id);

      // Check if user can access this order
      if (order.userId !== userId && !['staff', 'admin'].includes(req.user.role)) {
        res.status(403).json({
          success: false,
          error: 'FORBIDDEN',
          message: 'Access denied'
        });
        return;
      }

      Logger.info('Order fetched successfully', { orderId: id });

      res.status(200).json({
        success: true,
        data: order,
        message: 'Order retrieved successfully'
      });
    } catch (error) {
      Logger.error('Failed to fetch order', error as Error);
      next(error);
    }
  }

  /**
   * Get all orders (Staff/Admin only)
   * GET /api/v1/orders/all
   */
  static async getAllOrders(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const filters = {
        status: req.query.status as any,
        isWalkIn: req.query.isWalkIn ? req.query.isWalkIn === 'true' : undefined,
        staffId: req.query.staffId as string
      };

      const result = await OrderService.getAllOrders(page, limit, filters);

      Logger.info('All orders fetched successfully', { count: result.data.length });

      res.status(200).json({
        success: true,
        data: result.data,
        meta: {
          pagination: result.pagination
        },
        message: 'Orders retrieved successfully'
      });
    } catch (error) {
      Logger.error('Failed to fetch all orders', error as Error);
      next(error);
    }
  }

  /**
   * Update order (Staff/Admin only)
   * PUT /api/v1/orders/:id
   */
  static async updateOrder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const order = await OrderService.updateOrder(id, updateData);

      Logger.info('Order updated successfully', { orderId: id });

      res.status(200).json({
        success: true,
        data: order,
        message: 'Order updated successfully'
      });
    } catch (error) {
      Logger.error('Failed to update order', error as Error);
      next(error);
    }
  }

  /**
   * Cancel order
   * PUT /api/v1/orders/:id/cancel
   */
  static async cancelOrder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const userId = req.user.id;

      const order = await OrderService.getOrderById(id);

      // Check if user can cancel this order
      if (order.userId !== userId && !['staff', 'admin'].includes(req.user.role)) {
        res.status(403).json({
          success: false,
          error: 'FORBIDDEN',
          message: 'Access denied'
        });
        return;
      }

      const cancelledOrder = await OrderService.cancelOrder(id, reason);

      Logger.info('Order cancelled successfully', { orderId: id });

      res.status(200).json({
        success: true,
        data: cancelledOrder,
        message: 'Order cancelled successfully'
      });
    } catch (error) {
      Logger.error('Failed to cancel order', error as Error);
      next(error);
    }
  }

  /**
   * Get order statistics (Admin only)
   * GET /api/v1/orders/statistics
   */
  static async getOrderStatistics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const statistics = await OrderService.getOrderStatistics();

      Logger.info('Order statistics fetched successfully');

      res.status(200).json({
        success: true,
        data: statistics,
        message: 'Order statistics retrieved successfully'
      });
    } catch (error) {
      Logger.error('Failed to fetch order statistics', error as Error);
      next(error);
    }
  }
}

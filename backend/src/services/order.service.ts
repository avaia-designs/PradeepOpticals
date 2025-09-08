import { Order, OrderItem, IOrder } from '../models';
import { Cart, PaginatedResult, OrderStatus } from '../types';
import { Logger } from '../utils/logger';

export interface CreateOrderData {
  userId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  totalAmount: number;
  shippingAddress: {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
  };
  paymentMethod: string;
  notes?: string;
  prescriptionFile?: string;
  isWalkIn?: boolean;
  staffId?: string;
}

export interface OrderFilters {
  status?: OrderStatus;
  isWalkIn?: boolean;
  staffId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export class OrderService {
  /**
   * Create order from cart
   */
  static async createOrderFromCart(
    userId: string,
    cart: Cart,
    shippingAddress: {
      firstName: string;
      lastName: string;
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
      phone?: string;
    },
    paymentMethod: string,
    notes?: string,
    prescriptionFile?: string
  ): Promise<IOrder> {
    try {
      Logger.info('Creating order from cart', { userId, itemCount: cart.itemCount });

      // Generate order number
      const orderNumber = this.generateOrderNumber();

      // Convert cart items to order items
      const orderItems: OrderItem[] = cart.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        specifications: item.specifications
      }));

      // Create order data
      const orderData: CreateOrderData = {
        userId,
        items: orderItems,
        subtotal: cart.subtotal,
        tax: cart.tax,
        shipping: cart.shipping,
        discount: cart.discount,
        totalAmount: cart.totalAmount,
        shippingAddress,
        paymentMethod,
        notes,
        prescriptionFile,
        isWalkIn: false
      };

      // Create order
      const order = new Order(orderData);
      await order.save();

      Logger.info('Order created successfully', { orderId: order._id, orderNumber });
      return order;
    } catch (error) {
      Logger.error('Failed to create order from cart', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Create walk-in order (Staff only)
   */
  static async createWalkInOrder(orderData: CreateOrderData): Promise<IOrder> {
    try {
      Logger.info('Creating walk-in order', { staffId: orderData.staffId });

      // Generate order number
      const orderNumber = this.generateOrderNumber();

      const order = new Order({
        ...orderData,
        orderNumber,
        isWalkIn: true,
        status: 'confirmed' // Walk-in orders are immediately confirmed
      });

      await order.save();

      Logger.info('Walk-in order created successfully', { orderId: order._id, orderNumber });
      return order;
    } catch (error) {
      Logger.error('Failed to create walk-in order', error as Error);
      throw error;
    }
  }

  /**
   * Get orders by user
   */
  static async getOrdersByUser(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<IOrder>> {
    try {
      Logger.info('Fetching orders by user', { userId, page, limit });

      const skip = (page - 1) * limit;

      const [orders, total] = await Promise.all([
        Order.find({ userId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        Order.countDocuments({ userId }).exec()
      ]);

      const result: PaginatedResult<any> = {
        data: orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

      Logger.info('User orders fetched successfully', { userId, count: orders.length });
      return result;
    } catch (error) {
      Logger.error('Failed to fetch user orders', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Get all orders (Staff/Admin only)
   */
  static async getAllOrders(
    page: number = 1,
    limit: number = 20,
    filters: OrderFilters = {}
  ): Promise<PaginatedResult<any>> {
    try {
      Logger.info('Fetching all orders', { page, limit, filters });

      const skip = (page - 1) * limit;
      const query: any = {};

      // Apply filters
      if (filters.status) {
        query.status = filters.status;
      }
      if (filters.isWalkIn !== undefined) {
        query.isWalkIn = filters.isWalkIn;
      }
      if (filters.staffId) {
        query.staffId = filters.staffId;
      }
      if (filters.dateFrom || filters.dateTo) {
        query.createdAt = {};
        if (filters.dateFrom) {
          query.createdAt.$gte = filters.dateFrom;
        }
        if (filters.dateTo) {
          query.createdAt.$lte = filters.dateTo;
        }
      }

      const [orders, total] = await Promise.all([
        Order.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        Order.countDocuments(query).exec()
      ]);

      const result: PaginatedResult<any> = {
        data: orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

      Logger.info('All orders fetched successfully', { count: orders.length });
      return result;
    } catch (error) {
      Logger.error('Failed to fetch all orders', error as Error);
      throw error;
    }
  }

  /**
   * Get order by ID
   */
  static async getOrderById(id: string): Promise<any> {
    try {
      Logger.info('Fetching order by ID', { orderId: id });

      const order = await Order.findById(id).lean().exec();

      if (!order) {
        throw new Error('Order not found');
      }

      Logger.info('Order fetched successfully', { orderId: id });
      return order;
    } catch (error) {
      Logger.error('Failed to fetch order', error as Error, { orderId: id });
      throw error;
    }
  }

  /**
   * Update order
   */
  static async updateOrder(id: string, updateData: any): Promise<any> {
    try {
      Logger.info('Updating order', { orderId: id });

      const order = await Order.findById(id);
      if (!order) {
        throw new Error('Order not found');
      }

      Object.assign(order, updateData);
      await order.save();

      Logger.info('Order updated successfully', { orderId: id });
      return order;
    } catch (error) {
      Logger.error('Failed to update order', error as Error, { orderId: id });
      throw error;
    }
  }

  /**
   * Cancel order
   */
  static async cancelOrder(id: string, reason?: string): Promise<any> {
    try {
      Logger.info('Cancelling order', { orderId: id, reason });

      const order = await Order.findById(id);
      if (!order) {
        throw new Error('Order not found');
      }

      // Check if order can be cancelled
      if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
        throw new Error('Order cannot be cancelled');
      }

      order.status = 'cancelled';
      order.cancelledAt = new Date();
      if (reason) {
        order.cancelledReason = reason;
      }

      await order.save();

      Logger.info('Order cancelled successfully', { orderId: id });
      return order;
    } catch (error) {
      Logger.error('Failed to cancel order', error as Error, { orderId: id });
      throw error;
    }
  }

  /**
   * Get order statistics (Admin only)
   */
  static async getOrderStatistics(): Promise<any> {
    try {
      Logger.info('Fetching order statistics');

      const [
        totalOrders,
        pendingOrders,
        confirmedOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue,
        walkInOrders,
        onlineOrders
      ] = await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ status: 'pending' }),
        Order.countDocuments({ status: 'confirmed' }),
        Order.countDocuments({ status: 'shipped' }),
        Order.countDocuments({ status: 'delivered' }),
        Order.countDocuments({ status: 'cancelled' }),
        Order.aggregate([
          { $match: { status: { $in: ['delivered'] } } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        Order.countDocuments({ isWalkIn: true }),
        Order.countDocuments({ isWalkIn: false })
      ]);

      const statistics = {
        totalOrders,
        statusBreakdown: {
          pending: pendingOrders,
          confirmed: confirmedOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders
        },
        totalRevenue: totalRevenue[0]?.total || 0,
        orderTypes: {
          walkIn: walkInOrders,
          online: onlineOrders
        }
      };

      Logger.info('Order statistics fetched successfully');
      return statistics;
    } catch (error) {
      Logger.error('Failed to fetch order statistics', error as Error);
      throw error;
    }
  }

  /**
   * Generate unique order number
   */
  private static generateOrderNumber(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `PO-${timestamp}-${random}`.toUpperCase();
  }
}
'use client';

import React, { useState, useEffect } from 'react';
import { Package, Eye, Calendar, CreditCard, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderService } from '@/lib/services/order.service';
import { Order } from '@/types';
import { toast } from 'sonner';
import Link from 'next/link';

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  processing: { label: 'Processing', color: 'bg-purple-100 text-purple-800', icon: Package },
  shipped: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-800', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
  refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-800', icon: XCircle }
};

const paymentStatusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-800' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-800' },
  refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-800' }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadOrders = async (page: number = 1) => {
    try {
      setLoading(true);
      const result = await OrderService.getUserOrders(page, 10);
      setOrders(result.data);
      setTotalPages(result.pagination.pages);
    } catch (error: any) {
      setError(error.message || 'Failed to load orders');
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(currentPage);
  }, [currentPage]);

  const handleCancelOrder = async (orderId: string) => {
    try {
      await OrderService.cancelOrder(orderId, 'Cancelled by user');
      toast.success('Order cancelled successfully');
      loadOrders(currentPage);
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel order');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const canCancelOrder = (status: string) => {
    return ['pending', 'confirmed'].includes(status);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Orders</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => loadOrders(currentPage)}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Package className="h-24 w-24 text-gray-400 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Orders Yet</h1>
          <p className="text-gray-600 mb-6">
            You haven't placed any orders yet. Start shopping to see your orders here.
          </p>
          <Button asChild>
            <Link href="/products">
              Start Shopping
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <Button asChild>
          <Link href="/products">
            Continue Shopping
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        {orders.map((order) => {
          const StatusIcon = statusConfig[order.status].icon;
          const PaymentStatus = paymentStatusConfig[order.paymentStatus];

          return (
            <Card key={order._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Order #{order.orderNumber}</CardTitle>
                    <p className="text-sm text-gray-600">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={statusConfig[order.status].color}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {statusConfig[order.status].label}
                    </Badge>
                    <Badge variant="outline" className={PaymentStatus.color}>
                      {PaymentStatus.label}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.productName}
                          </p>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          ${item.totalPrice.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        <p>Total: <span className="font-medium text-gray-900">${order.totalAmount.toFixed(2)}</span></p>
                        <p>Payment: {order.paymentMethod}</p>
                        {order.isWalkIn && (
                          <p className="text-blue-600">Walk-in Order</p>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/orders/${order._id}`}>
                            <Eye className="mr-1 h-3 w-3" />
                            View Details
                          </Link>
                        </Button>
                        
                        {canCancelOrder(order.status) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelOrder(order._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Cancel Order
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="border-t pt-4">
                    <div className="text-sm text-gray-600">
                      <p className="font-medium text-gray-900">Shipping Address:</p>
                      <p>
                        {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                      </p>
                      <p>{order.shippingAddress.street}</p>
                      <p>
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                      </p>
                      <p>{order.shippingAddress.country}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
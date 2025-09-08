'use client';

import React, { useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCartStore } from '@/stores/cart-store';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';

export default function CartPage() {
  const { 
    cart, 
    isLoading, 
    error, 
    updateItemQuantity, 
    removeItem, 
    clearCart, 
    loadCart 
  } = useCartStore();

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    try {
      if (newQuantity === 0) {
        await removeItem(productId);
      } else {
        await updateItemQuantity(productId, newQuantity);
      }
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeItem(productId);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      toast.success('Cart cleared');
    } catch (error) {
      toast.error('Failed to clear cart');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex space-x-4">
                      <Skeleton className="h-24 w-24 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-8 w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="space-y-4">
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Cart</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={loadCart}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <ShoppingCart className="h-24 w-24 text-gray-400 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-6">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Button asChild>
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <Button
          variant="outline"
          onClick={handleClearCart}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <Card key={item.productId}>
              <CardContent className="p-6">
                <div className="flex space-x-4">
                  <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={item.productImage}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-2">{item.productName}</h3>
                    <div className="text-sm text-gray-600 mb-2">
                      ${item.unitPrice.toFixed(2)} each
                    </div>
                    
                    {item.specifications && (
                      <div className="text-sm text-gray-500 mb-2">
                        {item.specifications.material && (
                          <span>Material: {item.specifications.material}</span>
                        )}
                        {item.specifications.color && (
                          <span className="ml-2">Color: {item.specifications.color}</span>
                        )}
                        {item.specifications.size && (
                          <span className="ml-2">Size: {item.specifications.size}</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <div className="text-lg font-bold text-gray-900">
                      ${item.totalPrice.toFixed(2)}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.productId)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal ({cart.itemCount} items)</span>
                <span>${cart.subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>{cart.shipping === 0 ? 'Free' : `$${cart.shipping.toFixed(2)}`}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>${cart.tax.toFixed(2)}</span>
              </div>
              
              {cart.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-${cart.discount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${cart.totalAmount.toFixed(2)}</span>
                </div>
              </div>
              
              <Button className="w-full" size="lg" asChild>
                <Link href="/checkout">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Proceed to Checkout
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full" asChild>
                <Link href="/products">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Continue Shopping
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Promo Code */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Promo Code</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <Button size="sm">Apply</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
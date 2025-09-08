'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/types';
import { useCartStore } from '@/stores/cart-store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addItem } = useCartStore();

  const handleAddToCart = async () => {
    try {
      setIsLoading(true);
      await addItem(product._id, 1);
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const discountPercentage = product.originalPrice && product.price < product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Card className={cn('group relative overflow-hidden transition-all duration-300 hover:shadow-lg', className)}>
      <div className="relative overflow-hidden">
        <Link href={`/products/${product._id}`}>
          <div className="relative aspect-square">
            <Image
              src={product.images[0] || '/placeholder-image.jpg'}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {discountPercentage > 0 && (
              <Badge
                variant="destructive"
                className="absolute top-2 left-2"
              >
                -{discountPercentage}%
              </Badge>
            )}
            {product.featured && (
              <Badge
                variant="secondary"
                className="absolute top-2 right-2"
              >
                Featured
              </Badge>
            )}
          </div>
        </Link>

        {/* Quick Actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="secondary"
              className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
              onClick={handleWishlist}
            >
              <Heart className={cn('h-4 w-4', isWishlisted && 'fill-red-500 text-red-500')} />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
              asChild
            >
              <Link href={`/products/${product._id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <Link href={`/products/${product._id}`}>
              <h3 className="font-medium text-gray-900 line-clamp-2 hover:text-primary transition-colors">
                {product.name}
              </h3>
            </Link>
          </div>

          <div className="flex items-center space-x-1">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-4 w-4',
                    i < Math.floor(product.rating || 0)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              ({product.reviewCount})
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-gray-500 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            <div className="text-sm text-gray-600">
              {product.inventory > 0 ? (
                <span className="text-green-600">In Stock</span>
              ) : (
                <span className="text-red-600">Out of Stock</span>
              )}
            </div>
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={isLoading || product.inventory === 0}
            className="w-full"
            size="sm"
          >
            {isLoading ? (
              'Adding...'
            ) : (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Eye, Star, RefreshCw } from 'lucide-react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useCartStore } from '@/stores/cart-store';
import { useUserStore } from '@/stores/user-store';
import { formatCurrency, calculateDiscountPercentage } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  
  const { addItem } = useCartStore();
  const { addToWishlist, isInWishlist } = useUserStore();

  const discountPercentage = product.originalPrice 
    ? calculateDiscountPercentage(product.originalPrice, product.price)
    : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAddingToCart) return;
    
    setIsAddingToCart(true);
    try {
      await addItem(product.id, 1);
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAddingToWishlist) return;
    
    setIsAddingToWishlist(true);
    try {
      await addToWishlist(product.id);
      toast.success('Added to wishlist!');
    } catch (error) {
      toast.error('Failed to add to wishlist');
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const isInWishlistValue = isInWishlist(product.id);

  return (
    <Card 
      className={cn(
        'group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className={cn(
              'object-cover transition-transform duration-500 ease-out',
              isHovered ? 'scale-105' : 'scale-100'
            )}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-2">
            {product.isFeatured && (
              <Badge variant="secondary" className="w-fit">
                Featured
              </Badge>
            )}
            {discountPercentage > 0 && (
              <Badge variant="destructive" className="w-fit">
                -{discountPercentage}%
              </Badge>
            )}
            {!product.inventory && (
              <Badge variant="outline" className="w-fit bg-background/80">
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Quick Actions */}
          <div className={cn(
            'absolute top-2 right-2 flex flex-col gap-2 transition-all duration-300',
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          )}>
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={handleAddToWishlist}
              disabled={isAddingToWishlist}
            >
              <Heart 
                className={cn(
                  'h-4 w-4',
                  isInWishlistValue ? 'fill-red-500 text-red-500' : ''
                )}
              />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          {/* Overlay on hover */}
          {isHovered && (
            <div className="absolute inset-0 bg-black/10 transition-opacity duration-300" />
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Brand */}
          <div className="text-sm text-muted-foreground font-medium">
            {product.brand}
          </div>

          {/* Product Name */}
          <Link href={`/products/${product.id}`}>
            <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-3 w-3',
                    i < Math.floor(product.rating) 
                      ? 'fill-yellow-400 text-yellow-400' 
                      : 'text-gray-300'
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({product.reviewCount})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <Button
            className="w-full"
            onClick={handleAddToCart}
            disabled={!product.inventory || isAddingToCart}
          >
            {isAddingToCart ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : !product.inventory ? (
              'Out of Stock'
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Star, Heart, ShoppingCart, Eye, Calendar, Truck, Shield, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useProduct } from '@/hooks/use-products';
import { useCartStore } from '@/stores/cart-store';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { data: product, isLoading, error } = useProduct(productId);
  const { addItem } = useCartStore();

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      await addItem(product._id, 1);
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Skeleton className="h-96 w-full rounded-lg" />
            <div className="flex space-x-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-20 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const discountPercentage = product.originalPrice && product.price < product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <Link href="/products" className="hover:text-primary">
          Products
        </Link>
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={product.images[selectedImage] || '/placeholder-image.jpg'}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            {discountPercentage > 0 && (
              <Badge
                variant="destructive"
                className="absolute top-4 left-4"
              >
                -{discountPercentage}%
              </Badge>
            )}
            {product.featured && (
              <Badge
                variant="secondary"
                className="absolute top-4 right-4"
              >
                Featured
              </Badge>
            )}
          </div>
          
          {/* Thumbnail Images */}
          {product.images.length > 1 && (
            <div className="flex space-x-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-primary' : 'border-gray-200'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating || 0)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  ({product.reviewCount} reviews)
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xl text-gray-500 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {product.inventory > 0 ? (
                  <span className="text-green-600 font-medium">In Stock ({product.inventory} available)</span>
                ) : (
                  <span className="text-red-600 font-medium">Out of Stock</span>
                )}
              </div>
              <div className="text-sm text-gray-600">
                SKU: {product.sku}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex space-x-4">
              <Button
                onClick={handleAddToCart}
                disabled={product.inventory === 0}
                className="flex-1"
                size="lg"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleWishlist}
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" size="lg">
                <Calendar className="mr-2 h-4 w-4" />
                Book Appointment
              </Button>
              <Button variant="outline" size="lg">
                <Eye className="mr-2 h-4 w-4" />
                Try On
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Truck className="h-4 w-4" />
              <span>Free Shipping</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <RotateCcw className="h-4 w-4" />
              <span>30-Day Returns</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Shield className="h-4 w-4" />
              <span>2-Year Warranty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-12">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="specifications" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.specifications.material && (
                    <div>
                      <span className="font-medium text-gray-900">Material:</span>
                      <span className="ml-2 text-gray-700">{product.specifications.material}</span>
                    </div>
                  )}
                  {product.specifications.color && (
                    <div>
                      <span className="font-medium text-gray-900">Color:</span>
                      <span className="ml-2 text-gray-700">{product.specifications.color}</span>
                    </div>
                  )}
                  {product.specifications.size && (
                    <div>
                      <span className="font-medium text-gray-900">Size:</span>
                      <span className="ml-2 text-gray-700">{product.specifications.size}</span>
                    </div>
                  )}
                  {product.specifications.weight && (
                    <div>
                      <span className="font-medium text-gray-900">Weight:</span>
                      <span className="ml-2 text-gray-700">{product.specifications.weight}g</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

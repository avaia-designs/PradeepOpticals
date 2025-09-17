'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  DollarSign,
  Tag,
  Settings,
  Image as ImageIcon,
  AlertTriangle,
  TrendingUp,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { RoleGuard } from '@/components/auth/role-guard';
import { Permission } from '@/lib/permissions';
import { ProductService } from '@/lib/services/product.service';
import { Product } from '@/types';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoading(true);
        const productData = await ProductService.getProductById(productId);
        setProduct(productData);
      } catch (error) {
        console.error('Error loading product:', error);
        toast.error('Failed to load product');
        router.push('/admin/products');
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      loadProduct();
    }
  }, [productId, router]);

  const handleDelete = async () => {
    if (!product) return;

    try {
      setIsDeleting(true);
      await ProductService.deleteProduct(product._id);
      toast.success('Product deleted successfully');
      router.push('/admin/products');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleRefresh = async () => {
    if (!productId) return;

    try {
      setIsLoading(true);
      const productData = await ProductService.getProductById(productId);
      setProduct(productData);
    } catch (error) {
      console.error('Error refreshing product:', error);
      toast.error('Failed to refresh product');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getStatusBadge = (product: Product) => {
    if (!product.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    if (product.inventory === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    }
    if (product.inventory < 10) {
      return <Badge variant="outline" className="text-orange-600 border-orange-600">Low Stock</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  const getStockIcon = (product: Product) => {
    if (product.inventory === 0) {
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
    if (product.inventory < 10) {
      return <AlertTriangle className="h-5 w-5 text-orange-500" />;
    }
    return <Package className="h-5 w-5 text-green-500" />;
  };

  if (isLoading) {
    return (
      <RoleGuard permission={Permission.MANAGE_INVENTORY}>
        <AdminLayout>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-64" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
              <div className="space-y-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          </div>
        </AdminLayout>
      </RoleGuard>
    );
  }

  if (!product) {
    return (
      <RoleGuard permission={Permission.MANAGE_INVENTORY}>
        <AdminLayout>
          <div className="text-center py-8">
            <p className="text-gray-500">Product not found</p>
          </div>
        </AdminLayout>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard permission={Permission.MANAGE_INVENTORY}>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/products">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Products
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                <p className="text-gray-600">SKU: {product.sku}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/admin/products/${product._id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Product Images */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Product Images
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {product.images && product.images.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {product.images.map((image, index) => (
                        <div key={index} className="aspect-square rounded-lg overflow-hidden">
                          <img
                            src={image}
                            alt={`${product.name} ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform cursor-zoom-in"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32 bg-gray-100 rounded-lg">
                      <div className="text-center">
                        <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No images available</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Product Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
                </CardContent>
              </Card>

              {/* Specifications */}
              {product.specifications && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Specifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {product.specifications.material && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Material</Label>
                          <p className="text-gray-900">{product.specifications.material}</p>
                        </div>
                      )}
                      {product.specifications.color && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Color</Label>
                          <p className="text-gray-900">{product.specifications.color}</p>
                        </div>
                      )}
                      {product.specifications.size && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Size</Label>
                          <p className="text-gray-900">{product.specifications.size}</p>
                        </div>
                      )}
                      {product.specifications.weight && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Weight</Label>
                          <p className="text-gray-900">{product.specifications.weight}g</p>
                        </div>
                      )}
                      {product.specifications.dimensions && (
                        <div className="md:col-span-2">
                          <Label className="text-sm font-medium text-gray-600">Dimensions</Label>
                          <p className="text-gray-900">
                            {product.specifications.dimensions.width}mm × {product.specifications.dimensions.height}mm × {product.specifications.dimensions.depth}mm
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Tag className="h-5 w-5" />
                      Tags
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status & Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Pricing & Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Current Price</Label>
                    <p className="text-2xl font-bold text-gray-900">{formatPrice(product.price)}</p>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <p className="text-sm text-gray-500 line-through">
                        {formatPrice(product.originalPrice)}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Status</Label>
                    <div className="mt-1">{getStatusBadge(product)}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Featured</Label>
                    <div className="mt-1">
                      {product.featured ? (
                        <Badge variant="default">Featured</Badge>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Inventory */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Inventory
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    {getStockIcon(product)}
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{product.inventory}</p>
                      <p className="text-sm text-gray-600">units in stock</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category & Brand */}
              <Card>
                <CardHeader>
                  <CardTitle>Classification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Category</Label>
                    <p className="text-gray-900">{product.category.name}</p>
                  </div>
                  {product.subcategory && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Subcategory</Label>
                      <p className="text-gray-900">{product.subcategory.name}</p>
                    </div>
                  )}
                  {product.brand && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Brand</Label>
                      <p className="text-gray-900">{product.brand.name}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Product Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Product Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">SKU</Label>
                    <p className="text-gray-900 font-mono">{product.sku}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Created</Label>
                    <p className="text-gray-900">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
                    <p className="text-gray-900">
                      {new Date(product.modifiedAt).toLocaleDateString()}
                    </p>
                  </div>
                  {product.rating && product.rating > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Rating</Label>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <TrendingUp
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(product.rating || 0)
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {product.rating.toFixed(1)} ({product.reviewCount} reviews)
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Delete Confirmation Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Product</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{product.name}"? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDeleteDialogOpen(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </AdminLayout>
    </RoleGuard>
  );
}

// Helper component for labels
function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={`text-sm font-medium text-gray-600 ${className}`} {...props}>
      {children}
    </label>
  );
}

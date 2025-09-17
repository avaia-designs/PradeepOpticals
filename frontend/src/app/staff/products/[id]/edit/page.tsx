'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductForm } from '@/components/products/product-form';
import { ProductService } from '@/lib/services/product.service';
import { Product } from '@/types';
import { toast } from 'sonner';
import { RoleGuard } from '@/components/auth/role-guard';
import { Permission } from '@/lib/permissions';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Package } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function EditStaffProductPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
        router.push('/staff/products');
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      loadProduct();
    }
  }, [productId, router]);

  const handleSave = async (data: any) => {
    try {
      setIsSaving(true);
      await ProductService.updateProduct(productId, data);
      toast.success('Product updated successfully');
      router.push('/staff/products');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/staff/products');
  };

  if (isLoading) {
    return (
      <RoleGuard permission={Permission.MANAGE_INVENTORY}>
        <div className="min-h-screen bg-gray-50">
          <div className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-8 w-64" />
                </div>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="space-y-4">
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </RoleGuard>
    );
  }

  if (!product) {
    return (
      <RoleGuard permission={Permission.MANAGE_INVENTORY}>
        <div className="min-h-screen bg-gray-50">
          <div className="text-center py-8">
            <p className="text-gray-500">Product not found</p>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard permission={Permission.MANAGE_INVENTORY}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/staff/products">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Products
                  </Link>
                </Button>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Edit Product</h1>
                  <p className="text-sm text-gray-600">Update product information and settings</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <ProductForm
            product={product}
            onSave={handleSave}
            onCancel={handleCancel}
            isLoading={isSaving}
          />
        </div>
      </div>
    </RoleGuard>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AdminLayout } from '@/components/layout/admin-layout';
import { ProductForm } from '@/components/products/product-form';
import { ProductService } from '@/lib/services/product.service';
import { Product } from '@/types';
import { toast } from 'sonner';
import { RoleGuard } from '@/components/auth/role-guard';
import { Permission } from '@/lib/permissions';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditProductPage() {
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
        router.push('/admin/products');
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
      router.push('/admin/products');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/products');
  };

  if (isLoading) {
    return (
      <RoleGuard permission={Permission.MANAGE_INVENTORY}>
        <AdminLayout>
          <div className="space-y-6">
            <div>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96 mt-2" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-96 w-full" />
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-gray-600">Update product information and settings.</p>
          </div>

          <ProductForm
            product={product}
            onSave={handleSave}
            onCancel={handleCancel}
            isLoading={isSaving}
          />
        </div>
      </AdminLayout>
    </RoleGuard>
  );
}

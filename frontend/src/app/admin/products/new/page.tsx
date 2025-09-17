'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/layout/admin-layout';
import { ProductForm } from '@/components/products/product-form';
import { ProductService } from '@/lib/services/product.service';
import { toast } from 'sonner';
import { RoleGuard } from '@/components/auth/role-guard';
import { Permission } from '@/lib/permissions';

export default function NewProductPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSave = async (data: any) => {
    try {
      setIsLoading(true);
      await ProductService.createProduct(data);
      toast.success('Product created successfully');
      router.push('/admin/products');
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/products');
  };

  return (
    <RoleGuard permission={Permission.MANAGE_INVENTORY}>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Product</h1>
            <p className="text-gray-600">Add a new product to your inventory.</p>
          </div>

          <ProductForm
            onSave={handleSave}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </div>
      </AdminLayout>
    </RoleGuard>
  );
}

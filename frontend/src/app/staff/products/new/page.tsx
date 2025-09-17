'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductForm } from '@/components/products/product-form';
import { ProductService } from '@/lib/services/product.service';
import { toast } from 'sonner';
import { RoleGuard } from '@/components/auth/role-guard';
import { Permission } from '@/lib/permissions';
import { ArrowLeft, Package } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NewStaffProductPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSave = async (data: any) => {
    try {
      setIsLoading(true);
      await ProductService.createProduct(data);
      toast.success('Product created successfully');
      router.push('/staff/products');
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/staff/products');
  };

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
                  <h1 className="text-xl font-semibold text-gray-900">Create New Product</h1>
                  <p className="text-sm text-gray-600">Add a new product to your inventory</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <ProductForm
            onSave={handleSave}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </div>
      </div>
    </RoleGuard>
  );
}

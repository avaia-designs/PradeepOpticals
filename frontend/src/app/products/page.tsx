import React from 'react';
import { Metadata } from 'next';
import { ProductGrid } from '@/components/products/product-grid';
import { ProductFilters } from '@/components/products/product-filters';
import { ProductSort } from '@/components/products/product-sort';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export const metadata: Metadata = {
  title: 'All Products - Pradeep Opticals',
  description: 'Browse our complete collection of premium eyewear including prescription glasses, sunglasses, reading glasses, and more.',
  keywords: ['eyewear', 'glasses', 'frames', 'prescription', 'sunglasses', 'reading glasses'],
};

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Products</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">All Products</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Discover our complete collection of premium eyewear. From prescription glasses to stylish sunglasses, 
            find the perfect pair that matches your style and needs.
          </p>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="lg:w-1/4">
            <ProductFilters />
          </div>
          <div className="lg:w-3/4">
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-muted-foreground">
                Showing 1-12 of 500+ products
              </div>
              <ProductSort />
            </div>
            <ProductGrid />
          </div>
        </div>
      </div>
    </div>
  );
}

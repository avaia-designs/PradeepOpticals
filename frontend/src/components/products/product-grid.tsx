'use client';

import React from 'react';
import { useProducts } from '@/hooks/use-products';
import { ProductCard } from '@/components/products/product-card';
import { ProductSkeleton } from '@/components/products/product-skeleton';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ProductGridProps {
  className?: string;
}

export function ProductGrid({ className }: ProductGridProps) {
  const { data, isLoading, error, refetch, isFetching } = useProducts({
    page: 1,
    limit: 12,
  }) as { data: { data: any[]; pagination: { hasNext: boolean } } | undefined; isLoading: boolean; error: any; refetch: () => void; isFetching: boolean };

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Failed to load products. Please try again.</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
        {Array.from({ length: 12 }).map((_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-muted-foreground mb-4">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No products found</h3>
          <p>Try adjusting your filters or search terms.</p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.data.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Load More Button */}
      {data.pagination.hasNext && (
        <div className="text-center mt-12">
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              // TODO: Implement load more functionality
              console.log('Load more products');
            }}
            disabled={isFetching}
          >
            {isFetching ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More Products'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

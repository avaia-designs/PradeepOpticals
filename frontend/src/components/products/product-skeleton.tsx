import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductSkeletonProps {
  className?: string;
}

export function ProductSkeleton({ className }: ProductSkeletonProps) {
  return (
    <Card className={className}>
      <div className="aspect-square">
        <Skeleton className="h-full w-full rounded-none" />
      </div>
      <CardContent className="p-4">
        <div className="space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-full" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-8" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface ProductSortProps {
  className?: string;
}

export function ProductSort({ className }: ProductSortProps) {
  const [sortBy, setSortBy] = React.useState('name');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'price', label: 'Price' },
    { value: 'rating', label: 'Rating' },
    { value: 'createdAt', label: 'Newest' },
    { value: 'popularity', label: 'Popularity' },
  ];

  const handleSortChange = (value: string) => {
    setSortBy(value);
    // TODO: Implement actual sorting logic
    console.log('Sort by:', value, 'Order:', sortOrder);
  };

  const toggleSortOrder = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    // TODO: Implement actual sorting logic
    console.log('Sort by:', sortBy, 'Order:', newOrder);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-muted-foreground">Sort by:</span>
      <Select value={sortBy} onValueChange={handleSortChange}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="icon"
        onClick={toggleSortOrder}
        className="h-9 w-9"
      >
        {sortOrder === 'asc' ? (
          <ArrowUp className="h-4 w-4" />
        ) : (
          <ArrowDown className="h-4 w-4" />
        )}
        <span className="sr-only">
          {sortOrder === 'asc' ? 'Sort ascending' : 'Sort descending'}
        </span>
      </Button>
    </div>
  );
}

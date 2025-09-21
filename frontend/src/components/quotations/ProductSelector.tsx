'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Check,
  ChevronsUpDown,
  Search,
} from 'lucide-react';
import { Product } from '@/types';
import { cn } from '@/lib/utils';

interface ProductSelectorProps {
  products: Product[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({
  products,
  value,
  onValueChange,
  placeholder = "Search and select a product...",
  disabled = false,
  error = false,
  className
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Find the selected product
  const selectedProduct = value ? products.find(product => product._id === value) : null;

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    
    const query = searchQuery.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  const handleSelect = (productId: string) => {
    onValueChange(productId);
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between h-12 px-4 py-3 text-left font-normal hover:bg-gray-50",
              error && "border-red-500 focus:border-red-500",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={disabled}
          >
            <span className="flex-1 text-left truncate mr-2">
              {selectedProduct ? (
                <span className="font-medium text-foreground">{selectedProduct.name}</span>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="Type to search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredProducts.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-500">
                No products found.
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div
                  key={product._id}
                  onClick={() => handleSelect(product._id)}
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <span className="font-medium">{product.name}</span>
                  <Check
                    className={cn(
                      "h-4 w-4",
                      value === product._id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </div>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

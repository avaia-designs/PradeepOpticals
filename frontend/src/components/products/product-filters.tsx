'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductFilters as ProductFiltersType } from '@/types';
import { ProductService } from '@/lib/services/product.service';
import { X } from 'lucide-react';

interface ProductFiltersProps {
  filters: ProductFiltersType;
  onFilterChange: (filters: Partial<ProductFiltersType>) => void;
}

export function ProductFilters({ filters, onFilterChange }: ProductFiltersProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 1000]);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [categoriesData, brandsData] = await Promise.all([
          ProductService.getCategories(),
          ProductService.getBrands(),
        ]);
        setCategories(categoriesData);
        setBrands(brandsData);
      } catch (error) {
        console.error('Error loading filter data:', error);
      }
    };

    loadFilters();
  }, []);

  const handleSearchChange = (value: string) => {
    onFilterChange({ search: value });
  };

  const handleCategoryChange = (category: string) => {
    onFilterChange({ category: category === 'all' ? '' : category });
  };

  const handleBrandChange = (brand: string) => {
    onFilterChange({ brand: brand === 'all' ? '' : brand });
  };

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values);
    onFilterChange({
      minPrice: values[0],
      maxPrice: values[1],
    });
  };

  const handleFeaturedChange = (checked: boolean) => {
    onFilterChange({ featured: checked ? true : undefined });
  };

  const handleInStockChange = (checked: boolean) => {
    onFilterChange({ inStock: checked ? true : undefined });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      category: '',
      brand: '',
      minPrice: undefined,
      maxPrice: undefined,
      featured: undefined,
      inStock: undefined,
    });
    setPriceRange([0, 1000]);
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && value !== false
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      {/* Search */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Search</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search products..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Category */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Category</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={filters.category || 'all'}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Brand */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Brand</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={filters.brand || 'all'}
            onValueChange={handleBrandChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Price Range */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Price Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Slider
              value={priceRange}
              onValueChange={handlePriceRangeChange}
              max={1000}
              min={0}
              step={10}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={filters.featured === true}
              onCheckedChange={handleFeaturedChange}
            />
            <Label htmlFor="featured" className="text-sm">
              Featured Products
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="inStock"
              checked={filters.inStock === true}
              onCheckedChange={handleInStockChange}
            />
            <Label htmlFor="inStock" className="text-sm">
              In Stock Only
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
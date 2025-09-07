'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductFiltersProps {
  className?: string;
}

export function ProductFilters({ className }: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);

  const categories = [
    'Prescription Glasses',
    'Sunglasses',
    'Reading Glasses',
    'Computer Glasses',
    'Progressive Lenses',
    'Kids Eyewear'
  ];

  const brands = [
    'Ray-Ban',
    'Oakley',
    'Gucci',
    'Prada',
    'Tom Ford',
    'Versace',
    'Dior',
    'Chanel'
  ];

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category]);
    } else {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    }
  };

  const handleBrandChange = (brand: string, checked: boolean) => {
    if (checked) {
      setSelectedBrands([...selectedBrands, brand]);
    } else {
      setSelectedBrands(selectedBrands.filter(b => b !== brand));
    }
  };

  const handleRatingChange = (rating: number, checked: boolean) => {
    if (checked) {
      setSelectedRatings([...selectedRatings, rating]);
    } else {
      setSelectedRatings(selectedRatings.filter(r => r !== rating));
    }
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedRatings([]);
    setPriceRange([0, 1000]);
  };

  const activeFiltersCount = selectedCategories.length + selectedBrands.length + selectedRatings.length;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          className="w-full justify-between"
          onClick={() => setIsOpen(!isOpen)}
        >
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount}
            </Badge>
          )}
          <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
        </Button>
      </div>

      {/* Filter Content */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="lg:block">
        <CollapsibleContent className="space-y-4">
          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} applied
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear all
              </Button>
            </div>
          )}

          {/* Price Range */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Price Range</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={1000}
                min={0}
                step={10}
                className="w-full"
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={(checked) => 
                      handleCategoryChange(category, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`category-${category}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {category}
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Brands */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Brands</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {brands.map((brand) => (
                <div key={brand} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand}`}
                    checked={selectedBrands.includes(brand)}
                    onCheckedChange={(checked) => 
                      handleBrandChange(brand, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`brand-${brand}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {brand}
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Rating */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Customer Rating</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center space-x-2">
                  <Checkbox
                    id={`rating-${rating}`}
                    checked={selectedRatings.includes(rating)}
                    onCheckedChange={(checked) => 
                      handleRatingChange(rating, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`rating-${rating}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {rating}+ stars
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Availability */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Availability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox id="in-stock" />
                <label
                  htmlFor="in-stock"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  In Stock
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="on-sale" />
                <label
                  htmlFor="on-sale"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  On Sale
                </label>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

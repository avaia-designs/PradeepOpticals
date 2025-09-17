'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Upload,
  X,
  Plus,
  Image as ImageIcon,
  Package,
  DollarSign,
  Tag,
  Settings,
} from 'lucide-react';
import { Product } from '@/types';
import { ProductService } from '@/lib/services/product.service';
import { toast } from 'sonner';

// Form validation schema
const productFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0, 'Price must be positive'),
  originalPrice: z.number().min(0, 'Original price must be positive').optional(),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  inventory: z.number().min(0, 'Inventory must be non-negative'),
  material: z.string().optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  weight: z.number().min(0, 'Weight must be positive').optional(),
  width: z.number().min(0, 'Width must be positive').optional(),
  height: z.number().min(0, 'Height must be positive').optional(),
  depth: z.number().min(0, 'Depth must be positive').optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: Product;
  onSave: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ProductForm({ product, onSave, onCancel, isLoading = false }: ProductFormProps) {
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [brands, setBrands] = useState<{ _id: string; name: string }[]>([]);
  const [tagInput, setTagInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      originalPrice: product?.originalPrice || undefined,
      category: product?.category._id || '',
      subcategory: product?.subcategory?._id || '',
      brand: product?.brand?._id || '',
      sku: product?.sku || '',
      inventory: product?.inventory || 0,
      material: product?.specifications?.material || '',
      color: product?.specifications?.color || '',
      size: product?.specifications?.size || '',
      weight: product?.specifications?.weight || undefined,
      width: product?.specifications?.dimensions?.width || undefined,
      height: product?.specifications?.dimensions?.height || undefined,
      depth: product?.specifications?.dimensions?.depth || undefined,
      tags: product?.tags || [],
      featured: product?.featured || false,
      isActive: product?.isActive ?? true,
    },
  });

  const watchedTags = watch('tags') || [];

  // Load categories and brands
  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesData, brandsData] = await Promise.all([
          ProductService.getCategories(),
          ProductService.getBrands(),
        ]);
        setCategories(categoriesData.map(cat => ({ _id: cat, name: cat }))); // Simplified for now
        setBrands(brandsData.map(brand => ({ _id: brand, name: brand }))); // Simplified for now
      } catch (error) {
        console.error('Error loading categories and brands:', error);
        toast.error('Failed to load categories and brands');
      }
    };

    loadData();
  }, []);

  const handleImageUpload = async (files: FileList) => {
    if (!product?._id) {
      toast.error('Please save the product first before uploading images');
      return;
    }

    setUploadingImages(true);
    try {
      const uploadPromises = Array.from(files).map(file => 
        ProductService.uploadProductImage(product._id, file)
      );
      
      const results = await Promise.all(uploadPromises);
      const newImageUrls = results.map(result => result.url);
      
      setImages(prev => [...prev, ...newImageUrls]);
      toast.success('Images uploaded successfully');
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = async (imageUrl: string) => {
    if (!product?._id) return;

    try {
      await ProductService.deleteProductImage(product._id, imageUrl);
      setImages(prev => prev.filter(img => img !== imageUrl));
      toast.success('Image removed successfully');
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Failed to remove image');
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !watchedTags.includes(tagInput.trim())) {
      const newTags = [...watchedTags, tagInput.trim()];
      setValue('tags', newTags);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = watchedTags.filter(tag => tag !== tagToRemove);
    setValue('tags', newTags);
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      const productData = {
        ...data,
        images,
        specifications: {
          material: data.material,
          color: data.color,
          size: data.size,
          weight: data.weight,
          dimensions: {
            width: data.width,
            height: data.height,
            depth: data.depth,
          },
        },
      };

      await onSave(productData);
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Product Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="Enter product name"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    {...register('sku')}
                    placeholder="Enter SKU"
                    className={errors.sku ? 'border-red-500' : ''}
                  />
                  {errors.sku && (
                    <p className="text-sm text-red-600 mt-1">{errors.sku.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Enter product description"
                  rows={4}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select onValueChange={(value) => setValue('category', value)}>
                    <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Select onValueChange={(value) => setValue('subcategory', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* TODO: Load subcategories based on selected category */}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Select onValueChange={(value) => setValue('brand', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand._id} value={brand._id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    {...register('price', { valueAsNumber: true })}
                    placeholder="0.00"
                    className={errors.price ? 'border-red-500' : ''}
                  />
                  {errors.price && (
                    <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="originalPrice">Original Price</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    step="0.01"
                    {...register('originalPrice', { valueAsNumber: true })}
                    placeholder="0.00"
                    className={errors.originalPrice ? 'border-red-500' : ''}
                  />
                  {errors.originalPrice && (
                    <p className="text-sm text-red-600 mt-1">{errors.originalPrice.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Inventory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="inventory">Stock Quantity *</Label>
                <Input
                  id="inventory"
                  type="number"
                  {...register('inventory', { valueAsNumber: true })}
                  placeholder="0"
                  className={errors.inventory ? 'border-red-500' : ''}
                />
                {errors.inventory && (
                  <p className="text-sm text-red-600 mt-1">{errors.inventory.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="material">Material</Label>
                  <Input
                    id="material"
                    {...register('material')}
                    placeholder="e.g., Acetate, Metal"
                  />
                </div>
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    {...register('color')}
                    placeholder="e.g., Black, Brown"
                  />
                </div>
                <div>
                  <Label htmlFor="size">Size</Label>
                  <Input
                    id="size"
                    {...register('size')}
                    placeholder="e.g., Medium, Large"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="weight">Weight (g)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    {...register('weight', { valueAsNumber: true })}
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <Label htmlFor="width">Width (mm)</Label>
                  <Input
                    id="width"
                    type="number"
                    step="0.1"
                    {...register('width', { valueAsNumber: true })}
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <Label htmlFor="height">Height (mm)</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    {...register('height', { valueAsNumber: true })}
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <Label htmlFor="depth">Depth (mm)</Label>
                  <Input
                    id="depth"
                    type="number"
                    step="0.1"
                    {...register('depth', { valueAsNumber: true })}
                    placeholder="0.0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Product Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage(image)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              
              {product?._id && (
                <div>
                  <input
                    type="file"
                    id="image-upload"
                    multiple
                    accept="image/*"
                    onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                    className="hidden"
                    disabled={uploadingImages}
                  />
                  <Label
                    htmlFor="image-upload"
                    className="flex items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                  >
                    {uploadingImages ? (
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">Uploading...</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Upload Images</p>
                      </div>
                    )}
                  </Label>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" onClick={handleAddTag} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {watchedTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="featured">Featured Product</Label>
                <Switch
                  id="featured"
                  checked={watch('featured')}
                  onCheckedChange={(checked) => setValue('featured', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Active</Label>
                <Switch
                  id="isActive"
                  checked={watch('isActive')}
                  onCheckedChange={(checked) => setValue('isActive', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}

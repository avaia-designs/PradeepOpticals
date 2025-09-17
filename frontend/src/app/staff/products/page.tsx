'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  Filter,
  MoreHorizontal,
  Plus,
  Edit,
  Eye,
  Package,
  RefreshCw,
  Image as ImageIcon,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Settings,
} from 'lucide-react';
import { RoleGuard } from '@/components/auth/role-guard';
import { Permission } from '@/lib/permissions';
import { ProductService } from '@/lib/services/product.service';
import { Product, ProductFilters } from '@/types';
import { toast } from 'sonner';
import Link from 'next/link';

export default function StaffProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    category: '',
    brand: '',
    featured: undefined,
    inStock: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load products from API
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await ProductService.getProducts(pagination.page, pagination.limit, filters);
      setProducts(result.data);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Failed to load products');
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }));
      loadProducts();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters.search, loadProducts]);

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<ProductFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleDeleteProduct = async (product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      setIsDeleting(true);
      await ProductService.deleteProduct(productToDelete._id);
      toast.success('Product deleted successfully');
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
      loadProducts(); // Reload products
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRefresh = () => {
    loadProducts();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getStatusBadge = (product: Product) => {
    if (!product.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    if (product.inventory === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    }
    if (product.inventory < 10) {
      return <Badge variant="outline" className="text-orange-600 border-orange-600">Low Stock</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  const getStockIcon = (product: Product) => {
    if (product.inventory === 0) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    if (product.inventory < 10) {
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    }
    return <Package className="h-4 w-4 text-green-500" />;
  };

  return (
    <RoleGuard permission={Permission.MANAGE_INVENTORY}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Product Management</h1>
                <p className="text-sm text-gray-600">Manage inventory and product catalog</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleRefresh} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button asChild>
                  <Link href="/staff/products/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Package className="h-8 w-8 text-blue-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Products</p>
                      <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-green-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">In Stock</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {products.filter(p => p.inventory > 0).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="h-8 w-8 text-orange-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Low Stock</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {products.filter(p => p.inventory > 0 && p.inventory < 10).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-purple-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Featured</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {products.filter(p => p.featured).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search products..."
                        value={filters.search || ''}
                        onChange={(e) => handleFilterChange({ search: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={filters.category || ''}
                      onChange={(e) => handleFilterChange({ category: e.target.value })}
                      className="px-3 py-2 border rounded-md"
                    >
                      <option value="">All Categories</option>
                      {/* TODO: Load categories from API */}
                    </select>
                    <select
                      value={filters.brand || ''}
                      onChange={(e) => handleFilterChange({ brand: e.target.value })}
                      className="px-3 py-2 border rounded-md"
                    >
                      <option value="">All Brands</option>
                      {/* TODO: Load brands from API */}
                    </select>
                    <select
                      value={filters.inStock === undefined ? '' : filters.inStock.toString()}
                      onChange={(e) => handleFilterChange({ 
                        inStock: e.target.value === '' ? undefined : e.target.value === 'true' 
                      })}
                      className="px-3 py-2 border rounded-md"
                    >
                      <option value="">All Stock Status</option>
                      <option value="true">In Stock</option>
                      <option value="false">Out of Stock</option>
                    </select>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Products ({pagination.total})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-lg" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-[200px]" />
                          <Skeleton className="h-3 w-[150px]" />
                        </div>
                        <Skeleton className="h-6 w-[80px]" />
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button onClick={handleRefresh} variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No products found</p>
                    <Button onClick={handleRefresh} variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Featured</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product._id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                {product.images && product.images.length > 0 ? (
                                  <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="h-12 w-12 rounded-lg object-cover"
                                  />
                                ) : (
                                  <ImageIcon className="h-6 w-6 text-gray-400" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium">{product.name}</div>
                                <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{product.category.name}</div>
                              {product.brand && (
                                <div className="text-sm text-gray-500">{product.brand.name}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{formatPrice(product.price)}</div>
                              {product.originalPrice && product.originalPrice > product.price && (
                                <div className="text-sm text-green-600">
                                  {formatPrice(product.originalPrice)}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getStockIcon(product)}
                              <span className="font-medium">{product.inventory}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(product)}
                          </TableCell>
                          <TableCell>
                            {product.featured ? (
                              <Badge variant="default">Featured</Badge>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-500">
                              {new Date(product.createdAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" disabled={isDeleting}>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                  <Link href={`/staff/products/${product._id}`}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/staff/products/${product._id}/edit`}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => handleDeleteProduct(product)}
                                  disabled={isDeleting}
                                >
                                  <Settings className="h-4 w-4 mr-2" />
                                  {isDeleting ? 'Deleting...' : 'Delete'}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} products
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={pagination.page === 1 || loading}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-gray-600">
                        Page {pagination.page} of {pagination.pages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page === pagination.pages || loading}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Product</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDeleteDialogOpen(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={confirmDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}

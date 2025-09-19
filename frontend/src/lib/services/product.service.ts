import { apiClient } from '../api-client';
import { Product, ProductFilters, PaginatedResult, ApiResponse } from '@/types';

export class ProductService {
  /**
   * Get all products with filtering and pagination
   */
  static async getProducts(
    page: number = 1,
    limit: number = 12,
    filters: ProductFilters = {}
  ): Promise<PaginatedResult<Product>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined)
        ),
      });

      const response = await apiClient.get<Product[]>(`/products?${params}`);
      
      // Extract data and pagination from the API response structure
      return {
        data: response.data,  // Backend returns products array in data
        pagination: response.meta?.pagination || { page: 1, limit: 12, total: 0, pages: 0 }
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  /**
   * Get product by ID
   */
  static async getProductById(id: string): Promise<Product> {
    try {
      const response = await apiClient.get<Product>(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  /**
   * Get product categories
   */
  static async getCategories(): Promise<string[]> {
    try {
      const response = await apiClient.get<string[]>('/products/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Get product brands
   */
  static async getBrands(): Promise<string[]> {
    try {
      const response = await apiClient.get<string[]>('/products/brands');
      return response.data;
    } catch (error) {
      console.error('Error fetching brands:', error);
      throw error;
    }
  }

  /**
   * Get featured products
   */
  static async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    try {
      const response = await apiClient.get<Product[]>(`/products/featured?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  }

  /**
   * Search products
   */
  static async searchProducts(
    query: string,
    page: number = 1,
    limit: number = 12,
    filters: Omit<ProductFilters, 'search'> = {}
  ): Promise<PaginatedResult<Product>> {
    return this.getProducts(page, limit, { ...filters, search: query });
  }

  /**
   * Get products by category
   */
  static async getProductsByCategory(
    category: string,
    page: number = 1,
    limit: number = 12,
    filters: Omit<ProductFilters, 'category'> = {}
  ): Promise<PaginatedResult<Product>> {
    return this.getProducts(page, limit, { ...filters, category });
  }

  /**
   * Get products by brand
   */
  static async getProductsByBrand(
    brand: string,
    page: number = 1,
    limit: number = 12,
    filters: Omit<ProductFilters, 'brand'> = {}
  ): Promise<PaginatedResult<Product>> {
    return this.getProducts(page, limit, { ...filters, brand });
  }

  /**
   * Get related products
   */
  static async getRelatedProducts(
    productId: string,
    limit: number = 4
  ): Promise<Product[]> {
    // This would typically be a separate endpoint
    // For now, we'll get featured products as a fallback
    return this.getFeaturedProducts(limit);
  }

  // Admin/Staff methods
  /**
   * Create new product (Admin/Staff only)
   */
  static async createProduct(productData: {
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    category: string;
    brand?: string;
    images: string[];
    inventory: number;
    sku: string;
    specifications?: {
      material?: string;
      color?: string;
      size?: string;
      weight?: number;
      dimensions?: {
        width?: number;
        height?: number;
        depth?: number;
      };
    };
    tags?: string[];
    featured?: boolean;
  }): Promise<Product> {
    try {
      const response = await apiClient.post<Product>('/products', productData);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  /**
   * Update product (Admin/Staff only)
   */
  static async updateProduct(
    id: string, 
    productData: Partial<{
      name: string;
      description: string;
      price: number;
      originalPrice?: number;
      category: string;
      brand?: string;
      images: string[];
      inventory: number;
      sku: string;
      specifications?: {
        material?: string;
        color?: string;
        size?: string;
        weight?: number;
        dimensions?: {
          width?: number;
          height?: number;
          depth?: number;
        };
      };
      tags?: string[];
      featured?: boolean;
      isActive?: boolean;
    }>
  ): Promise<Product> {
    try {
      const response = await apiClient.put<Product>(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  /**
   * Delete product (Admin/Staff only)
   */
  static async deleteProduct(id: string): Promise<void> {
    try {
      await apiClient.delete(`/products/${id}`);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  /**
   * Toggle product active status (Admin/Staff only)
   */
  static async toggleProductStatus(id: string, isActive: boolean): Promise<Product> {
    try {
      const response = await apiClient.patch<Product>(`/products/${id}/status`, { isActive });
      return response.data;
    } catch (error) {
      console.error('Error toggling product status:', error);
      throw error;
    }
  }

  /**
   * Update product inventory (Admin/Staff only)
   */
  static async updateInventory(id: string, inventory: number): Promise<Product> {
    try {
      const response = await apiClient.patch<Product>(`/products/${id}/inventory`, { inventory });
      return response.data;
    } catch (error) {
      console.error('Error updating inventory:', error);
      throw error;
    }
  }

  /**
   * Upload product image (Admin/Staff only)
   */
  static async uploadProductImage(
    productId: string, 
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<{ url: string }> {
    try {
      const response = await apiClient.uploadFile<{ url: string }>(
        `/products/${productId}/images`, 
        file, 
        onProgress
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading product image:', error);
      throw error;
    }
  }

  /**
   * Delete product image (Admin/Staff only)
   */
  static async deleteProductImage(productId: string, imageUrl: string): Promise<void> {
    try {
      await apiClient.delete(`/products/${productId}/images`, {
        data: { imageUrl }
      });
    } catch (error) {
      console.error('Error deleting product image:', error);
      throw error;
    }
  }
}

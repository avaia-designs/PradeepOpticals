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
}

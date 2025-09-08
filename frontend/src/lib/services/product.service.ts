import { apiClient } from '../api-client';
import { Product, ProductFilters, PaginatedResult } from '@/types';

export class ProductService {
  /**
   * Get all products with filtering and pagination
   */
  static async getProducts(
    page: number = 1,
    limit: number = 12,
    filters: ProductFilters = {}
  ): Promise<PaginatedResult<Product>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined)
      ),
    });

    const response = await apiClient.get<PaginatedResult<Product>>(`/products?${params}`);
    return response.data;
  }

  /**
   * Get product by ID
   */
  static async getProductById(id: string): Promise<Product> {
    const response = await apiClient.get<Product>(`/products/${id}`);
    return response.data;
  }

  /**
   * Get product categories
   */
  static async getCategories(): Promise<string[]> {
    const response = await apiClient.get<string[]>('/products/categories');
    return response.data;
  }

  /**
   * Get product brands
   */
  static async getBrands(): Promise<string[]> {
    const response = await apiClient.get<string[]>('/products/brands');
    return response.data;
  }

  /**
   * Get featured products
   */
  static async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    const response = await apiClient.get<Product[]>(`/products/featured?limit=${limit}`);
    return response.data;
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

import { apiClient } from '@/lib/api-client';
import { Product, ProductFilters, PaginatedResult, Category, Review } from '@/types';

export class ProductService {
  private basePath = '/products';

  async getProducts(filters: ProductFilters = {}): Promise<PaginatedResult<Product>> {
    const response = await apiClient.get<PaginatedResult<Product>>(this.basePath, {
      params: filters,
    });
    return response.data;
  }

  async getProduct(id: string): Promise<Product> {
    const response = await apiClient.get<Product>(`${this.basePath}/${id}`);
    return response.data;
  }

  async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    const response = await apiClient.get<Product[]>(`${this.basePath}/featured`, {
      params: { limit },
    });
    return response.data;
  }

  async getRelatedProducts(productId: string, limit: number = 4): Promise<Product[]> {
    const response = await apiClient.get<Product[]>(`${this.basePath}/${productId}/related`, {
      params: { limit },
    });
    return response.data;
  }

  async searchProducts(query: string, filters: Omit<ProductFilters, 'search'> = {}): Promise<PaginatedResult<Product>> {
    const response = await apiClient.get<PaginatedResult<Product>>(`${this.basePath}/search`, {
      params: { ...filters, search: query },
    });
    return response.data;
  }

  async getProductReviews(productId: string, page: number = 1, limit: number = 10): Promise<PaginatedResult<Review>> {
    const response = await apiClient.get<PaginatedResult<Review>>(`${this.basePath}/${productId}/reviews`, {
      params: { page, limit },
    });
    return response.data;
  }

  async addProductReview(productId: string, review: {
    rating: number;
    title: string;
    comment: string;
    images?: string[];
  }): Promise<Review> {
    const response = await apiClient.post<Review>(`${this.basePath}/${productId}/reviews`, review);
    return response.data;
  }

  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<Category[]>('/categories');
    return response.data;
  }

  async getCategory(slug: string): Promise<Category> {
    const response = await apiClient.get<Category>(`/categories/${slug}`);
    return response.data;
  }

  async getProductsByCategory(categorySlug: string, filters: Omit<ProductFilters, 'category'> = {}): Promise<PaginatedResult<Product>> {
    const response = await apiClient.get<PaginatedResult<Product>>(`/categories/${categorySlug}/products`, {
      params: filters,
    });
    return response.data;
  }

  async getBrands(): Promise<string[]> {
    const response = await apiClient.get<string[]>('/brands');
    return response.data;
  }

  async getProductsByBrand(brand: string, filters: Omit<ProductFilters, 'brand'> = {}): Promise<PaginatedResult<Product>> {
    const response = await apiClient.get<PaginatedResult<Product>>(`/brands/${brand}/products`, {
      params: filters,
    });
    return response.data;
  }

  async getProductSuggestions(query: string, limit: number = 5): Promise<string[]> {
    const response = await apiClient.get<string[]>(`${this.basePath}/suggestions`, {
      params: { q: query, limit },
    });
    return response.data;
  }

  async getRecentlyViewed(): Promise<Product[]> {
    const response = await apiClient.get<Product[]>(`${this.basePath}/recently-viewed`);
    return response.data;
  }

  async addToRecentlyViewed(productId: string): Promise<void> {
    await apiClient.post(`${this.basePath}/${productId}/view`);
  }

  async getPopularProducts(limit: number = 8): Promise<Product[]> {
    const response = await apiClient.get<Product[]>(`${this.basePath}/popular`, {
      params: { limit },
    });
    return response.data;
  }

  async getNewArrivals(limit: number = 8): Promise<Product[]> {
    const response = await apiClient.get<Product[]>(`${this.basePath}/new-arrivals`, {
      params: { limit },
    });
    return response.data;
  }

  async getOnSaleProducts(limit: number = 8): Promise<Product[]> {
    const response = await apiClient.get<Product[]>(`${this.basePath}/on-sale`, {
      params: { limit },
    });
    return response.data;
  }
}

export const productService = new ProductService();

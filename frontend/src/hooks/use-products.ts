import { useQuery } from '@tanstack/react-query';
import { ProductService } from '@/lib/services/product.service';
import { Product, ProductFilters } from '@/types';

export function useProducts(
  page: number = 1,
  limit: number = 12,
  filters: ProductFilters = {}
) {
  return useQuery({
    queryKey: ['products', page, limit, filters],
    queryFn: () => ProductService.getProducts(page, limit, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => ProductService.getProductById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useProductCategories() {
  return useQuery({
    queryKey: ['product-categories'],
    queryFn: () => ProductService.getCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useProductBrands() {
  return useQuery({
    queryKey: ['product-brands'],
    queryFn: () => ProductService.getBrands(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useFeaturedProducts(limit: number = 8) {
  return useQuery({
    queryKey: ['featured-products', limit],
    queryFn: () => ProductService.getFeaturedProducts(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useProductSuggestions(query: string, limit: number = 5) {
  return useQuery({
    queryKey: ['product-suggestions', query, limit],
    queryFn: () => ProductService.searchProducts(query, 1, limit),
    enabled: query.length > 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
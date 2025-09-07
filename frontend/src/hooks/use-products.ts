import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/lib/services/product-service';
import { Product, ProductFilters, PaginatedResult, Review } from '@/types';

// Query keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: ProductFilters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  featured: () => [...productKeys.all, 'featured'] as const,
  related: (id: string) => [...productKeys.all, 'related', id] as const,
  search: (query: string, filters: Omit<ProductFilters, 'search'>) => [...productKeys.all, 'search', query, filters] as const,
  reviews: (id: string) => [...productKeys.all, 'reviews', id] as const,
  categories: () => [...productKeys.all, 'categories'] as const,
  brands: () => [...productKeys.all, 'brands'] as const,
  suggestions: (query: string) => [...productKeys.all, 'suggestions', query] as const,
  recentlyViewed: () => [...productKeys.all, 'recently-viewed'] as const,
  popular: () => [...productKeys.all, 'popular'] as const,
  newArrivals: () => [...productKeys.all, 'new-arrivals'] as const,
  onSale: () => [...productKeys.all, 'on-sale'] as const,
};

// Get products with filters
export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => productService.getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Get single product
export function useProduct(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productService.getProduct(id),
    enabled: !!id && (options?.enabled !== false),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Get featured products
export function useFeaturedProducts(limit: number = 8) {
  return useQuery({
    queryKey: [...productKeys.featured(), limit],
    queryFn: () => productService.getFeaturedProducts(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Get related products
export function useRelatedProducts(productId: string, limit: number = 4) {
  return useQuery({
    queryKey: [...productKeys.related(productId), limit],
    queryFn: () => productService.getRelatedProducts(productId, limit),
    enabled: !!productId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Search products
export function useSearchProducts(query: string, filters: Omit<ProductFilters, 'search'> = {}) {
  return useQuery({
    queryKey: productKeys.search(query, filters),
    queryFn: () => productService.searchProducts(query, filters),
    enabled: !!query && query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get product reviews
export function useProductReviews(productId: string, page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: [...productKeys.reviews(productId), page, limit],
    queryFn: () => productService.getProductReviews(productId, page, limit),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Add product review
export function useAddProductReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ productId, review }: {
      productId: string;
      review: {
        rating: number;
        title: string;
        comment: string;
        images?: string[];
      };
    }) => productService.addProductReview(productId, review),
    onSuccess: (data, variables) => {
      // Invalidate and refetch product reviews
      queryClient.invalidateQueries({
        queryKey: productKeys.reviews(variables.productId),
      });
      
      // Invalidate product details to update rating
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      });
    },
  });
}

// Get categories
export function useCategories() {
  return useQuery({
    queryKey: productKeys.categories(),
    queryFn: () => productService.getCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

// Get single category
export function useCategory(slug: string) {
  return useQuery({
    queryKey: [...productKeys.categories(), slug],
    queryFn: () => productService.getCategory(slug),
    enabled: !!slug,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

// Get products by category
export function useProductsByCategory(categorySlug: string, filters: Omit<ProductFilters, 'category'> = {}) {
  return useQuery({
    queryKey: [...productKeys.categories(), categorySlug, 'products', filters],
    queryFn: () => productService.getProductsByCategory(categorySlug, filters),
    enabled: !!categorySlug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Get brands
export function useBrands() {
  return useQuery({
    queryKey: productKeys.brands(),
    queryFn: () => productService.getBrands(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

// Get products by brand
export function useProductsByBrand(brand: string, filters: Omit<ProductFilters, 'brand'> = {}) {
  return useQuery({
    queryKey: [...productKeys.brands(), brand, 'products', filters],
    queryFn: () => productService.getProductsByBrand(brand, filters),
    enabled: !!brand,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Get product suggestions
export function useProductSuggestions(query: string, limit: number = 5) {
  return useQuery({
    queryKey: [...productKeys.suggestions(query), limit],
    queryFn: () => productService.getProductSuggestions(query, limit),
    enabled: !!query && query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get recently viewed products
export function useRecentlyViewed() {
  return useQuery({
    queryKey: productKeys.recentlyViewed(),
    queryFn: () => productService.getRecentlyViewed(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Add to recently viewed
export function useAddToRecentlyViewed() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (productId: string) => productService.addToRecentlyViewed(productId),
    onSuccess: () => {
      // Invalidate recently viewed to refetch
      queryClient.invalidateQueries({
        queryKey: productKeys.recentlyViewed(),
      });
    },
  });
}

// Get popular products
export function usePopularProducts(limit: number = 8) {
  return useQuery({
    queryKey: [...productKeys.popular(), limit],
    queryFn: () => productService.getPopularProducts(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Get new arrivals
export function useNewArrivals(limit: number = 8) {
  return useQuery({
    queryKey: [...productKeys.newArrivals(), limit],
    queryFn: () => productService.getNewArrivals(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Get on sale products
export function useOnSaleProducts(limit: number = 8) {
  return useQuery({
    queryKey: [...productKeys.onSale(), limit],
    queryFn: () => productService.getOnSaleProducts(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Prefetch product data
export function usePrefetchProduct() {
  const queryClient = useQueryClient();
  
  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: productKeys.detail(id),
      queryFn: () => productService.getProduct(id),
      staleTime: 10 * 60 * 1000,
    });
  };
}

// Prefetch related products
export function usePrefetchRelatedProducts() {
  const queryClient = useQueryClient();
  
  return (productId: string, limit: number = 4) => {
    queryClient.prefetchQuery({
      queryKey: [...productKeys.related(productId), limit],
      queryFn: () => productService.getRelatedProducts(productId, limit),
      staleTime: 10 * 60 * 1000,
    });
  };
}

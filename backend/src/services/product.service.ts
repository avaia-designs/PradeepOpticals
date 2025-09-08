import { Product, IProduct } from '../models';
import { Logger } from '../utils/logger';
import { PaginatedResult } from '../types';

export interface ProductFilters {
  category?: string;
  subcategory?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  inStock?: boolean;
  search?: string;
  sortBy?: 'name' | 'price' | 'rating' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory?: string;
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
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  category?: string;
  subcategory?: string;
  brand?: string;
  images?: string[];
  inventory?: number;
  sku?: string;
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
}

export class ProductService {
  /**
   * Get all products with filtering and pagination
   */
  static async getProducts(
    page: number = 1,
    limit: number = 12,
    filters: ProductFilters = {}
  ): Promise<PaginatedResult<IProduct>> {
    try {
      Logger.info('Fetching products', { page, limit, filters });

      const skip = (page - 1) * limit;
      const query: any = { isActive: true };

      // Apply filters
      if (filters.category) {
        query.category = filters.category;
      }

      if (filters.subcategory) {
        query.subcategory = filters.subcategory;
      }

      if (filters.brand) {
        query.brand = filters.brand;
      }

      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        query.price = {};
        if (filters.minPrice !== undefined) {
          query.price.$gte = filters.minPrice;
        }
        if (filters.maxPrice !== undefined) {
          query.price.$lte = filters.maxPrice;
        }
      }

      if (filters.featured !== undefined) {
        query.featured = filters.featured;
      }

      if (filters.inStock !== undefined) {
        if (filters.inStock) {
          query.inventory = { $gt: 0 };
        } else {
          query.inventory = { $lte: 0 };
        }
      }

      if (filters.search) {
        query.$text = { $search: filters.search };
      }

      // Build sort object
      const sort: any = {};
      if (filters.sortBy) {
        sort[filters.sortBy] = filters.sortOrder === 'asc' ? 1 : -1;
      } else {
        sort.createdAt = -1; // Default sort by newest
      }

      const [products, total] = await Promise.all([
        Product.find(query)
          .select('-__v')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        Product.countDocuments(query).exec()
      ]);

      const result: PaginatedResult<IProduct> = {
        data: products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

      Logger.info('Products fetched successfully', { count: products.length, total });
      return result;
    } catch (error) {
      Logger.error('Failed to fetch products', error as Error);
      throw error;
    }
  }

  /**
   * Get product by ID
   */
  static async getProductById(id: string): Promise<IProduct> {
    try {
      Logger.info('Fetching product by ID', { productId: id });

      const product = await Product.findById(id).lean().exec();

      if (!product) {
        throw new Error('Product not found');
      }

      Logger.info('Product fetched successfully', { productId: id });
      return product;
    } catch (error) {
      Logger.error('Failed to fetch product', error as Error, { productId: id });
      throw error;
    }
  }

  /**
   * Create new product
   */
  static async createProduct(data: CreateProductData): Promise<IProduct> {
    try {
      Logger.info('Creating new product', { name: data.name, sku: data.sku });

      // Check if SKU already exists
      const existingProduct = await Product.findOne({ sku: data.sku });
      if (existingProduct) {
        throw new Error('Product with this SKU already exists');
      }

      const product = new Product(data);
      await product.save();

      Logger.info('Product created successfully', { productId: product._id, sku: data.sku });
      return product;
    } catch (error) {
      Logger.error('Failed to create product', error as Error);
      throw error;
    }
  }

  /**
   * Update product
   */
  static async updateProduct(id: string, data: UpdateProductData): Promise<IProduct> {
    try {
      Logger.info('Updating product', { productId: id });

      const product = await Product.findById(id);
      if (!product) {
        throw new Error('Product not found');
      }

      // Check if SKU is being changed and if it already exists
      if (data.sku && data.sku !== product.sku) {
        const existingProduct = await Product.findOne({ sku: data.sku, _id: { $ne: id } });
        if (existingProduct) {
          throw new Error('Product with this SKU already exists');
        }
      }

      Object.assign(product, data);
      await product.save();

      Logger.info('Product updated successfully', { productId: id });
      return product;
    } catch (error) {
      Logger.error('Failed to update product', error as Error, { productId: id });
      throw error;
    }
  }

  /**
   * Delete product (soft delete)
   */
  static async deleteProduct(id: string): Promise<void> {
    try {
      Logger.info('Deleting product', { productId: id });

      const product = await Product.findById(id);
      if (!product) {
        throw new Error('Product not found');
      }

      product.isActive = false;
      await product.save();

      Logger.info('Product deleted successfully', { productId: id });
    } catch (error) {
      Logger.error('Failed to delete product', error as Error, { productId: id });
      throw error;
    }
  }

  /**
   * Get product categories
   */
  static async getCategories(): Promise<string[]> {
    try {
      Logger.info('Fetching product categories');

      const categories = await Product.distinct('category', { isActive: true });
      
      Logger.info('Categories fetched successfully', { count: categories.length });
      return categories;
    } catch (error) {
      Logger.error('Failed to fetch categories', error as Error);
      throw error;
    }
  }

  /**
   * Get product brands
   */
  static async getBrands(): Promise<string[]> {
    try {
      Logger.info('Fetching product brands');

      const brands = await Product.distinct('brand', { isActive: true, brand: { $exists: true, $ne: null } });
      
      Logger.info('Brands fetched successfully', { count: brands.length });
      return brands;
    } catch (error) {
      Logger.error('Failed to fetch brands', error as Error);
      throw error;
    }
  }

  /**
   * Get featured products
   */
  static async getFeaturedProducts(limit: number = 8): Promise<IProduct[]> {
    try {
      Logger.info('Fetching featured products', { limit });

      const products = await Product.find({ featured: true, isActive: true })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean()
        .exec();

      Logger.info('Featured products fetched successfully', { count: products.length });
      return products;
    } catch (error) {
      Logger.error('Failed to fetch featured products', error as Error);
      throw error;
    }
  }

  /**
   * Update product inventory
   */
  static async updateInventory(id: string, quantity: number): Promise<boolean> {
    try {
      Logger.info('Updating product inventory', { productId: id, quantity });

      const product = await Product.findById(id);
      if (!product) {
        throw new Error('Product not found');
      }

      const success = product.updateInventory(quantity);
      if (!success) {
        throw new Error('Insufficient inventory');
      }

      await product.save();

      Logger.info('Inventory updated successfully', { productId: id, newInventory: product.inventory });
      return true;
    } catch (error) {
      Logger.error('Failed to update inventory', error as Error, { productId: id, quantity });
      throw error;
    }
  }
}

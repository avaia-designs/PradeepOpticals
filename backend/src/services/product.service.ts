import mongoose from 'mongoose';
import { Product, IProduct, Category, Brand } from '../models';
import { Logger } from '../utils/logger';
import { PaginatedResult, ApiProduct } from '../types';

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
   * Transform database product to API response format
   */
  private static transformProduct(product: any): ApiProduct {
    return {
      _id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      category: {
        _id: product.category._id.toString(),
        name: product.category.name
      },
      subcategory: product.subcategory ? {
        _id: product.subcategory._id.toString(),
        name: product.subcategory.name
      } : undefined,
      brand: product.brand ? {
        _id: product.brand._id.toString(),
        name: product.brand.name
      } : undefined,
      images: product.images,
      inventory: product.inventory,
      sku: product.sku,
      specifications: product.specifications,
      tags: product.tags,
      isActive: product.isActive,
      featured: product.featured,
      rating: product.rating,
      reviewCount: product.reviewCount,
      createdAt: product.createdAt.toISOString(),
      modifiedAt: product.modifiedAt.toISOString(),
      discountPercentage: product.originalPrice && product.price < product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : undefined
    };
  }

  /**
   * Get all products with filtering and pagination
   */
  static async getProducts(
    page: number = 1,
    limit: number = 12,
    filters: ProductFilters = {}
  ): Promise<PaginatedResult<ApiProduct>> {
    try {
      Logger.info('Fetching products', { page, limit, filters });

      const skip = (page - 1) * limit;
      const query: any = { isActive: true };

      // Apply filters
      if (filters.category) {
        // Find category by name and get its ID
        const category = await Category.findOne({ name: filters.category, isActive: true }).select('_id');
        if (category) {
          query.category = category._id;
        } else {
          // If category not found, return empty results
          query.category = new mongoose.Types.ObjectId('000000000000000000000000');
        }
      }

      if (filters.subcategory) {
        // Find subcategory by name and get its ID
        const subcategory = await Category.findOne({ name: filters.subcategory, isActive: true }).select('_id');
        if (subcategory) {
          query.subcategory = subcategory._id;
        } else {
          // If subcategory not found, return empty results
          query.subcategory = new mongoose.Types.ObjectId('000000000000000000000000');
        }
      }

      if (filters.brand) {
        // Find brand by name and get its ID
        const brand = await Brand.findOne({ name: filters.brand, isActive: true }).select('_id');
        if (brand) {
          query.brand = brand._id;
        } else {
          // If brand not found, return empty results
          query.brand = new mongoose.Types.ObjectId('000000000000000000000000');
        }
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
          .populate('category', 'name')
          .populate('brand', 'name')
          .select('-__v')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        Product.countDocuments(query).exec()
      ]);

      // Transform products to API format
      const transformedProducts = products.map(product => this.transformProduct(product));

      const result: PaginatedResult<ApiProduct> = {
        data: transformedProducts,
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
  static async getProductById(id: string): Promise<ApiProduct> {
    try {
      Logger.info('Fetching product by ID', { productId: id });

      const product = await Product.findById(id)
        .populate('category', 'name')
        .populate('brand', 'name')
        .lean()
        .exec();

      if (!product) {
        throw new Error('Product not found');
      }

      const transformedProduct = this.transformProduct(product);

      Logger.info('Product fetched successfully', { productId: id });
      return transformedProduct;
    } catch (error) {
      Logger.error('Failed to fetch product', error as Error, { productId: id });
      throw error;
    }
  }

  /**
   * Create new product
   */
  static async createProduct(data: CreateProductData): Promise<ApiProduct> {
    try {
      Logger.info('Creating new product', { name: data.name, sku: data.sku });

      // Check if SKU already exists
      const existingProduct = await Product.findOne({ sku: data.sku });
      if (existingProduct) {
        throw new Error('Product with this SKU already exists');
      }

      const product = new Product(data);
      await product.save();

      // Fetch the created product with populated references
      const createdProduct = await Product.findById(product._id)
        .populate('category', 'name')
        .populate('brand', 'name')
        .lean()
        .exec();

      if (!createdProduct) {
        throw new Error('Failed to fetch created product');
      }

      const transformedProduct = this.transformProduct(createdProduct);

      Logger.info('Product created successfully', { productId: product._id, sku: data.sku });
      return transformedProduct;
    } catch (error) {
      Logger.error('Failed to create product', error as Error);
      throw error;
    }
  }

  /**
   * Update product
   */
  static async updateProduct(id: string, data: UpdateProductData): Promise<ApiProduct> {
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

      // Fetch the updated product with populated references
      const updatedProduct = await Product.findById(id)
        .populate('category', 'name')
        .populate('brand', 'name')
        .lean()
        .exec();

      if (!updatedProduct) {
        throw new Error('Failed to fetch updated product');
      }

      const transformedProduct = this.transformProduct(updatedProduct);

      Logger.info('Product updated successfully', { productId: id });
      return transformedProduct;
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

      const categories = await Category.find({ isActive: true })
        .select('name')
        .sort({ name: 1 })
        .lean()
        .exec();
      
      const categoryNames = categories.map(cat => cat.name);
      
      Logger.info('Categories fetched successfully', { count: categoryNames.length });
      return categoryNames;
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

      const brands = await Brand.find({ isActive: true })
        .select('name')
        .sort({ name: 1 })
        .lean()
        .exec();
      
      const brandNames = brands.map(brand => brand.name);
      
      Logger.info('Brands fetched successfully', { count: brandNames.length });
      return brandNames;
    } catch (error) {
      Logger.error('Failed to fetch brands', error as Error);
      throw error;
    }
  }

  /**
   * Get featured products
   */
  static async getFeaturedProducts(limit: number = 8): Promise<ApiProduct[]> {
    try {
      Logger.info('Fetching featured products', { limit });

      const products = await Product.find({ featured: true, isActive: true })
        .populate('category', 'name')
        .populate('brand', 'name')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean()
        .exec();

      // Transform products to API format
      const transformedProducts = products.map(product => this.transformProduct(product));

      Logger.info('Featured products fetched successfully', { count: products.length });
      return transformedProducts;
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

      if (product.inventory + quantity < 0) {
        throw new Error('Insufficient inventory');
      }
      product.inventory += quantity;

      await product.save();

      Logger.info('Inventory updated successfully', { productId: id, newInventory: product.inventory });
      return true;
    } catch (error) {
      Logger.error('Failed to update inventory', error as Error, { productId: id, quantity });
      throw error;
    }
  }
}

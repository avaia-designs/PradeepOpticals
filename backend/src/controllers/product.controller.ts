import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { Logger } from '../utils/logger';

/**
 * Product controller
 * Handles product-related operations
 */
export class ProductController {
  /**
   * Get all products with filtering and pagination
   * GET /api/v1/products
   */
  static async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;
      
      const filters = {
        category: req.query.category as string,
        subcategory: req.query.subcategory as string,
        brand: req.query.brand as string,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        featured: req.query.featured ? req.query.featured === 'true' : undefined,
        inStock: req.query.inStock ? req.query.inStock === 'true' : undefined,
        search: req.query.search as string,
        sortBy: req.query.sortBy as 'name' | 'price' | 'rating' | 'createdAt',
        sortOrder: req.query.sortOrder as 'asc' | 'desc'
      };

      const result = await ProductService.getProducts(page, limit, filters);

      Logger.info('Products fetched successfully', { page, limit, count: result.data.length });

      res.status(200).json({
        success: true,
        data: result.data,
        meta: {
          pagination: result.pagination
        },
        message: 'Products retrieved successfully'
      });
    } catch (error) {
      Logger.error('Failed to fetch products', error as Error);
      next(error);
    }
  }

  /**
   * Get product by ID
   * GET /api/v1/products/:id
   */
  static async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const product = await ProductService.getProductById(id);

      Logger.info('Product fetched successfully', { productId: id });

      res.status(200).json({
        success: true,
        data: product,
        message: 'Product retrieved successfully'
      });
    } catch (error) {
      Logger.error('Failed to fetch product', error as Error);
      next(error);
    }
  }

  /**
   * Create new product (Staff/Admin only)
   * POST /api/v1/products
   */
  static async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const productData = req.body;

      const product = await ProductService.createProduct(productData);

      Logger.info('Product created successfully', { productId: product._id });

      res.status(201).json({
        success: true,
        data: product,
        message: 'Product created successfully'
      });
    } catch (error) {
      Logger.error('Failed to create product', error as Error);
      next(error);
    }
  }

  /**
   * Update product (Staff/Admin only)
   * PUT /api/v1/products/:id
   */
  static async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const product = await ProductService.updateProduct(id, updateData);

      Logger.info('Product updated successfully', { productId: id });

      res.status(200).json({
        success: true,
        data: product,
        message: 'Product updated successfully'
      });
    } catch (error) {
      Logger.error('Failed to update product', error as Error);
      next(error);
    }
  }

  /**
   * Delete product (Staff/Admin only)
   * DELETE /api/v1/products/:id
   */
  static async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      await ProductService.deleteProduct(id);

      Logger.info('Product deleted successfully', { productId: id });

      res.status(200).json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      Logger.error('Failed to delete product', error as Error);
      next(error);
    }
  }

  /**
   * Get product categories
   * GET /api/v1/products/categories
   */
  static async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await ProductService.getCategories();

      Logger.info('Categories fetched successfully', { count: categories.length });

      res.status(200).json({
        success: true,
        data: categories,
        message: 'Categories retrieved successfully'
      });
    } catch (error) {
      Logger.error('Failed to fetch categories', error as Error);
      next(error);
    }
  }

  /**
   * Get product brands
   * GET /api/v1/products/brands
   */
  static async getBrands(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const brands = await ProductService.getBrands();

      Logger.info('Brands fetched successfully', { count: brands.length });

      res.status(200).json({
        success: true,
        data: brands,
        message: 'Brands retrieved successfully'
      });
    } catch (error) {
      Logger.error('Failed to fetch brands', error as Error);
      next(error);
    }
  }

  /**
   * Get featured products
   * GET /api/v1/products/featured
   */
  static async getFeaturedProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 8;
      
      const products = await ProductService.getFeaturedProducts(limit);

      Logger.info('Featured products fetched successfully', { count: products.length });

      res.status(200).json({
        success: true,
        data: products,
        message: 'Featured products retrieved successfully'
      });
    } catch (error) {
      Logger.error('Failed to fetch featured products', error as Error);
      next(error);
    }
  }

  /**
   * Update product inventory (Staff/Admin only)
   * PUT /api/v1/products/:id/inventory
   */
  static async updateInventory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      if (typeof quantity !== 'number') {
        res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Quantity must be a number'
        });
        return;
      }

      await ProductService.updateInventory(id, quantity);

      Logger.info('Inventory updated successfully', { productId: id, quantity });

      res.status(200).json({
        success: true,
        message: 'Inventory updated successfully'
      });
    } catch (error) {
      Logger.error('Failed to update inventory', error as Error);
      next(error);
    }
  }
}

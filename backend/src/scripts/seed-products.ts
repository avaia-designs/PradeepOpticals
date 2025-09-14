#!/usr/bin/env bun

/**
 * Database seeding script for products, categories, and brands
 * Usage: bun run src/scripts/seed-products.ts
 */

import { database } from '../utils/database';
import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { Brand } from '../models/Brand';
import { Logger } from '../utils/logger';

interface SeedProduct {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  categorySlug: string;
  brandSlug: string;
  images: string[];
  inventory: number;
  sku: string;
  specifications: {
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
  tags: string[];
  isActive: boolean;
  featured: boolean;
  rating?: number;
  reviewCount: number;
  discountPercentage?: number;
}

const CATEGORIES = [
  { name: 'Eyeglasses', slug: 'eyeglasses', description: 'Prescription eyeglasses for vision correction' },
  { name: 'Sunglasses', slug: 'sunglasses', description: 'UV protection sunglasses for outdoor activities' },
  { name: 'Reading Glasses', slug: 'reading-glasses', description: 'Magnifying glasses for reading and close work' },
  { name: 'Computer Glasses', slug: 'computer-glasses', description: 'Blue light blocking glasses for digital screens' },
  { name: 'Progressive Lenses', slug: 'progressive-lenses', description: 'Multifocal lenses for all distances' },
  { name: 'Contact Lenses', slug: 'contact-lenses', description: 'Daily and monthly contact lenses' }
];

const BRANDS = [
  { name: 'Ray-Ban', slug: 'ray-ban', description: 'Iconic eyewear brand known for quality and style' },
  { name: 'Oakley', slug: 'oakley', description: 'Performance eyewear for sports and outdoor activities' },
  { name: 'Gucci', slug: 'gucci', description: 'Luxury fashion eyewear with Italian craftsmanship' },
  { name: 'Prada', slug: 'prada', description: 'High-end designer eyewear with modern aesthetics' },
  { name: 'Tom Ford', slug: 'tom-ford', description: 'Sophisticated eyewear for the modern professional' },
  { name: 'Persol', slug: 'persol', description: 'Italian luxury eyewear with timeless design' },
  { name: 'Maui Jim', slug: 'maui-jim', description: 'Premium sunglasses with superior lens technology' },
  { name: 'Warby Parker', slug: 'warby-parker', description: 'Affordable, stylish eyewear with a social mission' }
];

const PRODUCTS: SeedProduct[] = [
  // Eyeglasses
  {
    name: 'Classic Black Eyeglasses',
    description: 'Timeless black acetate eyeglasses with a modern rectangular frame. Perfect for everyday wear and professional settings.',
    price: 199.99,
    originalPrice: 249.99,
    categorySlug: 'eyeglasses',
    brandSlug: 'ray-ban',
    images: [
      'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&h=600&fit=crop'
    ],
    inventory: 25,
    sku: 'RB-EG-001',
    specifications: {
      material: 'Acetate',
      color: 'Black',
      size: 'Medium',
      weight: 18,
      dimensions: { width: 140, height: 50, depth: 20 }
    },
    tags: ['classic', 'black', 'rectangular', 'acetate'],
    isActive: true,
    featured: true,
    rating: 4.5,
    reviewCount: 128,
    discountPercentage: 20
  },
  {
    name: 'Tortoise Shell Eyeglasses',
    description: 'Elegant tortoise shell pattern eyeglasses with a vintage-inspired round frame. Adds sophistication to any look.',
    price: 179.99,
    categorySlug: 'eyeglasses',
    brandSlug: 'warby-parker',
    images: [
      'https://images.unsplash.com/photo-1506629905607-0a5b5b5b5b5b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506629905607-0a5b5b5b5b5b?w=800&h=600&fit=crop'
    ],
    inventory: 18,
    sku: 'WP-EG-002',
    specifications: {
      material: 'Acetate',
      color: 'Tortoise Shell',
      size: 'Large',
      weight: 20,
      dimensions: { width: 145, height: 52, depth: 22 }
    },
    tags: ['tortoise', 'round', 'vintage', 'elegant'],
    isActive: true,
    featured: false,
    rating: 4.2,
    reviewCount: 89
  },
  {
    name: 'Blue Light Blocking Glasses',
    description: 'Modern blue light filtering glasses designed to reduce eye strain from digital screens. Clear lenses with subtle blue tint.',
    price: 89.99,
    categorySlug: 'computer-glasses',
    brandSlug: 'warby-parker',
    images: [
      'https://images.unsplash.com/photo-1556306535-38febf6782e7?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1556306535-38febf6782e7?w=800&h=600&fit=crop'
    ],
    inventory: 35,
    sku: 'WP-CG-003',
    specifications: {
      material: 'TR90',
      color: 'Clear',
      size: 'Medium',
      weight: 15,
      dimensions: { width: 138, height: 48, depth: 18 }
    },
    tags: ['blue-light', 'computer', 'digital', 'strain-reduction'],
    isActive: true,
    featured: true,
    rating: 4.7,
    reviewCount: 156
  },
  // Sunglasses
  {
    name: 'Aviator Sunglasses',
    description: 'Classic aviator sunglasses with gradient lenses and metal frame. Perfect for outdoor activities and driving.',
    price: 299.99,
    originalPrice: 399.99,
    categorySlug: 'sunglasses',
    brandSlug: 'ray-ban',
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&h=600&fit=crop'
    ],
    inventory: 22,
    sku: 'RB-SG-004',
    specifications: {
      material: 'Metal',
      color: 'Gold',
      size: 'Large',
      weight: 25,
      dimensions: { width: 150, height: 55, depth: 15 }
    },
    tags: ['aviator', 'sunglasses', 'gradient', 'metal'],
    isActive: true,
    featured: true,
    rating: 4.8,
    reviewCount: 203,
    discountPercentage: 25
  },
  {
    name: 'Sport Sunglasses',
    description: 'High-performance sport sunglasses with polarized lenses and wrap-around design. Ideal for cycling, running, and outdoor sports.',
    price: 199.99,
    categorySlug: 'sunglasses',
    brandSlug: 'oakley',
    images: [
      'https://images.unsplash.com/photo-1556306535-38febf6782e7?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506629905607-0a5b5b5b5b5b?w=800&h=600&fit=crop'
    ],
    inventory: 30,
    sku: 'OK-SG-005',
    specifications: {
      material: 'O-Matter',
      color: 'Black',
      size: 'One Size',
      weight: 22,
      dimensions: { width: 155, height: 60, depth: 12 }
    },
    tags: ['sport', 'polarized', 'wrap-around', 'performance'],
    isActive: true,
    featured: false,
    rating: 4.6,
    reviewCount: 142
  },
  {
    name: 'Luxury Designer Sunglasses',
    description: 'Exquisite designer sunglasses with crystal accents and premium materials. A statement piece for the fashion-conscious.',
    price: 899.99,
    categorySlug: 'sunglasses',
    brandSlug: 'gucci',
    images: [
      'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&h=600&fit=crop'
    ],
    inventory: 8,
    sku: 'GC-SG-006',
    specifications: {
      material: 'Acetate & Metal',
      color: 'Black & Gold',
      size: 'Medium',
      weight: 28,
      dimensions: { width: 145, height: 50, depth: 18 }
    },
    tags: ['luxury', 'designer', 'crystal', 'premium'],
    isActive: true,
    featured: true,
    rating: 4.9,
    reviewCount: 67
  },
  // Reading Glasses
  {
    name: 'Classic Reading Glasses',
    description: 'Traditional reading glasses with magnification +1.50. Perfect for reading books, newspapers, and small print.',
    price: 49.99,
    categorySlug: 'reading-glasses',
    brandSlug: 'warby-parker',
    images: [
      'https://images.unsplash.com/photo-1506629905607-0a5b5b5b5b5b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1556306535-38febf6782e7?w=800&h=600&fit=crop'
    ],
    inventory: 50,
    sku: 'WP-RG-007',
    specifications: {
      material: 'Acetate',
      color: 'Tortoise',
      size: 'Medium',
      weight: 12,
      dimensions: { width: 135, height: 45, depth: 15 }
    },
    tags: ['reading', 'magnification', 'traditional', 'comfortable'],
    isActive: true,
    featured: false,
    rating: 4.3,
    reviewCount: 95
  },
  {
    name: 'Fashion Reading Glasses',
    description: 'Stylish reading glasses with a modern cat-eye frame. Combines functionality with fashion-forward design.',
    price: 79.99,
    categorySlug: 'reading-glasses',
    brandSlug: 'tom-ford',
    images: [
      'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&h=600&fit=crop'
    ],
    inventory: 28,
    sku: 'TF-RG-008',
    specifications: {
      material: 'Acetate',
      color: 'Rose Gold',
      size: 'Medium',
      weight: 16,
      dimensions: { width: 140, height: 48, depth: 18 }
    },
    tags: ['fashion', 'cat-eye', 'modern', 'stylish'],
    isActive: true,
    featured: true,
    rating: 4.5,
    reviewCount: 78
  },
  // Progressive Lenses
  {
    name: 'Progressive Lens Eyeglasses',
    description: 'Advanced progressive lens eyeglasses that provide clear vision at all distances. No more switching between multiple pairs.',
    price: 399.99,
    originalPrice: 499.99,
    categorySlug: 'progressive-lenses',
    brandSlug: 'persol',
    images: [
      'https://images.unsplash.com/photo-1506629905607-0a5b5b5b5b5b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1556306535-38febf6782e7?w=800&h=600&fit=crop'
    ],
    inventory: 15,
    sku: 'PS-PL-009',
    specifications: {
      material: 'Titanium',
      color: 'Silver',
      size: 'Large',
      weight: 20,
      dimensions: { width: 148, height: 52, depth: 20 }
    },
    tags: ['progressive', 'multifocal', 'titanium', 'premium'],
    isActive: true,
    featured: true,
    rating: 4.7,
    reviewCount: 112,
    discountPercentage: 20
  },
  // Contact Lenses
  {
    name: 'Daily Contact Lenses (30 Pack)',
    description: 'Comfortable daily disposable contact lenses with UV protection. Perfect for all-day wear with excellent breathability.',
    price: 59.99,
    categorySlug: 'contact-lenses',
    brandSlug: 'warby-parker',
    images: [
      'https://images.unsplash.com/photo-1556306535-38febf6782e7?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506629905607-0a5b5b5b5b5b?w=800&h=600&fit=crop'
    ],
    inventory: 100,
    sku: 'WP-CL-010',
    specifications: {
      material: 'Silicone Hydrogel',
      color: 'Clear',
      size: 'Standard',
      weight: 0.1
    },
    tags: ['daily', 'disposable', 'uv-protection', 'comfortable'],
    isActive: true,
    featured: false,
    rating: 4.4,
    reviewCount: 234
  }
];

/**
 * Create categories
 */
async function createCategories(): Promise<Map<string, string>> {
  const categoryMap = new Map<string, string>();
  
  for (const categoryData of CATEGORIES) {
    try {
      const existingCategory = await Category.findOne({ slug: categoryData.slug });
      if (existingCategory) {
        categoryMap.set(categoryData.slug, existingCategory._id.toString());
        Logger.info('Category already exists', { name: categoryData.name });
        continue;
      }

      const category = new Category(categoryData);
      await category.save();
      categoryMap.set(categoryData.slug, category._id.toString());
      
      Logger.info('Category created', { name: categoryData.name, id: category._id });
    } catch (error) {
      Logger.error('Failed to create category', error as Error, { name: categoryData.name });
    }
  }
  
  return categoryMap;
}

/**
 * Create brands
 */
async function createBrands(): Promise<Map<string, string>> {
  const brandMap = new Map<string, string>();
  
  for (const brandData of BRANDS) {
    try {
      const existingBrand = await Brand.findOne({ slug: brandData.slug });
      if (existingBrand) {
        brandMap.set(brandData.slug, existingBrand._id.toString());
        Logger.info('Brand already exists', { name: brandData.name });
        continue;
      }

      const brand = new Brand(brandData);
      await brand.save();
      brandMap.set(brandData.slug, brand._id.toString());
      
      Logger.info('Brand created', { name: brandData.name, id: brand._id });
    } catch (error) {
      Logger.error('Failed to create brand', error as Error, { name: brandData.name });
    }
  }
  
  return brandMap;
}

/**
 * Create products
 */
async function createProducts(categoryMap: Map<string, string>, brandMap: Map<string, string>): Promise<void> {
  for (const productData of PRODUCTS) {
    try {
      const existingProduct = await Product.findOne({ sku: productData.sku });
      if (existingProduct) {
        Logger.info('Product already exists', { sku: productData.sku });
        continue;
      }

      const categoryId = categoryMap.get(productData.categorySlug);
      const brandId = brandMap.get(productData.brandSlug);

      if (!categoryId || !brandId) {
        Logger.error('Category or brand not found', undefined, { 
          category: productData.categorySlug, 
          brand: productData.brandSlug 
        });
        continue;
      }

      const { categorySlug, brandSlug, ...productDataWithoutRefs } = productData;
      
      const product = new Product({
        ...productDataWithoutRefs,
        category: categoryId,
        brand: brandId
      });

      await product.save();
      Logger.info('Product created', { 
        name: productData.name, 
        sku: productData.sku,
        id: product._id 
      });
    } catch (error) {
      Logger.error('Failed to create product', error as Error, { sku: productData.sku });
    }
  }
}

/**
 * Main seeding function
 */
async function seedProducts(): Promise<void> {
  try {
    console.log('🌱 Starting product seeding...');
    
    // Connect to database
    await database.connect();
    console.log('📊 Connected to database');

    // Create categories
    console.log('📂 Creating categories...');
    const categoryMap = await createCategories();
    console.log(`✅ Created ${categoryMap.size} categories`);

    // Create brands
    console.log('🏷️ Creating brands...');
    const brandMap = await createBrands();
    console.log(`✅ Created ${brandMap.size} brands`);

    // Create products
    console.log('🛍️ Creating products...');
    await createProducts(categoryMap, brandMap);
    console.log(`✅ Created ${PRODUCTS.length} products`);

    console.log('🎉 Product seeding completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   Categories: ${categoryMap.size}`);
    console.log(`   Brands: ${brandMap.size}`);
    console.log(`   Products: ${PRODUCTS.length}`);
    console.log('');

  } catch (error) {
    Logger.error('Product seeding failed', error as Error);
    console.error('❌ Product seeding failed:', error);
    process.exit(1);
  } finally {
    // Disconnect from database
    await database.disconnect();
    console.log('📊 Disconnected from database');
    process.exit(0);
  }
}

// Run the seeding script
if (import.meta.main) {
  seedProducts().catch((error) => {
    console.error('💥 Seeding script failed:', error);
    process.exit(1);
  });
}

export { seedProducts, createCategories, createBrands, createProducts };

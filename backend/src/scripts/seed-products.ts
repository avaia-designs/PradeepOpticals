#!/usr/bin/env bun

/**
 * Database seeding script for categories and brands
 * Usage: bun run src/scripts/seed-products.ts
 */

import { database } from '../utils/database';
import { Category } from '../models/Category';
import { Brand } from '../models/Brand';
import { Logger } from '../utils/logger';

const CATEGORIES = [
  { 
    name: 'Eyeglasses', 
    slug: 'eyeglasses', 
    description: 'Prescription eyeglasses for vision correction',
    image: null,
    isActive: true,
    parentCategory: null,
    productCount: 0
  },
  { 
    name: 'Sunglasses', 
    slug: 'sunglasses', 
    description: 'UV protection sunglasses for outdoor activities',
    image: null,
    isActive: true,
    parentCategory: null,
    productCount: 0
  },
  { 
    name: 'Reading Glasses', 
    slug: 'reading-glasses', 
    description: 'Magnifying glasses for reading and close work',
    image: null,
    isActive: true,
    parentCategory: null,
    productCount: 0
  },
  { 
    name: 'Computer Glasses', 
    slug: 'computer-glasses', 
    description: 'Blue light blocking glasses for digital screens',
    image: null,
    isActive: true,
    parentCategory: null,
    productCount: 0
  },
  { 
    name: 'Progressive Lenses', 
    slug: 'progressive-lenses', 
    description: 'Multifocal lenses for all distances',
    image: null,
    isActive: true,
    parentCategory: null,
    productCount: 0
  },
  { 
    name: 'Contact Lenses', 
    slug: 'contact-lenses', 
    description: 'Daily and monthly contact lenses',
    image: null,
    isActive: true,
    parentCategory: null,
    productCount: 0
  }
];

const BRANDS = [
  { 
    name: 'Ray-Ban', 
    slug: 'ray-ban', 
    description: 'Iconic eyewear brand known for quality and style',
    logo: null,
    website: 'https://www.ray-ban.com',
    isActive: true,
    productCount: 0,
    country: 'Italy',
    establishedYear: 1936
  },
  { 
    name: 'Oakley', 
    slug: 'oakley', 
    description: 'Performance eyewear for sports and outdoor activities',
    logo: null,
    website: 'https://www.oakley.com',
    isActive: true,
    productCount: 0,
    country: 'United States',
    establishedYear: 1975
  },
  { 
    name: 'Gucci', 
    slug: 'gucci', 
    description: 'Luxury fashion eyewear with Italian craftsmanship',
    logo: null,
    website: 'https://www.gucci.com',
    isActive: true,
    productCount: 0,
    country: 'Italy',
    establishedYear: 1921
  },
  { 
    name: 'Prada', 
    slug: 'prada', 
    description: 'High-end designer eyewear with modern aesthetics',
    logo: null,
    website: 'https://www.prada.com',
    isActive: true,
    productCount: 0,
    country: 'Italy',
    establishedYear: 1913
  },
  { 
    name: 'Tom Ford', 
    slug: 'tom-ford', 
    description: 'Sophisticated eyewear for the modern professional',
    logo: null,
    website: 'https://www.tomford.com',
    isActive: true,
    productCount: 0,
    country: 'United States',
    establishedYear: 2005
  },
  { 
    name: 'Persol', 
    slug: 'persol', 
    description: 'Italian luxury eyewear with timeless design',
    logo: null,
    website: 'https://www.persol.com',
    isActive: true,
    productCount: 0,
    country: 'Italy',
    establishedYear: 1917
  },
  { 
    name: 'Maui Jim', 
    slug: 'maui-jim', 
    description: 'Premium sunglasses with superior lens technology',
    logo: null,
    website: 'https://www.mauijim.com',
    isActive: true,
    productCount: 0,
    country: 'United States',
    establishedYear: 1980
  },
  { 
    name: 'Warby Parker', 
    slug: 'warby-parker', 
    description: 'Affordable, stylish eyewear with a social mission',
    logo: null,
    website: 'https://www.warbyparker.com',
    isActive: true,
    productCount: 0,
    country: 'United States',
    establishedYear: 2010
  }
];

// No products to seed - only categories and brands

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

// No product creation needed

/**
 * Main seeding function
 */
async function seedCategoriesAndBrands(): Promise<void> {
  try {
    console.log('🌱 Starting categories and brands seeding...');
    
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

    console.log('🎉 Categories and brands seeding completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   Categories: ${categoryMap.size}`);
    console.log(`   Brands: ${brandMap.size}`);
    console.log('');

  } catch (error) {
    Logger.error('Categories and brands seeding failed', error as Error);
    console.error('❌ Categories and brands seeding failed:', error);
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
  seedCategoriesAndBrands().catch((error) => {
    console.error('💥 Seeding script failed:', error);
    process.exit(1);
  });
}

export { seedCategoriesAndBrands, createCategories, createBrands };

// Base Entity Interface
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// User Types
export interface User extends BaseEntity {
  email: string;
  name: string;
  role: UserRole;
  profile: UserProfile;
  isActive: boolean;
  lastLoginAt?: Date;
}

export interface UserProfile {
  avatar?: string;
  phone?: string;
  dateOfBirth?: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: NotificationSettings;
  language: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
}

export type UserRole = 'user' | 'admin' | 'moderator';

// Product Types
export interface Product extends BaseEntity {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  images: ProductImage[];
  category: Category;
  subcategory?: string;
  brand: string;
  sku: string;
  inventory: number;
  rating: number;
  reviewCount: number;
  variants: ProductVariant[];
  specifications: ProductSpecification[];
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  weight?: number;
  dimensions?: ProductDimensions;
  warranty?: string;
  returnPolicy?: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  price?: number;
  sku?: string;
  inventory: number;
  attributes: Record<string, string>;
}

export interface ProductSpecification {
  name: string;
  value: string;
  unit?: string;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'in';
}

// Category Types
export interface Category extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentCategory?: Category;
  childCategories: Category[];
  productCount: number;
  isActive: boolean;
  order: number;
}

// Cart Types
export interface CartItem extends BaseEntity {
  productId: string;
  product: Pick<Product, 'id' | 'name' | 'price' | 'imageUrl' | 'sku'>;
  quantity: number;
  selectedVariant?: ProductVariant;
  unitPrice: number;
  totalPrice: number;
}

export interface Cart extends BaseEntity {
  userId: string;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
}

// Order Types
export interface Order extends BaseEntity {
  orderNumber: string;
  userId: string;
  user: Pick<User, 'id' | 'name' | 'email'>;
  items: OrderItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: PaymentMethod;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  notes?: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  deliveredAt?: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Pick<Product, 'id' | 'name' | 'imageUrl' | 'sku'>;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selectedVariant?: ProductVariant;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

// Address Types
export interface Address {
  id: string;
  type: 'shipping' | 'billing';
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

// Payment Types
export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'paypal' | 'apple_pay' | 'google_pay' | 'bank_transfer';
  provider: string;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

// Review Types
export interface Review extends BaseEntity {
  productId: string;
  userId: string;
  user: Pick<User, 'id' | 'name' | 'profile'>;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  isVerified: boolean;
  helpful: number;
  notHelpful: number;
  response?: ReviewResponse;
}

export interface ReviewResponse {
  id: string;
  comment: string;
  respondedAt: Date;
  respondedBy: string;
}

// Wishlist Types
export interface WishlistItem extends BaseEntity {
  userId: string;
  productId: string;
  product: Pick<Product, 'id' | 'name' | 'price' | 'imageUrl' | 'isActive'>;
}

// Search and Filter Types
export interface ProductFilters {
  category?: string;
  subcategory?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  search?: string;
  sortBy?: ProductSortBy;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export type ProductSortBy = 
  | 'name'
  | 'price'
  | 'rating'
  | 'createdAt'
  | 'popularity';

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  meta?: {
    pagination?: PaginationMeta;
    timestamp?: string;
  };
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
  details?: Record<string, any>;
  stack?: string;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  shippingAddress: AddressFormData;
  billingAddress: AddressFormData;
  paymentMethod: PaymentMethodFormData;
  notes?: string;
}

export interface AddressFormData {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface PaymentMethodFormData {
  type: 'credit_card' | 'paypal' | 'apple_pay';
  cardNumber?: string;
  expiryMonth?: number;
  expiryYear?: number;
  cvv?: string;
  nameOnCard?: string;
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface SearchState {
  query: string;
  suggestions: string[];
  recentSearches: string[];
  isOpen: boolean;
}

export interface FilterState {
  filters: ProductFilters;
  isOpen: boolean;
  appliedCount: number;
}

// Theme Types
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  accentColor: string;
}

// Analytics Types
export interface AnalyticsEvent {
  name: string;
  properties: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId: string;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  action?: {
    label: string;
    url: string;
  };
  isRead: boolean;
  createdAt: Date;
}

// SEO Types
export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
}

// Component Props Types
export interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string, quantity?: number) => void;
  onAddToWishlist: (productId: string) => void;
  onQuickView: (productId: string) => void;
  isLoading?: boolean;
  className?: string;
}

export interface CartItemProps {
  item: CartItem;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  onMoveToWishlist: (itemId: string) => void;
}

export interface LayoutProps {
  children: React.ReactNode;
  seo?: SEOData;
  className?: string;
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

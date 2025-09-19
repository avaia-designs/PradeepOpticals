// User types
export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'user' | 'staff' | 'admin';
  profile: {
    avatar?: string;
    phone?: string;
    dateOfBirth?: string;
  };
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthResponse {
  user: {
    _id: string;
    email: string;
    name: string;
    role: 'user' | 'staff' | 'admin';
    profile: {
      avatar?: string;
      phone?: string;
      dateOfBirth?: string;
    };
    isActive: boolean;
    createdAt: string;
  };
  token: string;
}

// Product types
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: {
    _id: string;
    name: string;
  };
  brand?: {
    _id: string;
    name: string;
  };
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
  createdAt: string;
  modifiedAt: string;
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  inStock?: boolean;
  search?: string;
  sortBy?: 'name' | 'price' | 'rating' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// Cart types
export interface CartItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specifications?: {
    material?: string;
    color?: string;
    size?: string;
  };
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  totalAmount: number;
  itemCount: number;
}

// Order types
export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specifications?: {
    material?: string;
    color?: string;
    size?: string;
  };
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  notes?: string;
  prescriptionFile?: string;
  isWalkIn: boolean;
  staffId?: string;
  createdAt: string;
  modifiedAt: string;
}

// Appointment types
export interface Appointment {
  _id: string;
  appointmentNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  reason: string;
  notes?: string;
  staffId?: string;
  confirmedAt?: string;
  cancelledAt?: string;
  cancelledReason?: string;
  completedAt?: string;
  createdAt: string;
  modifiedAt: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

// Pagination types
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface ProfileUpdateForm {
  name: string;
  phone?: string;
  dateOfBirth?: string;
}

export interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
}

export interface CheckoutForm {
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  notes?: string;
  prescriptionFile?: File;
}

export interface AppointmentForm {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  reason: string;
  notes?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  meta?: {
    pagination?: PaginationMeta;
  };
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
  details?: Record<string, any>;
}
# Frontend Documentation - Pradeep Opticals

## Overview

The frontend is a Next.js 14+ application built with TypeScript, Tailwind CSS, and Shadcn/ui components. It provides a modern, responsive e-commerce experience for the Pradeep Opticals eyewear store.

## Architecture

### Framework: Next.js 14+ with App Router
- **File-based routing** with App Router
- **Server Components** by default, Client Components when needed
- **Server-side rendering (SSR)** for SEO and performance
- **Static site generation (SSG)** for static pages
- **API routes** for backend integration

### Styling: Tailwind CSS v4
- **Utility-first CSS framework**
- **OKLCH color space** for modern color handling
- **Custom design system** with consistent spacing and typography
- **Light theme only** (no dark mode)
- **Responsive design** with mobile-first approach

### UI Components: Shadcn/ui
- **Radix UI primitives** for accessibility
- **Consistent design system** across all components
- **Customizable** with Tailwind CSS
- **TypeScript support** with proper type definitions

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication route group
│   │   ├── (dashboard)/       # Dashboard route group
│   │   ├── globals.css        # Global styles and theme
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Homepage
│   │   └── products/          # Product pages
│   ├── components/            # React components
│   │   ├── ui/               # Shadcn/ui components
│   │   ├── layout/           # Layout components
│   │   └── products/         # Product-specific components
│   ├── lib/                  # Utilities and services
│   │   ├── services/         # API service functions
│   │   ├── utils.ts          # Utility functions
│   │   └── api-client.ts     # Axios configuration
│   ├── hooks/                # Custom React hooks
│   ├── stores/               # Zustand state stores
│   └── types/                # TypeScript interfaces
├── public/                   # Static assets
├── package.json             # Dependencies and scripts
├── tailwind.config.js       # Tailwind configuration
├── next.config.ts           # Next.js configuration
└── tsconfig.json            # TypeScript configuration
```

## Key Components

### Layout Components

#### Header (`src/components/layout/header.tsx`)
- **Top bar** with contact information and promotions
- **Main navigation** with dropdown menus
- **Search bar** with real-time suggestions
- **User actions** (cart, wishlist, account)
- **Mobile menu** with responsive design
- **Logo** with Montserrat font in column layout

#### Footer (`src/components/layout/footer.tsx`)
- **Company information** and links
- **Product categories** and quick links
- **Social media** and contact details
- **Legal links** and policies

#### Main Layout (`src/components/layout/main-layout.tsx`)
- **Query client** configuration for TanStack Query
- **Toast notifications** setup
- **Global providers** and context

### Product Components

#### Product Grid (`src/components/products/product-grid.tsx`)
- **Responsive grid** layout for products
- **Loading states** with skeleton components
- **Error handling** with retry functionality
- **Pagination** support

#### Product Card (`src/components/products/product-card.tsx`)
- **Product image** with hover zoom effect
- **Product information** (name, price, rating)
- **Add to cart** and wishlist actions
- **Stock status** and availability
- **Responsive design** for all screen sizes

#### Product Filters (`src/components/products/product-filters.tsx`)
- **Category filters** with checkboxes
- **Price range** slider
- **Brand filters** with search
- **Availability** and rating filters
- **Collapsible** sections for mobile

### UI Components (Shadcn/ui)

All UI components are installed via Shadcn CLI and follow the established design system:

- **Button** - Various variants and sizes
- **Input** - Form inputs with validation
- **Card** - Content containers
- **Badge** - Status indicators
- **Avatar** - User profile images
- **Dropdown Menu** - Context menus
- **Sheet** - Mobile navigation drawer
- **Separator** - Visual dividers
- **Skeleton** - Loading placeholders
- **Select** - Dropdown selections
- **Checkbox** - Form checkboxes
- **Slider** - Range inputs
- **Alert** - Notifications and messages

## State Management

### Zustand Stores

#### Cart Store (`src/stores/cart-store.ts`)
```typescript
interface CartState {
  items: CartItem[];
  total: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  loadCart: () => Promise<void>;
}
```

#### User Store (`src/stores/user-store.ts`)
```typescript
interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  loadUser: () => Promise<void>;
}
```

### TanStack Query

#### Product Hooks (`src/hooks/use-products.ts`)
- **useProducts** - Fetch products with filters
- **useProduct** - Fetch single product
- **useProductSuggestions** - Search suggestions
- **Caching** - Intelligent data caching
- **Background updates** - Automatic data refresh

## API Integration

### API Client (`src/lib/api-client.ts`)
- **Axios** configuration with interceptors
- **Base URL** configuration
- **Authentication** token handling
- **Error handling** with retry logic
- **Request/Response** logging

### Service Layer (`src/lib/services/`)
- **Product Service** - Product-related API calls
- **Cart Service** - Cart management API calls
- **User Service** - Authentication and user API calls
- **Type-safe** API responses
- **Error handling** with proper error types

## Styling System

### Tailwind CSS v4 Configuration

#### Color Palette (OKLCH)
```css
@theme {
  --color-background: oklch(1 0 0);           /* Pure white */
  --color-foreground: oklch(0.15 0.005 296.79); /* Dark gray */
  --color-primary: oklch(0.55 0.22 264.05);   /* Bright blue */
  --color-secondary: oklch(0.96 0.01 296.79); /* Light gray */
  --color-muted: oklch(0.96 0.01 296.79);     /* Muted gray */
  --color-border: oklch(0.89 0.01 296.79);    /* Border gray */
}
```

#### Typography
- **Body Text**: Inter font family
- **Headings**: Montserrat font family
- **Logo**: Montserrat with custom styling
- **Font Loading**: Optimized with Next.js font optimization

#### Responsive Design
- **Mobile First**: Base styles for mobile devices
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Grid System**: CSS Grid and Flexbox
- **Spacing**: Consistent spacing scale (4, 8, 16, 24, 32px)

### Custom Utilities

#### Glass Effect
```css
.glass-effect {
  background-color: oklch(from white l c h / 0.9);
  backdrop-filter: blur(8px);
  border: 1px solid oklch(from white l c h / 0.3);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}
```

#### Gradient Text
```css
.gradient-text {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}
```

## Type Definitions

### Core Types (`src/types/index.ts`)

#### Product Types
```typescript
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  images: string[];
  category: Category;
  brand: Brand;
  inStock: boolean;
  stockQuantity: number;
  rating: number;
  reviewCount: number;
  variants: ProductVariant[];
  specifications: ProductSpecification[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### User Types
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  profile: {
    avatar?: string;
    phone?: string;
    dateOfBirth?: Date;
  };
  addresses: Address[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Cart Types
```typescript
interface CartItem {
  id: string;
  productId: string;
  product: Pick<Product, 'name' | 'price' | 'imageUrl'>;
  quantity: number;
  selectedVariant?: ProductVariant;
  addedAt: Date;
}
```

## Performance Optimizations

### Next.js Optimizations
- **Image Optimization**: Next.js Image component with lazy loading
- **Font Optimization**: Next.js font optimization for Inter and Montserrat
- **Code Splitting**: Automatic route-based code splitting
- **Bundle Analysis**: Webpack bundle analyzer for optimization

### React Optimizations
- **Memoization**: React.memo for expensive components
- **Callback Optimization**: useCallback for event handlers
- **State Optimization**: Minimal re-renders with proper state structure
- **Lazy Loading**: Dynamic imports for heavy components

### Caching Strategy
- **TanStack Query**: Intelligent data caching with stale-while-revalidate
- **Local Storage**: Persistent cart and user preferences
- **Service Worker**: Future PWA implementation
- **CDN**: Static asset delivery optimization

## Development Workflow

### Scripts
```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "type-check": "tsc --noEmit",
  "test": "jest",
  "test:watch": "jest --watch"
}
```

### Code Quality
- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended rules
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks
- **Lint-staged**: Staged file linting

### Testing Strategy
- **Unit Tests**: Component testing with React Testing Library
- **Integration Tests**: API integration testing
- **E2E Tests**: User flow testing (planned)
- **Visual Regression**: Component visual testing (planned)

## Deployment

### Build Process
1. **Type Checking**: TypeScript compilation
2. **Linting**: ESLint validation
3. **Testing**: Jest test suite
4. **Building**: Next.js production build
5. **Optimization**: Image and asset optimization

### Environment Variables
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_TOKEN_STORAGE_KEY=ecommerce_auth_token
NEXT_PUBLIC_USER_STORAGE_KEY=ecommerce_user_data
NEXT_PUBLIC_MAX_FILE_SIZE=5242880
NEXT_PUBLIC_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp
```

### Production Considerations
- **Environment Variables**: Secure configuration
- **CDN**: Static asset delivery
- **Monitoring**: Error tracking and performance
- **Security**: Content Security Policy
- **SEO**: Meta tags and structured data

## Accessibility

### WCAG Compliance
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: Proper ARIA labels and roles
- **Color Contrast**: WCAG AA compliance
- **Focus Management**: Visible focus indicators
- **Semantic HTML**: Proper HTML structure

### Testing Tools
- **axe-core**: Automated accessibility testing
- **Lighthouse**: Performance and accessibility audits
- **Screen Reader**: Manual testing with screen readers
- **Keyboard Only**: Navigation testing

## SEO Optimization

### Meta Tags
- **Title Tags**: Dynamic page titles
- **Meta Descriptions**: Compelling descriptions
- **Open Graph**: Social media sharing
- **Twitter Cards**: Twitter sharing optimization
- **Structured Data**: JSON-LD for search engines

### Performance
- **Core Web Vitals**: LCP, FID, CLS optimization
- **Page Speed**: Fast loading times
- **Mobile Friendly**: Mobile-first responsive design
- **Sitemap**: XML sitemap generation

## Future Enhancements

### Planned Features
- **PWA**: Progressive Web App capabilities
- **Offline Support**: Service worker implementation
- **Push Notifications**: User engagement features
- **Multi-language**: Internationalization
- **Advanced Search**: Elasticsearch integration
- **Recommendations**: AI-powered product suggestions

### Technical Improvements
- **Micro-frontends**: Modular architecture
- **GraphQL**: Alternative to REST API
- **Real-time**: WebSocket integration
- **Advanced Caching**: Redis integration
- **Performance**: Further optimization

---

*This documentation provides comprehensive information about the frontend architecture, components, and implementation details for AI LLMs to understand and work with the codebase effectively.*

# AI Context Documentation - Pradeep Opticals

## Project Overview for AI LLMs

This document provides essential context for AI Language Models working on the Pradeep Opticals e-commerce platform. It contains the most critical information needed to understand and contribute to the project effectively.

## Quick Reference

### Project Status
- **Frontend**: ✅ Complete (Next.js 14+, TypeScript, Tailwind CSS v4)
- **Backend**: 🔄 Ready for development (Express.js, TypeScript, Bun)
- **Database**: 🔄 Ready for implementation (MongoDB, Mongoose)
- **Documentation**: ✅ Complete

### Technology Stack
```
Frontend: Next.js 14+ + TypeScript + Tailwind CSS v4 + Shadcn/ui + Zustand + TanStack Query
Backend: Express.js + TypeScript + Bun + MongoDB + Mongoose + MinIO
Infrastructure: Docker + Docker Compose + Nginx
```

## Critical Architecture Rules

### 1. Backend Architecture (MANDATORY)
```
Request → Routes → Middleware → Controller → Validation → Service → Repository → Database
                                     ↓
Response ← Routes ← Middleware ← Controller ← Service ← Repository ← Database
```

**NEVER** skip layers or mix responsibilities.

### 2. Frontend Architecture (MANDATORY)
```
User Action → Component → Hook → Service → API → Store → UI Update
```

**ALWAYS** follow this data flow pattern.

### 3. TypeScript Rules (STRICT)
- **NO `any` types** - Use proper interfaces
- **Strict mode enabled** - All files must be type-safe
- **Interface definitions** - Define interfaces for all data structures
- **Type assertions** - Use proper type assertions when needed

### 4. Component Patterns (MANDATORY)
- **Shadcn/ui components** - Use CLI installation: `bunx shadcn@latest add <component>`
- **Atomic Design** - Atoms → Molecules → Organisms → Templates → Pages
- **Functional components** - Use React hooks, no class components
- **Props interfaces** - Define TypeScript interfaces for all props

## File Structure Quick Reference

### Frontend Structure
```
frontend/src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with fonts
│   ├── page.tsx           # Homepage
│   ├── globals.css        # Tailwind v4 + OKLCH colors
│   └── products/          # Product pages
├── components/
│   ├── ui/               # Shadcn/ui components (CLI installed)
│   ├── layout/           # Header, Footer, MainLayout
│   └── products/         # Product-specific components
├── lib/
│   ├── services/         # API service functions
│   ├── utils.ts          # Utility functions
│   └── api-client.ts     # Axios configuration
├── hooks/                # Custom React hooks
├── stores/               # Zustand state stores
└── types/                # TypeScript interfaces
```

### Backend Structure (To Be Implemented)
```
backend/src/
├── models/               # Mongoose schemas
├── routes/               # API route definitions
├── controllers/          # Request handlers
├── services/             # Business logic layer
├── repositories/         # Data access layer
├── middleware/           # Custom middleware
├── utils/                # Utility functions
└── types/                # TypeScript definitions
```

## Key Implementation Patterns

### 1. API Client Pattern
```typescript
// Always use this pattern for API calls
const response = await apiClient.get<ProductResponse>('/products');
const products = response.data;
```

### 2. State Management Pattern
```typescript
// Zustand store pattern
interface StoreState {
  data: T[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchData: () => Promise<void>;
  addItem: (item: T) => Promise<void>;
}
```

### 3. Component Pattern
```typescript
// Component with proper TypeScript
interface ComponentProps {
  data: DataType;
  onAction: (id: string) => void;
  loading?: boolean;
}

export const Component: React.FC<ComponentProps> = ({ 
  data, 
  onAction, 
  loading = false 
}) => {
  // Implementation
};
```

### 4. Service Pattern
```typescript
// Service layer pattern
export class DataService {
  async getData(id: string): Promise<DataType> {
    const response = await apiClient.get<DataType>(`/data/${id}`);
    return response.data;
  }
}
```

## Critical Configuration

### Environment Variables
```env
# Frontend (.env.local)
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_DEBUG_MODE=true

# Backend (.env)
MONGODB_URI=mongodb://localhost:27017/ecommerce_db
MINIO_ENDPOINT=localhost
JWT_SECRET=your-suprer-secret-jwt-key-here
```

### Package Management
```bash
# Frontend
npm install
npm run dev

# Backend
bun install
bun dev
```

### Docker Services
```bash
docker-compose up -d  # Start MongoDB, MinIO, Redis
```

## Common Patterns to Follow

### 1. Error Handling
```typescript
// Always handle errors properly
try {
  const result = await someAsyncOperation();
  return result;
} catch (error) {
  console.error('Operation failed:', error);
  throw new Error('User-friendly error message');
}
```

### 2. Loading States
```typescript
// Always show loading states
const { data, isLoading, error } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData
});

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
```

### 3. Type Safety
```typescript
// Always use proper types
interface User {
  id: string;
  email: string;
  name: string;
}

// Never use any
const user: User = response.data; // ✅ Good
const user: any = response.data;  // ❌ Bad
```

### 4. API Responses
```typescript
// Always use this response format
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  meta?: {
    pagination?: PaginationMeta;
  };
}
```

## Current Theme Configuration

### Light Theme Only
```css
/* OKLCH Color Space */
--color-background: oklch(1 0 0);           /* Pure white */
--color-foreground: oklch(0.15 0.005 296.79); /* Dark gray */
--color-primary: oklch(0.55 0.22 264.05);   /* Bright blue */
--color-secondary: oklch(0.96 0.01 296.79); /* Light gray */
```

### Typography
- **Body Text**: Inter font family
- **Headings**: Montserrat font family
- **Logo**: Montserrat in column layout

## Development Commands

### Frontend
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Backend (Ready to implement)
```bash
cd backend
bun dev              # Start development server
bun run build        # Build for production
bun test             # Run tests
```

### Shadcn/ui Components
```bash
# Always use CLI for component installation
bunx shadcn@latest add button
bunx shadcn@latest add input
bunx shadcn@latest add card
```

## Common Mistakes to Avoid

### 1. ❌ Don't Skip Architecture Layers
```typescript
// Wrong - Direct API call in component
const data = await fetch('/api/products');

// Correct - Use service layer
const data = await productService.getProducts();
```

### 2. ❌ Don't Use `any` Types
```typescript
// Wrong
const data: any = response.data;

// Correct
const data: Product[] = response.data;
```

### 3. ❌ Don't Create Components Manually
```bash
# Wrong - Manual component creation
# Creating button.tsx manually

# Correct - Use Shadcn CLI
bunx shadcn@latest add button
```

### 4. ❌ Don't Mix State Management
```typescript
// Wrong - Mixing useState with Zustand
const [localState, setLocalState] = useState();
const globalState = useStore();

// Correct - Use appropriate state management
const globalState = useStore(); // For global state
const [localState, setLocalState] = useState(); // For local UI state
```

## Quick Start Checklist

### When Starting New Features
1. ✅ Read the architecture documentation
2. ✅ Check existing patterns in the codebase
3. ✅ Define TypeScript interfaces first
4. ✅ Follow the established data flow
5. ✅ Use Shadcn/ui CLI for components
6. ✅ Implement proper error handling
7. ✅ Add loading states
8. ✅ Write tests (if applicable)

### When Debugging Issues
1. ✅ Check browser console for errors
2. ✅ Verify TypeScript types
3. ✅ Check network requests in DevTools
4. ✅ Verify environment variables
5. ✅ Check component props and state
6. ✅ Review API response format

## Key Files to Reference

### Frontend
- `frontend/src/app/layout.tsx` - Root layout and font configuration
- `frontend/src/app/globals.css` - Global styles and theme
- `frontend/src/components/layout/header.tsx` - Navigation component
- `frontend/src/stores/cart-store.ts` - Cart state management
- `frontend/src/lib/api-client.ts` - API client configuration

### Backend (To Be Implemented)
- `backend/src/index.ts` - Application entry point
- `backend/src/models/` - Database schemas
- `backend/src/routes/` - API route definitions
- `backend/src/services/` - Business logic layer

## Documentation References

- **Main Documentation**: `/docs/README.md`
- **Frontend Documentation**: `/docs/frontend/README.md`
- **Backend Documentation**: `/docs/backend/README.md`
- **API Documentation**: `/docs/api/README.md`
- **Architecture Documentation**: `/docs/architecture/README.md`
- **Testing Documentation**: `/docs/testing/README.md`
- **Deployment Documentation**: `/docs/deployment/README.md`

## Current Development Phase

### ✅ Completed
- Frontend architecture and components
- UI/UX design system
- State management setup
- API client configuration
- Documentation suite

### 🔄 Next Steps
- Backend API development
- Database schema implementation
- Authentication system
- File upload functionality
- API integration testing

---

*This AI context document provides the essential information needed for AI LLMs to understand and work effectively with the Pradeep Opticals e-commerce platform. Always refer to the detailed documentation in the `/docs` folder for comprehensive information.*

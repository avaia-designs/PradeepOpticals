# Pradeep Opticals E-commerce Documentation

## Project Overview

**Pradeep Opticals** is a modern e-commerce platform specializing in eyewear and optical products. The project follows a full-stack architecture with separate frontend and backend applications, designed for scalability, performance, and excellent user experience.

## Architecture Summary

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (Express.js)  │◄──►│   (MongoDB)     │
│   TypeScript    │    │   TypeScript    │    │   Mongoose      │
│   Tailwind CSS  │    │   Bun Runtime   │    │   MinIO Storage │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 with OKLCH color space
- **UI Components**: Shadcn/ui (Radix UI primitives)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query v5
- **HTTP Client**: Axios
- **Fonts**: Inter (body), Montserrat (headings/logo)
- **Theme**: Light theme only (no dark mode)

### Backend
- **Runtime**: Bun (high-performance JavaScript runtime)
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **File Storage**: MinIO (S3-compatible)
- **Authentication**: JWT-based
- **Architecture**: Layered (Routes → Middleware → Controller → Service → Repository)

### Infrastructure
- **Containerization**: Docker with Docker Compose
- **Database**: MongoDB 7
- **Object Storage**: MinIO
- **Caching**: Redis (optional)
- **Development**: Hot reload, TypeScript compilation

## Project Structure

```
pradeep-opticals/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/      # React components
│   │   ├── lib/            # Utilities and services
│   │   ├── hooks/          # Custom React hooks
│   │   ├── stores/         # Zustand state stores
│   │   └── types/          # TypeScript type definitions
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── backend/                 # Express.js backend API
│   ├── src/
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API route handlers
│   │   ├── controllers/    # Request controllers
│   │   ├── services/       # Business logic layer
│   │   ├── middleware/     # Custom middleware
│   │   └── utils/          # Utility functions
│   └── package.json        # Backend dependencies
├── docs/                   # Project documentation
├── docker-compose.yml      # Docker services configuration
└── README.md              # Main project documentation
```

## Key Features

### E-commerce Functionality
- Product catalog with categories (prescription glasses, sunglasses, reading glasses)
- Advanced product filtering and sorting
- Shopping cart with persistent state
- User authentication and profiles
- Order management system
- Wishlist functionality
- Search with suggestions
- Responsive design for all devices

### UI/UX Features
- Modern, clean light theme design
- Image zoom on hover for product images
- Smooth animations and transitions
- Mobile-first responsive design
- Accessibility compliance (WCAG AA)
- SEO optimization
- Performance optimization

### Technical Features
- Type-safe development with TypeScript
- Component-based architecture
- State management with Zustand
- Server-side rendering (SSR)
- Static site generation (SSG)
- API integration with error handling
- File upload with validation
- Real-time search suggestions

## Development Guidelines

### Code Quality
- **TypeScript**: Strict mode enabled, no `any` types allowed
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier for consistent code style
- **Testing**: Jest and React Testing Library
- **Architecture**: Follows established patterns and rules

### Component Architecture
- **Atomic Design**: Atoms → Molecules → Organisms → Templates → Pages
- **Shadcn/ui**: All UI components use Shadcn/ui primitives
- **Composition**: Components are composable and reusable
- **Props**: Well-defined TypeScript interfaces
- **State**: Local state for UI, global state for business logic

### Styling Guidelines
- **Tailwind CSS**: Utility-first approach
- **Design System**: Consistent spacing, colors, and typography
- **Responsive**: Mobile-first design approach
- **Accessibility**: Proper contrast ratios and semantic HTML
- **Performance**: Optimized images and minimal CSS

## API Integration

### Frontend API Client
- **Base URL**: `http://localhost:5000/api/v1`
- **Authentication**: JWT token in Authorization header
- **Error Handling**: Centralized error handling with user feedback
- **Caching**: TanStack Query for intelligent caching
- **Retry Logic**: Automatic retry for failed requests

### Backend API Structure
- **RESTful**: Standard HTTP methods and status codes
- **Versioning**: `/api/v1` prefix for API versioning
- **Middleware**: Authentication, validation, rate limiting
- **Response Format**: Consistent JSON response structure
- **Error Handling**: Proper error codes and messages

## State Management

### Frontend State
- **Zustand Stores**: Cart, user authentication, UI state
- **TanStack Query**: Server state caching and synchronization
- **Local Storage**: Persistent cart and user preferences
- **URL State**: Search filters and pagination

### Data Flow
```
User Action → Component → Hook → Service → API → Store → UI Update
```

## Deployment

### Development Environment
- **Docker Compose**: MongoDB, MinIO, Redis services
- **Hot Reload**: Frontend and backend development servers
- **Environment Variables**: Separate configs for dev/prod
- **Database Seeding**: Initial data for development

### Production Considerations
- **Environment Variables**: Secure configuration management
- **Database**: MongoDB Atlas or self-hosted
- **File Storage**: MinIO or AWS S3
- **CDN**: Static asset delivery
- **Monitoring**: Error tracking and performance monitoring

## Security

### Frontend Security
- **Input Validation**: Client-side validation with Zod
- **XSS Protection**: Proper data sanitization
- **CSRF Protection**: SameSite cookies
- **Content Security Policy**: Restricted resource loading

### Backend Security
- **Authentication**: JWT with secure token handling
- **Authorization**: Role-based access control
- **Input Validation**: Server-side validation with Joi
- **Rate Limiting**: API endpoint protection
- **CORS**: Configured for specific origins

## Performance

### Frontend Optimization
- **Next.js**: Built-in optimizations (Image, Font, Script)
- **Code Splitting**: Dynamic imports for route-based splitting
- **Caching**: TanStack Query for intelligent data caching
- **Images**: Optimized with Next.js Image component
- **Bundle Size**: Tree shaking and minimal dependencies

### Backend Optimization
- **Database**: Proper indexing and query optimization
- **Caching**: Redis for frequently accessed data
- **Compression**: Gzip compression for API responses
- **Connection Pooling**: Efficient database connections

## Monitoring and Analytics

### Error Tracking
- **Frontend**: Error boundaries and logging
- **Backend**: Centralized error logging
- **User Actions**: Track user interactions for analytics

### Performance Monitoring
- **Core Web Vitals**: LCP, FID, CLS tracking
- **API Performance**: Response time monitoring
- **Database Performance**: Query execution tracking

## Future Enhancements

### Planned Features
- **Payment Integration**: Stripe/PayPal integration
- **Inventory Management**: Real-time stock tracking
- **Customer Reviews**: Product review system
- **Recommendations**: AI-powered product recommendations
- **Multi-language**: Internationalization support
- **PWA**: Progressive Web App capabilities

### Technical Improvements
- **Microservices**: Break down monolithic backend
- **GraphQL**: Alternative to REST API
- **Real-time**: WebSocket integration
- **Testing**: Comprehensive test coverage
- **CI/CD**: Automated deployment pipeline

## Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Docker and Docker Compose
- Git

### Development Setup
1. Clone the repository
2. Copy environment files (`sample.env` → `.env`)
3. Start Docker services: `docker-compose up -d`
4. Install dependencies: `bun install` (backend), `npm install` (frontend)
5. Start development servers: `bun dev` (backend), `npm run dev` (frontend)

### Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MinIO Console**: http://localhost:9001
- **MongoDB**: localhost:27017

## Documentation Structure

- `README.md` - This overview document
- `frontend/` - Frontend-specific documentation
- `backend/` - Backend-specific documentation
- `api/` - API documentation and examples
- `deployment/` - Deployment guides and configurations
- `architecture/` - Detailed architecture documentation

---

*This documentation is optimized for AI LLMs to understand the project context, architecture, and implementation details.*

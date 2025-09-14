# Pradeep Opticals E-commerce Platform

## Project Overview

**Pradeep Opticals** is a modern e-commerce platform specializing in eyewear and optical products. The project follows a full-stack architecture with separate frontend and backend applications, designed for scalability, performance, and excellent user experience.

## Current Development Status

**Last Updated**: January 2024  
**Current Phase**: Frontend Development Complete  
**Next Phase**: Backend API Development  

### ✅ Completed
- **Frontend Architecture**: Next.js 14+, TypeScript, Tailwind CSS v4, Shadcn/ui
- **UI Component System**: Complete component library with proper CLI installation
- **State Management**: Zustand stores for cart and user authentication
- **Data Fetching**: TanStack Query v5 with intelligent caching
- **Styling System**: Light theme with OKLCH color space, Inter/Montserrat fonts
- **Responsive Design**: Mobile-first approach with modern UX patterns
- **Type Safety**: Comprehensive TypeScript interfaces throughout
- **Development Environment**: Docker services, environment configuration

### 🔄 Ready for Development
- **Backend API**: Express.js with TypeScript and Bun runtime
- **Database Models**: MongoDB with Mongoose schemas
- **Authentication System**: JWT-based auth with role-based access control
- **File Upload**: MinIO integration for product images
- **API Integration**: Connect frontend to backend APIs

## Architecture Overview

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

## Development Setup

### Prerequisites
- Node.js 18+ or Bun
- Docker and Docker Compose
- Git

### Quick Start
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

- **[Architecture Documentation](architecture/README.md)** - System architecture and design patterns
- **[Backend Documentation](backend/README.md)** - Backend implementation details
- **[Frontend Documentation](frontend/README.md)** - Frontend implementation details
- **[API Documentation](api/README.md)** - API endpoints and integration
- **[Deployment Documentation](deployment/README.md)** - Deployment guides
- **[Testing Documentation](testing/README.md)** - Testing strategy and implementation
- **[Functional Requirements](functional-requirements.md)** - Detailed feature requirements

## Next Steps

### Immediate Priorities
1. **Backend API Development**: Express.js server with TypeScript
2. **Database Schema**: MongoDB models with Mongoose
3. **Authentication System**: JWT-based auth with middleware
4. **File Upload**: MinIO integration for product images
5. **API Integration**: Connect frontend to backend APIs

### Medium-term Goals
1. **Payment Integration**: Stripe/PayPal for checkout
2. **Order Management**: Complete order workflow
3. **Admin Dashboard**: Product and user management
4. **Testing Suite**: Comprehensive test coverage
5. **Performance Optimization**: Further optimizations

### Long-term Vision
1. **Microservices**: Break down monolithic backend
2. **Real-time Features**: WebSocket integration
3. **AI/ML Integration**: Product recommendations
4. **Mobile App**: React Native application
5. **Internationalization**: Multi-language support

---

*This documentation provides a comprehensive overview of the Pradeep Opticals e-commerce platform. For detailed implementation information, refer to the specific documentation sections linked above.*
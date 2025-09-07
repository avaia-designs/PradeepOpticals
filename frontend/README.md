# Pradeep Opticals Frontend

A modern, responsive e-commerce frontend built with Next.js 15, TypeScript, and Tailwind CSS for Pradeep Opticals eyewear store.

## 🚀 Features

- **Modern Tech Stack**: Next.js 15 with App Router, TypeScript, Tailwind CSS v4
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **State Management**: Zustand for global state management
- **Data Fetching**: TanStack Query (React Query) for server state
- **E-commerce Features**: Product catalog, shopping cart, wishlist, user authentication
- **Responsive Design**: Mobile-first approach with modern UX patterns
- **Performance**: Optimized with Next.js Image, lazy loading, and code splitting
- **SEO**: Built-in SEO optimization with Next.js metadata API

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn/ui + Radix UI
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Notifications**: React Hot Toast

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Dashboard routes
│   ├── products/          # Product pages
│   ├── cart/              # Shopping cart
│   ├── checkout/          # Checkout flow
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── ui/               # Shadcn/ui components
│   ├── layout/           # Layout components
│   ├── products/         # Product-related components
│   └── forms/            # Form components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
│   ├── services/         # API service layer
│   └── utils.ts          # Utility functions
├── stores/               # Zustand stores
├── types/                # TypeScript type definitions
└── utils/                # Additional utilities
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on port 5000

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pradeep-opticals/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp sample.env.local .env.local
   ```
   
   Update the environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
   NEXT_PUBLIC_TOKEN_STORAGE_KEY=pradeep_opticals_auth_token
   NEXT_PUBLIC_USER_STORAGE_KEY=pradeep_opticals_user_data
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage

## 🎨 Design System

### Colors
- **Primary**: Blue (#3B82F6)
- **Secondary**: Gray (#6B7280)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Destructive**: Red (#EF4444)
- **Info**: Cyan (#06B6D4)

### Typography
- **Font Family**: Geist Sans (primary), Geist Mono (monospace)
- **Scale**: Responsive typography scale with proper line heights

### Components
All components follow the Shadcn/ui design system with custom e-commerce specific variants.

## 🔧 Configuration

### Tailwind CSS
The project uses Tailwind CSS v4 with a custom design system. Configuration is in `tailwind.config.js`.

### Next.js
Next.js configuration is in `next.config.js` with optimizations for:
- Image optimization
- API rewrites
- Security headers
- Bundle optimization

### TypeScript
Strict TypeScript configuration with path aliases for clean imports.

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## 📱 Features

### E-commerce Features
- **Product Catalog**: Browse products with filtering and sorting
- **Product Details**: Detailed product pages with image gallery
- **Shopping Cart**: Add/remove items, quantity management
- **Wishlist**: Save favorite products
- **User Authentication**: Login/register with JWT
- **Order Management**: Track orders and history
- **Search**: Product search with suggestions

### UI/UX Features
- **Responsive Design**: Mobile-first responsive layout
- **Dark Mode**: Toggle between light and dark themes
- **Image Zoom**: Hover to zoom product images
- **Loading States**: Skeleton loaders and loading indicators
- **Error Handling**: User-friendly error messages
- **Accessibility**: WCAG compliant components

## 🔒 Security

- **CSRF Protection**: Built-in Next.js CSRF protection
- **XSS Prevention**: Sanitized inputs and outputs
- **Secure Headers**: Security headers configured
- **Environment Variables**: Sensitive data in environment variables

## 📊 Performance

- **Core Web Vitals**: Optimized for Google Core Web Vitals
- **Image Optimization**: Next.js Image component with lazy loading
- **Code Splitting**: Automatic code splitting with Next.js
- **Caching**: React Query caching for API calls
- **Bundle Size**: Optimized bundle size with tree shaking

## 🧪 Testing

- **Unit Tests**: Jest + React Testing Library
- **Component Tests**: Component testing with RTL
- **E2E Tests**: End-to-end testing (planned)
- **Coverage**: Minimum 80% test coverage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@pradeepopticals.com or create an issue in the repository.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Shadcn/ui](https://ui.shadcn.com/) - Component library
- [Radix UI](https://www.radix-ui.com/) - Headless UI components
- [Lucide](https://lucide.dev/) - Icon library
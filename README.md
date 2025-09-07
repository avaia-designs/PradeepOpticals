# Pradeep Opticals - E-commerce Backend

A modern Express.js backend API built with TypeScript, MongoDB, and MinIO for an e-commerce optical store.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Bun (JavaScript runtime)
- Node.js (for frontend development)

### 1. Start Database Services

```bash
# Start MongoDB and MinIO services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Copy environment file
cp sample.env .env

# Install dependencies
bun install

# Start development server
bun run dev
```

### 3. Verify Services

- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/v1/health
- **MongoDB**: localhost:27017
- **MinIO Console**: http://localhost:9001 (admin/minioadmin123)
- **Redis**: localhost:6379

## 🏗️ Architecture

This project follows a strict layered architecture:

```
Request → Routes → Middleware → Controller → Validation → Service → Repository → Database
```

### Backend Structure
```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Custom middleware
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── types/          # TypeScript interfaces
│   └── utils/          # Utility functions
├── sample.env          # Environment template
└── package.json
```

## 🐳 Docker Services

### MongoDB
- **Image**: mongo:7-jammy (lightweight Ubuntu-based)
- **Port**: 27017
- **Database**: ecommerce_db
- **User**: ecommerce_user / ecommerce_password
- **Admin**: admin / admin123

### MinIO (S3-compatible Storage)
- **Image**: minio/minio:latest
- **API Port**: 9000
- **Console Port**: 9001
- **Credentials**: minioadmin / minioadmin123
- **Bucket**: ecommerce-uploads

### Redis (Optional)
- **Image**: redis:7-alpine
- **Port**: 6379
- **Purpose**: Caching and session storage

## 🔧 Development

### Environment Variables
Copy `backend/sample.env` to `backend/.env` and configure:

```env
# Database
MONGODB_URI=mongodb://ecommerce_user:ecommerce_password@localhost:27017/ecommerce_db

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET_NAME=ecommerce-uploads

# Server
PORT=5000
NODE_ENV=development
```

### Available Scripts

```bash
# Development
bun run dev          # Start with hot reload
bun run build        # Build for production
bun run start        # Start production build

# Code Quality
bun run type-check   # TypeScript type checking
bun run lint         # ESLint checking
bun run lint:fix     # Fix ESLint issues

# Testing
bun run test         # Run tests
bun run test:watch   # Run tests in watch mode
```

## 📊 Database Schema

### Users Collection
- Email (unique)
- Password (hashed)
- Name, Role, Profile
- Active status and timestamps

### Products Collection
- Name, Description, Price
- Category, Images, Variants
- Inventory and ratings

### Orders Collection
- User reference
- Items, Total, Status
- Shipping and billing addresses

## 🔒 Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting
- Request validation
- Password hashing
- JWT authentication (to be implemented)

## 📝 API Endpoints

### Health Check
- `GET /api/v1/health` - Basic health check
- `GET /api/v1/health/detailed` - Detailed system info

### Future Endpoints (to be implemented)
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/products` - List products
- `POST /api/v1/orders` - Create order

## 🚀 Production Deployment

1. Set secure environment variables
2. Use production MongoDB instance
3. Configure proper CORS origins
4. Set up SSL certificates
5. Use process manager (PM2)

## 📚 Documentation

- [Backend Architecture Rules](.cursor/rules/backend-rules.mdc)
- [Project Guidelines](.cursor/rules/project-rules.mdc)
- [Frontend Architecture Rules](.cursor/rules/frontend-rules.mdc)

## 🤝 Contributing

1. Follow the established architecture patterns
2. Write TypeScript with strict typing
3. Include proper error handling
4. Add tests for new features
5. Update documentation

## 📄 License

MIT License - see LICENSE file for details
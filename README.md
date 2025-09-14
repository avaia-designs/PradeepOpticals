# Pradeep Opticals - E-commerce Platform

A modern e-commerce platform specializing in eyewear and optical products, built with Next.js, Express.js, and MongoDB.

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

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Copy environment file
cp sample.env.local .env.local

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Verify Services

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/v1/health
- **MongoDB**: localhost:27017
- **MinIO Console**: http://localhost:9001 (admin/minioadmin123)
- **Redis**: localhost:6379

## 🏗️ Architecture

This project follows a modern full-stack architecture:

```
Frontend (Next.js) ←→ Backend (Express.js) ←→ Database (MongoDB)
     ↓                        ↓                      ↓
  TypeScript              TypeScript              MinIO Storage
  Tailwind CSS            Bun Runtime             Redis Cache
  Shadcn/ui               JWT Auth
```

## 📚 Documentation

For comprehensive documentation, visit the [docs folder](./docs/):

- **[Project Overview](docs/README.md)** - Complete project documentation
- **[Architecture](docs/architecture/README.md)** - System architecture and design patterns
- **[Backend](docs/backend/README.md)** - Backend implementation details
- **[Frontend](docs/frontend/README.md)** - Frontend implementation details
- **[API](docs/api/README.md)** - API endpoints and integration
- **[Deployment](docs/deployment/README.md)** - Deployment guides
- **[Testing](docs/testing/README.md)** - Testing strategy
- **[Functional Requirements](docs/functional-requirements.md)** - Feature requirements

## 🛠️ Development

### Available Scripts

#### Backend
```bash
bun run dev          # Start with hot reload
bun run build        # Build for production
bun run start        # Start production build
bun run test         # Run tests
bun run lint         # ESLint checking
```

#### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production build
npm run lint         # Run ESLint
npm run test         # Run tests
```

## 🐳 Docker Services

### MongoDB
- **Image**: mongo:7-jammy (lightweight Ubuntu-based)
- **Port**: 27017
- **Database**: ecommerce_db

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

## 🔧 Environment Configuration

### Backend Environment
Copy `backend/sample.env` to `backend/.env` and configure:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/ecommerce_db

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123

# Server
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-here
```

### Frontend Environment
Copy `frontend/sample.env.local` to `frontend/.env.local` and configure:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_DEBUG_MODE=true
```

## 🚀 Production Deployment

1. Set secure environment variables
2. Use production MongoDB instance
3. Configure proper CORS origins
4. Set up SSL certificates
5. Use process manager (PM2)

See [Deployment Documentation](docs/deployment/README.md) for detailed instructions.

## 🤝 Contributing

1. Follow the established architecture patterns
2. Write TypeScript with strict typing
3. Include proper error handling
4. Add tests for new features
5. Update documentation

## 📄 License

MIT License - see LICENSE file for details

---

For detailed documentation, visit the [docs folder](./docs/).
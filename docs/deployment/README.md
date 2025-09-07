# Deployment Documentation - Pradeep Opticals

## Overview

This document provides comprehensive deployment instructions for the Pradeep Opticals e-commerce platform, covering development, staging, and production environments.

## Environment Architecture

### Development Environment
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Services      │
│   Next.js       │◄──►│   Express.js    │◄──►│   MongoDB       │
│   localhost:3000│    │   localhost:5000│    │   localhost:27017│
│                 │    │                 │    │   MinIO         │
│                 │    │                 │    │   localhost:9000│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Production Environment
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN           │    │   Load Balancer │    │   Application   │
│   CloudFlare    │    │   Nginx         │    │   Servers       │
│                 │    │                 │    │   Docker        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Database      │    │   File Storage  │    │   Cache         │
│   MongoDB Atlas │    │   AWS S3        │    │   Redis         │
│                 │    │   MinIO         │    │   CloudFlare    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Prerequisites

### System Requirements

#### Development
- **Node.js**: 18.0.0 or higher
- **Bun**: 1.0.0 or higher (for backend)
- **Docker**: 20.10.0 or higher
- **Docker Compose**: 2.0.0 or higher
- **Git**: 2.30.0 or higher

#### Production
- **Operating System**: Ubuntu 20.04 LTS or higher
- **Memory**: 4GB RAM minimum, 8GB recommended
- **Storage**: 50GB SSD minimum
- **CPU**: 2 cores minimum, 4 cores recommended
- **Network**: Stable internet connection

### Required Services

#### Development
- **MongoDB**: 7.0 or higher
- **MinIO**: Latest version
- **Redis**: 7.0 or higher (optional)

#### Production
- **MongoDB Atlas**: Cloud database service
- **AWS S3**: Object storage service
- **Redis Cloud**: Managed Redis service
- **CloudFlare**: CDN and security

## Development Deployment

### 1. Clone Repository

```bash
git clone https://github.com/your-username/pradeep-opticals.git
cd pradeep-opticals
```

### 2. Environment Setup

#### Backend Environment
```bash
cd backend
cp sample.env .env
```

Edit `.env` file:
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/ecommerce_db
MONGODB_TEST_URI=mongodb://localhost:27017/ecommerce_test_db

# Server Configuration
PORT=5000
NODE_ENV=development
API_VERSION=v1

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# MinIO Configuration
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET_NAME=ecommerce-uploads
MINIO_USE_SSL=false

# CORS Configuration
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# File Upload Configuration
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=debug
LOG_FILE_PATH=./logs/app.log
```

#### Frontend Environment
```bash
cd frontend
cp sample.env.local .env.local
```

Edit `.env.local` file:
```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_API_TIMEOUT=10000

# Authentication
NEXT_PUBLIC_TOKEN_STORAGE_KEY=ecommerce_auth_token
NEXT_PUBLIC_USER_STORAGE_KEY=ecommerce_user_data

# File Upload Configuration
NEXT_PUBLIC_MAX_FILE_SIZE=5242880
NEXT_PUBLIC_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp
NEXT_PUBLIC_UPLOAD_ENDPOINT=/upload

# UI Configuration
NEXT_PUBLIC_ITEMS_PER_PAGE=12
NEXT_PUBLIC_SEARCH_DEBOUNCE_MS=500

# Feature Flags
NEXT_PUBLIC_ENABLE_DARK_MODE=false
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_LIVE_CHAT=false

# Development
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_MOCK_API=false
```

### 3. Start Services

#### Using Docker Compose (Recommended)
```bash
# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

#### Manual Service Start
```bash
# Start MongoDB
docker run -d --name mongodb -p 27017:27017 mongo:7

# Start MinIO
docker run -d --name minio -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin123 \
  minio/minio server /data --console-address ":9001"

# Start Redis (optional)
docker run -d --name redis -p 6379:6379 redis:7
```

### 4. Install Dependencies

#### Backend
```bash
cd backend
bun install
```

#### Frontend
```bash
cd frontend
npm install
```

### 5. Start Development Servers

#### Backend Server
```bash
cd backend
bun dev
```

#### Frontend Server
```bash
cd frontend
npm run dev
```

### 6. Access Applications

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MinIO Console**: http://localhost:9001
- **MongoDB**: localhost:27017

## Production Deployment

### 1. Server Setup

#### Ubuntu Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Nginx
sudo apt install nginx -y

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Application Deployment

#### Clone and Setup
```bash
# Clone repository
git clone https://github.com/your-username/pradeep-opticals.git
cd pradeep-opticals

# Create production environment files
cp backend/sample.env backend/.env.production
cp frontend/sample.env.local frontend/.env.production
```

#### Production Environment Configuration

**Backend (.env.production):**
```env
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce_prod
MONGODB_TEST_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce_test

# Server Configuration
PORT=5000
NODE_ENV=production
API_VERSION=v1

# JWT Configuration
JWT_SECRET=your-production-jwt-secret-here
JWT_EXPIRES_IN=7d

# MinIO Configuration (or AWS S3)
MINIO_ENDPOINT=your-minio-endpoint.com
MINIO_PORT=443
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key
MINIO_BUCKET_NAME=ecommerce-uploads-prod
MINIO_USE_SSL=true

# CORS Configuration
FRONTEND_URL=https://your-domain.com
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=/var/log/pradeep-opticals/app.log
```

**Frontend (.env.production):**
```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com/api/v1
NEXT_PUBLIC_API_TIMEOUT=10000

# Authentication
NEXT_PUBLIC_TOKEN_STORAGE_KEY=ecommerce_auth_token
NEXT_PUBLIC_USER_STORAGE_KEY=ecommerce_user_data

# File Upload Configuration
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NEXT_PUBLIC_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp
NEXT_PUBLIC_UPLOAD_ENDPOINT=/upload

# UI Configuration
NEXT_PUBLIC_ITEMS_PER_PAGE=12
NEXT_PUBLIC_SEARCH_DEBOUNCE_MS=500

# Feature Flags
NEXT_PUBLIC_ENABLE_DARK_MODE=false
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_LIVE_CHAT=false

# Third-party Services
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx

# Production
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_MOCK_API=false
```

### 3. Build Applications

#### Backend Build
```bash
cd backend
bun install --production
bun run build
```

#### Frontend Build
```bash
cd frontend
npm install --production
npm run build
```

### 4. Docker Production Setup

#### Production Docker Compose
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - backend
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    env_file:
      - ./backend/.env.production
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    restart: unless-stopped
```

#### Frontend Dockerfile
```dockerfile
# frontend/Dockerfile.prod
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

FROM base AS runtime
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package*.json ./
EXPOSE 3000
CMD ["npm", "start"]
```

#### Backend Dockerfile
```dockerfile
# backend/Dockerfile.prod
FROM oven/bun:1-alpine AS base
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

FROM base AS build
COPY . .
RUN bun run build

FROM base AS runtime
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
EXPOSE 5000
CMD ["bun", "run", "start"]
```

### 5. Nginx Configuration

#### Nginx Config
```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server frontend:3000;
    }

    upstream backend {
        server backend:5000;
    }

    server {
        listen 80;
        server_name your-domain.com www.your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com www.your-domain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Backend API
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # File uploads
        location /upload/ {
            proxy_pass http://backend;
            client_max_body_size 10M;
        }
    }
}
```

### 6. SSL Certificate Setup

#### Using Certbot
```bash
# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 7. Start Production Services

```bash
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

## Database Setup

### MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Go to https://cloud.mongodb.com
   - Create new cluster
   - Configure network access
   - Create database user

2. **Configure Database**
   ```javascript
   // Create indexes
   db.products.createIndex({ "category.slug": 1, "status": 1, "price": 1 })
   db.products.createIndex({ "brand.slug": 1, "status": 1 })
   db.products.createIndex({ "name": "text", "description": "text" })
   db.users.createIndex({ "email": 1 }, { unique: true })
   db.orders.createIndex({ "userId": 1, "createdAt": -1 })
   ```

3. **Seed Initial Data**
   ```bash
   # Run seed script
   cd backend
   bun run seed
   ```

### MinIO Setup

1. **Create Buckets**
   ```bash
   # Create buckets
   mc mb minio/ecommerce-uploads
   mc mb minio/ecommerce-uploads/products
   mc mb minio/ecommerce-uploads/users
   mc mb minio/ecommerce-uploads/categories
   ```

2. **Set Bucket Policies**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::ecommerce-uploads/*"
       }
     ]
   }
   ```

## Monitoring and Logging

### Application Monitoring

#### Health Check Endpoints
```typescript
// Backend health check
GET /api/v1/health
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00Z",
  "services": {
    "database": "connected",
    "storage": "connected",
    "cache": "connected"
  }
}
```

#### Logging Configuration
```typescript
// Winston logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console()
  ]
});
```

### Performance Monitoring

#### Frontend Monitoring
```typescript
// Web Vitals tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

#### Backend Monitoring
```typescript
// Performance middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`
    });
  });
  next();
});
```

## Backup and Recovery

### Database Backup

#### MongoDB Backup
```bash
# Create backup
mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/ecommerce_prod" --out=./backup

# Restore backup
mongorestore --uri="mongodb+srv://username:password@cluster.mongodb.net/ecommerce_prod" ./backup
```

#### Automated Backup Script
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/pradeep-opticals"
mkdir -p $BACKUP_DIR

# MongoDB backup
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/mongodb_$DATE"

# MinIO backup
mc mirror minio/ecommerce-uploads "$BACKUP_DIR/minio_$DATE"

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -type d -mtime +30 -exec rm -rf {} \;
```

### File Storage Backup

#### MinIO Backup
```bash
# Mirror to backup location
mc mirror minio/ecommerce-uploads backup/ecommerce-uploads

# Sync with AWS S3
mc mirror minio/ecommerce-uploads s3/backup-bucket
```

## Security Hardening

### Server Security

#### Firewall Configuration
```bash
# UFW firewall setup
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

#### SSL/TLS Configuration
```nginx
# Strong SSL configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
```

### Application Security

#### Environment Variables
```bash
# Secure environment variable storage
# Use secrets management service
# Rotate secrets regularly
# Never commit secrets to version control
```

#### API Security
```typescript
// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port
sudo lsof -i :3000
sudo lsof -i :5000

# Kill process
sudo kill -9 <PID>
```

#### Docker Issues
```bash
# Clean up Docker
docker system prune -a
docker volume prune
docker network prune

# Rebuild containers
docker-compose down
docker-compose up --build
```

#### Database Connection Issues
```bash
# Check MongoDB connection
mongosh "mongodb+srv://username:password@cluster.mongodb.net/ecommerce_prod"

# Check MinIO connection
mc ls minio/ecommerce-uploads
```

### Log Analysis

#### Application Logs
```bash
# View application logs
docker-compose logs -f backend
docker-compose logs -f frontend

# View specific service logs
docker-compose logs -f nginx
```

#### System Logs
```bash
# View system logs
sudo journalctl -u nginx
sudo journalctl -u docker
```

## Maintenance

### Regular Maintenance Tasks

#### Weekly Tasks
- [ ] Check application logs for errors
- [ ] Monitor disk space usage
- [ ] Verify backup completion
- [ ] Update security patches

#### Monthly Tasks
- [ ] Review performance metrics
- [ ] Update dependencies
- [ ] Test disaster recovery procedures
- [ ] Security audit

#### Quarterly Tasks
- [ ] Full system backup
- [ ] Performance optimization review
- [ ] Security penetration testing
- [ ] Disaster recovery testing

### Update Procedures

#### Application Updates
```bash
# Pull latest changes
git pull origin main

# Update dependencies
cd backend && bun update
cd frontend && npm update

# Rebuild and restart
docker-compose down
docker-compose up --build -d
```

#### Database Updates
```bash
# Run database migrations
cd backend
bun run migrate

# Verify data integrity
bun run verify
```

---

*This deployment documentation provides comprehensive instructions for deploying the Pradeep Opticals e-commerce platform across different environments, with security, monitoring, and maintenance considerations.*

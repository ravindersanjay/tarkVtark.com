# 🚀 Complete Full-Stack CRUD Application Guide - Part 7
## Docker Configuration (Optional but Recommended)

---

## Why Docker for Your CRUD Application?

### Benefits of Using Docker

✅ **Consistency** - "Works on my machine" → Works everywhere  
✅ **Easy Setup** - New team members start in minutes  
✅ **Production Parity** - Dev environment = Production environment  
✅ **Isolation** - No conflicts with other projects  
✅ **Easy Deployment** - Deploy to any cloud platform  
✅ **Scalability** - Scale containers easily  
✅ **Team Collaboration** - Everyone uses same setup  

### When to Use Docker

**✅ USE Docker When:**
- Working in a team
- Deploying to production
- Building microservices
- CI/CD pipelines
- Complex dependencies

**⚠️ SKIP Docker When:**
- Solo learning project
- First time with Docker
- Simple prototype
- Limited resources

---

## Docker Architecture

```
┌─────────────────────────────────────────┐
│         Docker Compose                  │
│  (Orchestrates all containers)          │
└─────────────────────────────────────────┘
            │
    ┌───────┼───────┐
    │       │       │
    ▼       ▼       ▼
┌──────┐ ┌──────┐ ┌──────┐
│ DB   │ │Backend│ │Frontend│
│Postgres│ │Spring│ │React + │
│      │ │Boot  │ │ Nginx  │
└──────┘ └──────┘ └──────┘
  5432     8080      80
```

---

## 7.1 Backend Dockerfile

**File:** `task-manager-app/backend/Dockerfile`

```dockerfile
# Multi-stage build for smaller image size

# Build stage
FROM eclipse-temurin:17-jdk-alpine AS build

WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY mvnw .
COPY mvnw.cmd .
COPY .mvn .mvn
COPY pom.xml .

# Download dependencies (cached layer)
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src src

# Build application (skip tests for faster builds)
RUN ./mvnw clean package -DskipTests

# Production stage
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Create non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Expose application port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/v1/tasks || exit 1

# Run application
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**Key Features:**
- ✅ Multi-stage build (smaller final image)
- ✅ Non-root user (security)
- ✅ Health check (monitoring)
- ✅ Layer caching (faster builds)

---

## 7.2 Backend .dockerignore

**File:** `task-manager-app/backend/.dockerignore`

```
target/
!target/*.jar
.mvn/wrapper/maven-wrapper.jar
.git
.gitignore
*.md
.env
.env.local
*.log
*.iml
.idea
.vscode
.DS_Store
```

**Purpose:** Exclude unnecessary files from Docker context (faster builds)

---

## 7.3 Frontend Dockerfile

**File:** `task-manager-app/frontend/Dockerfile`

```dockerfile
# Multi-stage build

# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies (cached layer)
RUN npm ci --only=production

# Copy source code
COPY . .

# Build production bundle
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

**Key Features:**
- ✅ Multi-stage build
- ✅ Nginx for serving static files
- ✅ Production optimized
- ✅ Health check included

---

## 7.4 Nginx Configuration

**File:** `task-manager-app/frontend/nginx.conf`

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

**Features:**
- ✅ Gzip compression
- ✅ Security headers
- ✅ Cache optimization
- ✅ SPA routing support
- ✅ Health check endpoint

---

## 7.5 Frontend .dockerignore

**File:** `task-manager-app/frontend/.dockerignore`

```
node_modules
dist
.git
.gitignore
*.md
.env
.env.local
*.log
.DS_Store
coverage
.vscode
.idea
```

---

## 7.6 Docker Compose Configuration

**File:** `task-manager-app/docker-compose.yml`

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  database:
    image: postgres:15-alpine
    container_name: taskmanager-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-task_manager_db}
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
      - ./database/seed.sql:/docker-entrypoint-initdb.d/02-seed.sql
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend (Spring Boot)
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: taskmanager-backend
    restart: unless-stopped
    depends_on:
      database:
        condition: service_healthy
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://database:5432/${POSTGRES_DB:-task_manager_db}
      SPRING_DATASOURCE_USERNAME: ${POSTGRES_USER:-postgres}
      SPRING_DATASOURCE_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      JWT_SECRET: ${JWT_SECRET:-TaskManager2026SecureJWTSecretKeyMinimum32Characters}
      JWT_EXPIRATION_MS: ${JWT_EXPIRATION_MS:-86400000}
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID:-}
      SPRING_PROFILES_ACTIVE: ${SPRING_PROFILES_ACTIVE:-prod}
      SERVER_PORT: 8080
    ports:
      - "8080:8080"
    volumes:
      - backend_uploads:/app/uploads
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8080/api/v1/tasks"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Frontend (React + Nginx)
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: taskmanager-frontend
    restart: unless-stopped
    depends_on:
      - backend
    ports:
      - "80:80"
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 3s
      retries: 3

networks:
  app-network:
    driver: bridge

volumes:
  postgres_data:
    driver: local
  backend_uploads:
    driver: local
```

**Features:**
- ✅ All services in one file
- ✅ Health checks for all services
- ✅ Named volumes for data persistence
- ✅ Service dependencies
- ✅ Environment variable support

---

## 7.7 Environment Variables for Docker

**File:** `task-manager-app/.env.docker`

```bash
# Database Configuration
POSTGRES_DB=task_manager_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password_here

# Backend Configuration
JWT_SECRET=TaskManager2026SecureJWTSecretKeyMinimum32CharactersLong
JWT_EXPIRATION_MS=86400000

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id_here

# Spring Profile (dev or prod)
SPRING_PROFILES_ACTIVE=prod
```

**File:** `task-manager-app/.env.docker.example`

```bash
# Copy this file to .env.docker and fill in your values

POSTGRES_DB=task_manager_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=change_this_password

JWT_SECRET=change_this_to_a_secure_random_string_minimum_32_characters
JWT_EXPIRATION_MS=86400000

GOOGLE_CLIENT_ID=your_google_client_id_from_console.cloud.google.com

SPRING_PROFILES_ACTIVE=prod
```

---

## 7.8 Docker Commands Cheat Sheet

### Build and Start All Services

```bash
# Build images and start containers
docker-compose up --build

# Start in detached mode (background)
docker-compose up -d

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
```

### Stop and Remove

```bash
# Stop all containers
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v

# Stop and remove images
docker-compose down --rmi all
```

### Individual Service Management

```bash
# Restart specific service
docker-compose restart backend

# Rebuild specific service
docker-compose up -d --build backend

# View service status
docker-compose ps

# Execute command in container
docker-compose exec backend sh
docker-compose exec database psql -U postgres -d task_manager_db
```

### Development Workflow

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Make code changes...

# Rebuild and restart affected service
docker-compose up -d --build backend

# Stop services
docker-compose down
```

---

## 7.9 Docker Development Setup

### Step 1: Install Docker

**Install Docker Desktop:**
- Windows: https://docs.docker.com/desktop/install/windows-install/
- macOS: https://docs.docker.com/desktop/install/mac-install/
- Linux: https://docs.docker.com/desktop/install/linux-install/

**Verify installation:**
```bash
docker --version
docker-compose --version
```

### Step 2: Create Docker Files

1. Create `backend/Dockerfile`
2. Create `backend/.dockerignore`
3. Create `frontend/Dockerfile`
4. Create `frontend/.dockerignore`
5. Create `frontend/nginx.conf`
6. Create `docker-compose.yml` in root
7. Create `.env.docker` from `.env.docker.example`

### Step 3: Build and Run

```bash
# Navigate to project root
cd task-manager-app

# Copy environment example
cp .env.docker.example .env.docker

# Edit .env.docker with your values
nano .env.docker  # or use your editor

# Build and start all services
docker-compose up --build

# Access application
# Frontend: http://localhost
# Backend: http://localhost:8080/api/v1
# Database: localhost:5432
```

### Step 4: Verify Services

```bash
# Check running containers
docker-compose ps

# Should show:
# taskmanager-db        - Up (healthy)
# taskmanager-backend   - Up (healthy)
# taskmanager-frontend  - Up (healthy)

# Check logs
docker-compose logs

# Check health
docker-compose ps
```

---

## 7.10 Production Deployment with Docker

### Option 1: Docker on Cloud VM

```bash
# On your server (AWS, DigitalOcean, etc.)

# 1. Clone repository
git clone <your-repo-url>
cd task-manager-app

# 2. Set environment variables
cp .env.docker.example .env.docker
nano .env.docker  # Edit with production values

# 3. Start services
docker-compose -f docker-compose.yml up -d

# 4. Setup reverse proxy (optional - Nginx/Caddy)
# For HTTPS and domain name
```

### Option 2: Docker Hub + Container Platform

```bash
# 1. Build and tag images
docker build -t yourusername/taskmanager-backend:latest ./backend
docker build -t yourusername/taskmanager-frontend:latest ./frontend

# 2. Push to Docker Hub
docker login
docker push yourusername/taskmanager-backend:latest
docker push yourusername/taskmanager-frontend:latest

# 3. Deploy to cloud platform
# - AWS ECS
# - Google Cloud Run
# - Azure Container Instances
# - Railway
# - Fly.io
```

### Option 3: Kubernetes (Advanced)

For large-scale deployments, convert to Kubernetes manifests.

---

## 7.11 Docker vs No Docker Comparison

| Aspect | Without Docker | With Docker |
|--------|---------------|-------------|
| **Setup Time** | 30-60 min | 5-10 min |
| **"Works on my machine"** | Common issue | No issue |
| **Team Onboarding** | Hours | Minutes |
| **Production Parity** | Often different | Identical |
| **Dependency Conflicts** | Possible | Isolated |
| **Resource Usage** | Lower | Higher |
| **Learning Curve** | Lower | Higher |
| **Deployment** | Platform-specific | Consistent |

---

## 7.12 Troubleshooting Docker

### Issue: Port already in use

```bash
# Find process using port
lsof -i :8080  # macOS/Linux
netstat -ano | findstr :8080  # Windows

# Kill process or change port in docker-compose.yml
ports:
  - "8081:8080"  # Changed host port
```

### Issue: Database connection refused

```bash
# Check database is healthy
docker-compose ps

# Check logs
docker-compose logs database

# Restart database
docker-compose restart database
```

### Issue: Frontend can't connect to backend

```bash
# Update frontend .env with correct backend URL
VITE_API_BASE_URL=http://localhost:8080/api/v1

# Rebuild frontend
docker-compose up -d --build frontend
```

### Issue: Changes not reflected

```bash
# Rebuild specific service
docker-compose up -d --build backend

# Or rebuild all
docker-compose down
docker-compose up --build
```

### Issue: Out of disk space

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove everything
docker system prune -a --volumes
```

---

## 7.13 Docker Best Practices

### DO ✅

1. **Use Multi-stage Builds** - Smaller images
2. **Use .dockerignore** - Faster builds
3. **Use Health Checks** - Better monitoring
4. **Use Named Volumes** - Data persistence
5. **Use Environment Variables** - Configuration
6. **Run as Non-root** - Security
7. **Use Specific Versions** - Reproducibility
8. **Cache Dependencies** - Faster builds

### DON'T ❌

1. **Don't include secrets in images**
2. **Don't use `latest` tag in production**
3. **Don't run as root**
4. **Don't ignore .dockerignore**
5. **Don't rebuild unnecessarily**
6. **Don't commit .env files**
7. **Don't forget health checks**

---

## 7.14 Development Workflow with Docker

### Daily Development

```bash
# Morning - Start services
docker-compose up -d

# View logs while coding
docker-compose logs -f backend

# Make changes to code...

# See changes (with hot reload)
# Frontend: Changes auto-reload in Vite
# Backend: Need to rebuild

# Rebuild backend after changes
docker-compose up -d --build backend

# Evening - Stop services
docker-compose down
```

### Testing

```bash
# Run backend tests in container
docker-compose exec backend ./mvnw test

# Run frontend tests
docker-compose exec frontend npm test

# Access database for debugging
docker-compose exec database psql -U postgres -d task_manager_db
```

---

## 7.15 When to Use Docker

### ✅ Use Docker When:

1. **Team Projects**
   - Multiple developers
   - Need consistent environment
   - Onboarding new members

2. **Production Deployment**
   - Want dev/prod parity
   - Using container platforms
   - Need scalability

3. **Complex Setup**
   - Multiple services
   - Specific versions required
   - Microservices architecture

4. **CI/CD Pipelines**
   - Automated testing
   - Automated deployment
   - Consistent builds

### ⚠️ Skip Docker When:

1. **Learning**
   - First full-stack project
   - Still learning basics
   - Want to understand manual setup

2. **Simple Projects**
   - Solo project
   - Quick prototype
   - No deployment plans

3. **Resource Constraints**
   - Low-powered machine
   - Limited disk space
   - Need maximum performance

---

## Summary

**Docker Added to Guide:** ✅

**Benefits:**
- ✅ Consistent development environment
- ✅ Easy team collaboration
- ✅ Production-ready deployment
- ✅ Service isolation
- ✅ Scalability

**Complexity:**
- 🟡 Medium (worth learning)

**Recommendation:**
- ✅ **Include in guide as optional**
- ✅ Provide both Docker and non-Docker setup
- ✅ Let developers choose based on needs

---

**Next:** Update main guide to include Docker as Part 7

---

*Docker configuration complete for the FULLSTACK_CRUD_GUIDE*


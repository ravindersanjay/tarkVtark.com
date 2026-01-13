# 🚀 Part 6: Docker Compose
## Running Everything Together

**Time Required:** 1 hour  
**Difficulty:** Easy  
**Prerequisites:** Parts 1-5 completed

---

## 📚 What You'll Learn in This Part

1. Understanding Docker Compose
2. Creating docker-compose.yml
3. Configuring services (database, backend, frontend)
4. Managing environment variables
5. Setting up volumes and networks
6. Running the entire application with one command
7. Testing the full stack

---

## 🎯 What is Docker Compose?

### Simple Explanation

**Docker Compose** is a tool for running multiple Docker containers together.

**Without Docker Compose:**
```bash
# Start database
docker run postgres...

# Start backend  
docker run backend...

# Start frontend
docker run frontend...
```

**With Docker Compose:**
```bash
# Start everything
docker-compose up
```

**Think of it as:** A conductor orchestrating an entire orchestra!

---

## 📝 Step 1: Create docker-compose.yml

**File:** `task-manager-docker/docker-compose.yml`

```yaml
# =====================================================================
# Docker Compose Configuration
# Runs database, backend, and frontend together
# =====================================================================

version: '3.8'

services:
  # ===================================================================
  # PostgreSQL Database
  # ===================================================================
  database:
    image: postgres:15-alpine
    container_name: task-manager-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-task_manager_db}
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres123}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/01-init.sql
      - ./database/seed.sql:/docker-entrypoint-initdb.d/02-seed.sql
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ===================================================================
  # Spring Boot Backend
  # ===================================================================
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: task-manager-backend
    restart: unless-stopped
    depends_on:
      database:
        condition: service_healthy
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://database:5432/${POSTGRES_DB:-task_manager_db}
      SPRING_DATASOURCE_USERNAME: ${POSTGRES_USER:-postgres}
      SPRING_DATASOURCE_PASSWORD: ${POSTGRES_PASSWORD:-postgres123}
      SPRING_JPA_HIBERNATE_DDL_AUTO: validate
    ports:
      - "8080:8080"
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8080/api/tasks/stats"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # ===================================================================
  # React Frontend
  # ===================================================================
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: task-manager-frontend
    restart: unless-stopped
    depends_on:
      - backend
    ports:
      - "3000:80"
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 3s
      retries: 3

# =====================================================================
# Networks
# =====================================================================
networks:
  app-network:
    driver: bridge

# =====================================================================
# Volumes (Persistent Data)
# =====================================================================
volumes:
  postgres_data:
    driver: local
```

**Understanding the configuration:**

### Services Section

**database:**
- Uses official PostgreSQL image
- Exposes port 5432
- Stores data in named volume (persists after restart)
- Runs health check to verify it's ready

**backend:**
- Builds from ./backend/Dockerfile
- Depends on database (waits for database to be healthy)
- Connects to database using service name "database"
- Exposes port 8080

**frontend:**
- Builds from ./frontend/Dockerfile
- Depends on backend
- Exposes port 3000 (mapped to container port 80)
- Serves the React app

### Networks

All services are on the same network (`app-network`), so they can talk to each other using service names:
- Backend connects to database using `database:5432`
- Frontend connects to backend using `backend:8080`

### Volumes

`postgres_data` volume persists database data even if containers are removed.

---

## 🔧 Step 2: Create Environment Variables File

**File:** `task-manager-docker/.env`

```bash
# =====================================================================
# Environment Variables for Docker Compose
# =====================================================================

# Database Configuration
POSTGRES_DB=task_manager_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres123

# Note: In production, use strong passwords!
# Example: POSTGRES_PASSWORD=MySecureP@ssw0rd!2026
```

**⚠️ Important:** Add `.env` to `.gitignore` to keep passwords safe!

### Create .env.example

**File:** `task-manager-docker/.env.example`

```bash
# Copy this file to .env and fill in your values

POSTGRES_DB=task_manager_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password_here
```

---

## 🚀 Step 3: Run Everything with Docker Compose

### Build and Start All Services

```bash
# In task-manager-docker folder
docker-compose up --build
```

**What this does:**
1. Builds backend image
2. Builds frontend image
3. Pulls PostgreSQL image
4. Starts database container
5. Waits for database to be healthy
6. Starts backend container
7. Starts frontend container

**Expected output:**
```
Creating network "task-manager-docker_app-network"
Creating volume "task-manager-docker_postgres_data"
Building backend...
Building frontend...
Creating task-manager-db ... done
Creating task-manager-backend ... done
Creating task-manager-frontend ... done
Attaching to task-manager-db, task-manager-backend, task-manager-frontend
...
database       | database system is ready to accept connections
backend        | Started TaskManagerBackendApplication in 5.678 seconds
frontend       | /docker-entrypoint.sh: Configuration complete; ready for start up
```

**⏱️ First build takes 3-5 minutes**

---

## ✅ Step 4: Verify Everything is Running

### Check Container Status

```bash
docker-compose ps
```

**Expected output:**
```
NAME                     STATUS         PORTS
task-manager-db          Up (healthy)   0.0.0.0:5432->5432/tcp
task-manager-backend     Up (healthy)   0.0.0.0:8080->8080/tcp
task-manager-frontend    Up             0.0.0.0:3000->80/tcp
```

**✅ All services should show "Up"!**

### Check Logs

**All services:**
```bash
docker-compose logs
```

**Specific service:**
```bash
docker-compose logs database
docker-compose logs backend
docker-compose logs frontend
```

**Follow logs (live):**
```bash
docker-compose logs -f
```

---

## 🧪 Step 5: Test the Full Application

### Open Frontend

**URL:** http://localhost:3000

**You should see:**
- Task Manager header
- Statistics showing task counts
- Filter buttons (ALL, PENDING, IN_PROGRESS, COMPLETED)
- Sample tasks from seed data
- "Add Task" button

### Test CRUD Operations

**1. Create a Task:**
- Click "Add Task"
- Fill in title, description
- Select status and priority
- Click "Create"
- ✅ New task appears in list

**2. Edit a Task:**
- Click "Edit" on any task
- Change title or status
- Click "Update"
- ✅ Task updates immediately

**3. Delete a Task:**
- Click "Delete" on any task
- Confirm deletion
- ✅ Task disappears from list

**4. Filter Tasks:**
- Click "PENDING" filter
- ✅ Only pending tasks shown
- Click "COMPLETED" filter
- ✅ Only completed tasks shown

**5. Check Statistics:**
- Statistics at top update automatically
- ✅ Numbers match filtered tasks

### Test Backend API Directly

```bash
# Get all tasks
curl http://localhost:8080/api/tasks

# Get task stats
curl http://localhost:8080/api/tasks/stats

# Create task via API
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "API Test Task",
    "description": "Created via curl",
    "status": "PENDING",
    "priority": "HIGH"
  }'
```

---

## 📋 Docker Compose Commands Cheat Sheet

### Starting and Stopping

```bash
# Start all services (build if needed)
docker-compose up --build

# Start in background (detached mode)
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes data!)
docker-compose down -v

# Stop and remove images
docker-compose down --rmi all
```

### Managing Services

```bash
# Start specific service
docker-compose start backend

# Stop specific service
docker-compose stop backend

# Restart specific service
docker-compose restart backend

# Rebuild specific service
docker-compose up -d --build backend

# View service status
docker-compose ps

# View service logs
docker-compose logs backend

# Follow logs
docker-compose logs -f backend
```

### Executing Commands

```bash
# Execute command in running container
docker-compose exec backend sh
docker-compose exec database psql -U postgres -d task_manager_db
docker-compose exec frontend sh

# Run one-off command
docker-compose run backend ./mvnw test
```

### Cleaning Up

```bash
# Remove stopped containers
docker-compose rm

# Remove all (containers, networks, volumes)
docker-compose down -v

# Prune unused Docker resources
docker system prune -a
```

---

## 🔄 Development Workflow

### Daily Development Routine

**Morning - Start development:**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

**During development:**
- Edit code in your editor
- Backend: Rebuild and restart
  ```bash
  docker-compose up -d --build backend
  ```
- Frontend: Rebuild and restart
  ```bash
  docker-compose up -d --build frontend
  ```

**Evening - Stop services:**
```bash
docker-compose down
```

### Making Changes

**Backend Code Changes:**
1. Edit Java files
2. Rebuild: `docker-compose up -d --build backend`
3. Test: http://localhost:8080/api/tasks

**Frontend Code Changes:**
1. Edit React files
2. Rebuild: `docker-compose up -d --build frontend`
3. Test: http://localhost:3000

**Database Schema Changes:**
1. Edit `database/init.sql`
2. Restart with fresh database:
   ```bash
   docker-compose down -v
   docker-compose up --build
   ```

---

## 🎓 Understanding Service Communication

### How Services Talk to Each Other

**In docker-compose.yml:**
- Backend connects to: `database:5432` (not localhost!)
- Frontend connects to: `backend:8080`

**Why service names?**
Docker Compose creates a network where services can use names:
- `database` → Resolves to database container IP
- `backend` → Resolves to backend container IP

**Example:**
```yaml
backend:
  environment:
    SPRING_DATASOURCE_URL: jdbc:postgresql://database:5432/task_manager_db
    # NOT localhost! Use service name "database"
```

---

## 🆘 Troubleshooting

### Services won't start

**Check logs:**
```bash
docker-compose logs
```

**Common issues:**
- Port already in use
- Build failed
- Database not healthy

**Solution:**
```bash
# Stop everything
docker-compose down

# Remove volumes
docker-compose down -v

# Rebuild from scratch
docker-compose up --build
```

### Frontend can't connect to backend

**Check network:**
```bash
docker network inspect task-manager-docker_app-network
```

**Verify backend is running:**
```bash
curl http://localhost:8080/api/tasks
```

### Database connection refused

**Check database health:**
```bash
docker-compose ps
```

**Restart database:**
```bash
docker-compose restart database
```

### Port already in use

**Find process using port:**
```bash
# Linux/Mac
lsof -i :8080

# Windows
netstat -ano | findstr :8080
```

**Change port in docker-compose.yml:**
```yaml
backend:
  ports:
    - "8081:8080"  # Use 8081 instead
```

---

## ✅ Part 6 Checklist

- [ ] Created docker-compose.yml
- [ ] Created .env file
- [ ] Created .env.example
- [ ] Ran `docker-compose up --build`
- [ ] All services started successfully
- [ ] Database is healthy
- [ ] Backend is healthy
- [ ] Frontend is accessible
- [ ] Created a task through UI
- [ ] Edited a task
- [ ] Deleted a task
- [ ] Filters work correctly
- [ ] Statistics update correctly

---

## 🎯 What You've Achieved

You now have:
- ✅ Complete Docker Compose setup
- ✅ All services running together
- ✅ Database persistence with volumes
- ✅ Service networking configured
- ✅ Health checks for all services
- ✅ One command to start everything
- ✅ Production-ready local environment

---

## 🚀 What's Next?

**Part 7: Production Deployment**

In the next part, you'll:
- Deploy database to Neon (cloud PostgreSQL)
- Deploy backend to Render.com
- Deploy frontend to Vercel
- Connect all services in production
- Get live URLs for your application

**Time:** 2 hours  
**Difficulty:** Medium

**Next:** [Part 7 - Production Deployment](./DOCKER_FULLSTACK_PART_7_DEPLOYMENT.md)

---

*Fantastic! Your entire application runs with one command. Time to deploy to production!* 🎉


# 🚀 Part 7: Production Deployment
## Deploying to the Cloud

**Time Required:** 2 hours  
**Difficulty:** Medium  
**Prerequisites:** Parts 1-6 completed

---

## 📚 What You'll Learn in This Part

1. Deploying PostgreSQL to Neon
2. Deploying Spring Boot to Render.com
3. Deploying React to Vercel
4. Connecting all services in production
5. Setting up environment variables
6. Testing the live application
7. Custom domains (optional)

---

## 🎯 Deployment Architecture

```
Production Cloud Services
├── Neon (neon.tech)
│   └── PostgreSQL Database
│       └── Connection: postgresql://...neon.tech/...
│
├── Render.com (render.com)
│   └── Spring Boot Backend
│       └── URL: https://your-app.onrender.com
│
└── Vercel (vercel.com)
    └── React Frontend
        └── URL: https://your-app.vercel.app
```

---

## 🗄️ Step 1: Deploy Database to Neon

### What is Neon?

**Neon** is serverless PostgreSQL hosting with:
- Free tier (perfect for learning)
- Always-on databases
- Automatic backups
- Fast and reliable

### Create Neon Account

1. Go to: https://neon.tech
2. Click "Sign Up"
3. Sign up with GitHub
4. Complete onboarding

### Create New Project

1. Click "New Project"
2. **Project name:** task-manager
3. **Database name:** task_manager_db
4. **Region:** Choose closest to you
5. Click "Create Project"

### Get Connection String

After project creation, you'll see:

```
Connection String:
postgresql://username:password@ep-xxx-yyy.region.aws.neon.tech/task_manager_db?sslmode=require
```

**Copy this!** You'll need it for backend deployment.

### Run Database Schema

**Option 1: Using Neon SQL Editor**

1. Go to Neon dashboard
2. Click "SQL Editor"
3. Copy contents of `database/init.sql`
4. Paste and run
5. Copy contents of `database/seed.sql`
6. Paste and run

**Option 2: Using psql**

```bash
# Copy your Neon connection string
export DATABASE_URL="postgresql://username:password@...neon.tech/task_manager_db?sslmode=require"

# Run schema
psql $DATABASE_URL -f database/init.sql

# Run seed data
psql $DATABASE_URL -f database/seed.sql
```

### Verify Data

In Neon SQL Editor:

```sql
-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Count tasks
SELECT COUNT(*) FROM tasks;

-- View tasks
SELECT * FROM tasks LIMIT 5;
```

**✅ Database deployed to cloud!**

---

## ☕ Step 2: Deploy Backend to Render.com

### What is Render.com?

**Render** provides:
- Free tier (750 hours/month)
- Automatic deploys from Git
- Built-in HTTPS
- Zero DevOps

### Prepare Backend for Deployment

**1. Update application.properties**

**File:** `backend/src/main/resources/application.properties`

Add production profile:

```properties
# Existing configuration...

# =====================================================================
# Production Configuration
# =====================================================================
spring.config.activate.on-profile=prod

# Use environment variable for database URL
spring.datasource.url=${DATABASE_URL}

# No username/password needed (included in DATABASE_URL)
# spring.datasource.username= (not needed)
# spring.datasource.password= (not needed)

# Validate schema (don't auto-create in production)
spring.jpa.hibernate.ddl-auto=validate

# Don't show SQL in production
spring.jpa.show-sql=false

# Use PORT from environment
server.port=${PORT:8080}
```

**2. Ensure Maven Wrapper Exists**

```bash
cd backend

# If mvnw doesn't exist:
mvn -N wrapper:wrapper

# Copy to project root
cp mvnw ../
cp mvnw.cmd ../
cp -r .mvn ../
```

**3. Create render.yaml** (optional but recommended)

**File:** `task-manager-docker/render.yaml`

```yaml
services:
  - type: web
    name: task-manager-backend
    env: java
    region: singapore
    plan: free
    buildCommand: cd backend && ./mvnw clean package -DskipTests
    startCommand: cd backend && java -Dserver.port=$PORT -jar target/*.jar
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: SPRING_PROFILES_ACTIVE
        value: prod
```

### Push to GitHub

```bash
# In task-manager-docker folder

# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Prepare for deployment"

# Create GitHub repo and push
# Follow GitHub instructions to push
git remote add origin https://github.com/YOUR_USERNAME/task-manager-docker.git
git branch -M main
git push -u origin main
```

### Deploy on Render.com

1. Go to: https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Click "Connect" next to task-manager-docker

**Configure Service:**
- **Name:** task-manager-backend
- **Region:** Choose closest
- **Branch:** main
- **Root Directory:** (leave blank)
- **Environment:** Docker
- **Build Command:** 
  ```
  cd backend && ./mvnw clean package -DskipTests
  ```
- **Start Command:**
  ```
  cd backend && java -Dserver.port=$PORT -jar target/*.jar
  ```
- **Plan:** Free

**Environment Variables:**

Click "Add Environment Variable":

1. **DATABASE_URL**
   - Value: `postgresql://username:password@...neon.tech/task_manager_db?sslmode=require`
   - (Your Neon connection string)

2. **SPRING_PROFILES_ACTIVE**
   - Value: `prod`

Click "Create Web Service"

**⏱️ First deploy takes 5-10 minutes**

### Monitor Deployment

Watch logs in Render dashboard:

```
==> Building...
==> Installing dependencies
==> Running build command
BUILD SUCCESS
==> Deploying...
==> Your service is live 🎉
```

### Get Backend URL

After deployment:
- URL: `https://task-manager-backend-xxx.onrender.com`
- Save this URL!

### Test Backend

```bash
# Get all tasks
curl https://task-manager-backend-xxx.onrender.com/api/tasks

# Get stats
curl https://task-manager-backend-xxx.onrender.com/api/tasks/stats
```

**✅ Backend deployed to cloud!**

---

## ⚛️ Step 3: Deploy Frontend to Vercel

### What is Vercel?

**Vercel** provides:
- Free tier (generous limits)
- Automatic deploys from Git
- Global CDN
- Built-in HTTPS

### Prepare Frontend for Deployment

**1. Update API URL**

**File:** `frontend/src/services/apiService.js`

Update first line:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://task-manager-backend-xxx.onrender.com/api';
// Replace xxx with your actual Render URL
```

**2. Create .env.production**

**File:** `frontend/.env.production`

```bash
VITE_API_URL=https://task-manager-backend-xxx.onrender.com/api
```

Replace `xxx` with your actual Render URL.

**3. Update vite.config.js** (if needed)

**File:** `frontend/vite.config.js`

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5173,
  },
})
```

**4. Commit and Push**

```bash
git add .
git commit -m "Configure for Vercel deployment"
git push origin main
```

### Deploy on Vercel

1. Go to: https://vercel.com
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Select "task-manager-docker"

**Configure Project:**

- **Framework Preset:** Vite
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

**Environment Variables:**

Add environment variable:
- **Key:** `VITE_API_URL`
- **Value:** `https://task-manager-backend-xxx.onrender.com/api`

Click "Deploy"

**⏱️ First deploy takes 2-3 minutes**

### Get Frontend URL

After deployment:
- URL: `https://task-manager-xxx.vercel.app`
- This is your live application!

### Test Frontend

Open: `https://task-manager-xxx.vercel.app`

**You should see:**
- Task Manager UI
- Tasks loaded from cloud database
- All CRUD operations working

**✅ Frontend deployed to cloud!**

---

## 🔗 Step 4: Connect Everything

### Update Backend CORS

**File:** `backend/src/main/java/com/taskmanager/controller/TaskController.java`

Update @CrossOrigin:

```java
@CrossOrigin(origins = {"http://localhost:3000", "https://task-manager-xxx.vercel.app"})
// Add your Vercel URL
```

**Commit and push:**

```bash
git add .
git commit -m "Update CORS for Vercel"
git push origin main
```

Render will auto-deploy the changes.

---

## 🧪 Step 5: Test Production Application

### Full Test Checklist

**1. Access Frontend:**
- [ ] Open: `https://task-manager-xxx.vercel.app`
- [ ] UI loads correctly
- [ ] No console errors

**2. View Tasks:**
- [ ] Tasks from seed data visible
- [ ] Statistics show correct counts
- [ ] Task cards display properly

**3. Create Task:**
- [ ] Click "Add Task"
- [ ] Fill form
- [ ] Click "Create"
- [ ] Task appears in list
- [ ] Statistics update

**4. Edit Task:**
- [ ] Click "Edit" on a task
- [ ] Change title/status
- [ ] Click "Update"
- [ ] Changes saved
- [ ] UI updates

**5. Delete Task:**
- [ ] Click "Delete"
- [ ] Confirm deletion
- [ ] Task removed
- [ ] Statistics update

**6. Filter Tasks:**
- [ ] Click "PENDING" filter
- [ ] Only pending tasks shown
- [ ] Try other filters
- [ ] All work correctly

**7. Backend API:**
```bash
curl https://task-manager-backend-xxx.onrender.com/api/tasks
curl https://task-manager-backend-xxx.onrender.com/api/tasks/stats
```

**✅ Everything working in production!**

---

## 🌐 Step 6: Custom Domain (Optional)

### Add Custom Domain to Vercel

1. Buy domain (e.g., from Namecheap, GoDaddy)
2. In Vercel dashboard:
   - Go to project settings
   - Click "Domains"
   - Add your domain: `taskmanager.yourdomain.com`
3. Update DNS records as instructed by Vercel
4. Wait for DNS propagation (5-30 minutes)

### Add Custom Domain to Render

1. In Render dashboard:
   - Go to service settings
   - Click "Custom Domain"
   - Add: `api.yourdomain.com`
2. Update DNS records
3. Wait for verification

---

## 📋 Deployment Checklist

### Database (Neon)
- [ ] Neon account created
- [ ] Project created
- [ ] Database initialized
- [ ] Schema ran successfully
- [ ] Seed data loaded
- [ ] Connection string saved

### Backend (Render.com)
- [ ] Code pushed to GitHub
- [ ] Render service created
- [ ] Environment variables set
- [ ] First deploy successful
- [ ] Backend URL accessible
- [ ] API endpoints working
- [ ] CORS configured

### Frontend (Vercel)
- [ ] API URL updated
- [ ] .env.production created
- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables set
- [ ] First deploy successful
- [ ] Frontend URL accessible
- [ ] Connected to backend

### Testing
- [ ] Can view tasks
- [ ] Can create tasks
- [ ] Can edit tasks
- [ ] Can delete tasks
- [ ] Filters work
- [ ] Statistics accurate
- [ ] No console errors

---

## 💰 Cost Summary

### Free Tier Limits

**Neon (Database):**
- ✅ Free: 3GB storage, 10 projects
- ✅ Always-on
- ✅ No credit card required

**Render.com (Backend):**
- ✅ Free: 750 hours/month
- ⚠️ Sleeps after 15 min inactivity
- ⚠️ Takes 30s to wake up on first request
- ✅ No credit card required

**Vercel (Frontend):**
- ✅ Free: Unlimited personal projects
- ✅ 100GB bandwidth/month
- ✅ Always-on
- ✅ No credit card required

**Total Monthly Cost: $0** 🎉

---

## 🆘 Troubleshooting

### Backend won't deploy

**Check logs in Render:**
- Build failed: Check mvnw exists
- Start failed: Check DATABASE_URL
- Port issue: Ensure using $PORT

**Common fixes:**
```bash
# Ensure Maven wrapper exists
cd backend
mvn -N wrapper:wrapper
git add mvnw* .mvn/
git commit -m "Add Maven wrapper"
git push
```

### Frontend can't connect to backend

**Check:**
- VITE_API_URL is correct
- CORS allows Vercel domain
- Backend is running (not sleeping)

**Wake up Render:**
```bash
curl https://your-backend.onrender.com/api/tasks
```

### Database connection errors

**Verify:**
- DATABASE_URL is complete (includes ?sslmode=require)
- Neon database is running
- Tables exist in Neon

### CORS errors

**Update TaskController.java:**
```java
@CrossOrigin(origins = "*") // Allow all (development only)
// Or specific domain:
@CrossOrigin(origins = "https://your-app.vercel.app")
```

---

## ✅ Part 7 Complete!

You now have:
- ✅ Database in production (Neon)
- ✅ Backend in production (Render.com)
- ✅ Frontend in production (Vercel)
- ✅ All services connected
- ✅ Live, working application
- ✅ Real URLs to share

---

## 🚀 What's Next?

**Part 8: Testing & Troubleshooting**

In the final part, you'll:
- Complete end-to-end testing
- Learn common issues and solutions
- Optimize performance
- Implement security best practices
- Create maintenance plan

**Time:** 1 hour  
**Difficulty:** Easy

**Next:** [Part 8 - Testing & Troubleshooting](./DOCKER_FULLSTACK_PART_8_TESTING.md)

---

*Congratulations! Your app is live on the internet! 🌐🎉*


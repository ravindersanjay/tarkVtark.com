# 🚀 Complete Full-Stack CRUD Application Guide - Part 6
## Deployment & Best Practices

---

## 7. Production Deployment

### 7.1 Deployment Architecture

```
┌─────────────────────────────────────────────┐
│          Production Environment             │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ Frontend │  │ Backend  │  │ Database │ │
│  │          │  │          │  │          │ │
│  │  Vercel  │  │  Render  │  │  Neon    │ │
│  │   or     │  │   .com   │  │   DB     │ │
│  │ Netlify  │  │          │  │          │ │
│  └──────────┘  └──────────┘  └──────────┘ │
│       ↓              ↓              ↓      │
│    Static        Java/Spring    PostgreSQL │
│     Files           API          Cloud DB  │
└─────────────────────────────────────────────┘
```

---

## 7.2 Database Deployment (Neon)

### Step 1: Create Neon Account

1. Go to https://neon.tech
2. Sign up with GitHub
3. Create new project

### Step 2: Create Database

```sql
-- Neon automatically creates a database
-- Get connection string from Neon dashboard:
postgresql://[user]:[password]@[endpoint]/[database]?sslmode=require
```

### Step 3: Run Migrations

```bash
# Copy connection string from Neon dashboard
export DATABASE_URL="postgresql://..."

# Run schema
psql $DATABASE_URL -f database/schema.sql

# Run seed data (optional)
psql $DATABASE_URL -f database/seed.sql
```

### Step 4: Verify

```bash
# Connect to Neon database
psql $DATABASE_URL

# Check tables
\dt

# Check data
SELECT * FROM users;
SELECT * FROM tasks;
```

---

## 7.3 Backend Deployment (Render.com)

### Step 1: Prepare Backend

**Ensure Maven Wrapper exists:**
```bash
cd backend

# Generate if missing
mvn -N wrapper:wrapper

# Copy to project root
cp mvnw ../
cp mvnw.cmd ../
cp -r .mvn ../
```

**Create `render.yaml` (optional):**

```yaml
services:
  - type: web
    name: taskmanager-backend
    env: java
    region: singapore
    plan: free
    buildCommand: ./mvnw clean package -DskipTests
    startCommand: java -Dserver.port=$PORT -jar target/*.jar
    envVars:
      - key: SPRING_DATASOURCE_URL
        sync: false
      - key: SPRING_DATASOURCE_USERNAME
        sync: false
      - key: SPRING_DATASOURCE_PASSWORD
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: GOOGLE_CLIENT_ID
        sync: false
      - key: SPRING_PROFILES_ACTIVE
        value: prod
```

### Step 2: Deploy to Render.com

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Create Web Service on Render:**
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

3. **Configure Build Settings:**
   - **Build Command:** `./mvnw clean package -DskipTests`
   - **Start Command:** `java -Dserver.port=$PORT -jar target/*.jar`
   - **Environment:** Java

4. **Set Environment Variables:**
   ```
   SPRING_DATASOURCE_URL=postgresql://[neon-connection-string]
   SPRING_DATASOURCE_USERNAME=your_user
   SPRING_DATASOURCE_PASSWORD=your_password
   JWT_SECRET=TaskManager2026SecureJWTSecretKeyMinimum32Characters
   JWT_EXPIRATION_MS=86400000
   GOOGLE_CLIENT_ID=your_google_client_id
   SPRING_PROFILES_ACTIVE=prod
   ```

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Get URL: `https://your-app-name.onrender.com`

### Step 3: Test Backend

```bash
# Test health endpoint
curl https://your-app-name.onrender.com/api/v1/tasks

# Should return 401 (unauthorized) - this is expected
```

---

## 7.4 Frontend Deployment (Vercel)

### Step 1: Prepare Frontend

**Update `.env.production`:**

```bash
# Create production env file
cat > frontend/.env.production << 'EOF'
VITE_API_BASE_URL=https://your-app-name.onrender.com/api/v1
VITE_GOOGLE_CLIENT_ID=your_google_client_id
EOF
```

**Update `vite.config.js`:**

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    port: 5173,
  },
})
```

### Step 2: Deploy to Vercel

**Option 1: Using Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend
cd frontend

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

**Option 2: Using Vercel Dashboard**

1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Add Environment Variables:
   - `VITE_API_BASE_URL`: Your Render backend URL
   - `VITE_GOOGLE_CLIENT_ID`: Your Google Client ID
6. Click "Deploy"

### Step 3: Update Google OAuth Settings

1. Go to https://console.cloud.google.com
2. Navigate to: APIs & Services → Credentials
3. Edit your OAuth 2.0 Client ID
4. Add to **Authorized JavaScript origins:**
   ```
   https://your-frontend.vercel.app
   https://your-backend.onrender.com
   ```
5. Add to **Authorized redirect URIs:**
   ```
   https://your-frontend.vercel.app/auth/callback
   ```

---

## 7.5 Environment Variables Summary

### Development (.env)

**Backend:**
```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/task_manager_db
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres
JWT_SECRET=TaskManager2026SecureJWTSecretKeyMinimum32Characters
GOOGLE_CLIENT_ID=your_dev_client_id
SPRING_PROFILES_ACTIVE=dev
```

**Frontend:**
```bash
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_GOOGLE_CLIENT_ID=your_dev_client_id
```

### Production

**Backend (Render.com):**
```bash
SPRING_DATASOURCE_URL=postgresql://neon-connection-string
SPRING_DATASOURCE_USERNAME=neondb_owner
SPRING_DATASOURCE_PASSWORD=secure_password
JWT_SECRET=ProductionJWTSecretKeyMustBe32CharactersOrMore
GOOGLE_CLIENT_ID=production_google_client_id
SPRING_PROFILES_ACTIVE=prod
```

**Frontend (Vercel):**
```bash
VITE_API_BASE_URL=https://your-backend.onrender.com/api/v1
VITE_GOOGLE_CLIENT_ID=production_google_client_id
```

---

## 7.6 Post-Deployment Checklist

### Backend Health Check
- [ ] Backend URL accessible
- [ ] Database connection works
- [ ] API endpoints respond
- [ ] CORS configured correctly
- [ ] Environment variables set

### Frontend Health Check
- [ ] Frontend URL accessible
- [ ] API calls work
- [ ] Google OAuth works
- [ ] All pages load
- [ ] Mobile responsive

### Security Check
- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] JWT secret is strong
- [ ] Google OAuth configured
- [ ] CORS restricted to frontend domain

---

## 8. Best Practices from TarkVtark.com

### 8.1 Code Organization

**DO ✅**
- Use layered architecture (Controller → Service → Repository)
- Keep controllers thin (routing only)
- Put business logic in services
- Use DTOs for API contracts
- Separate concerns clearly

**DON'T ❌**
- Don't put business logic in controllers
- Don't expose entities directly
- Don't mix concerns
- Don't hardcode values

### 8.2 Database Design

**DO ✅**
- Use UUIDs for primary keys
- Add indexes on foreign keys
- Use constraints (NOT NULL, UNIQUE)
- Add meaningful column comments
- Use proper data types

**DON'T ❌**
- Don't use auto-increment IDs for distributed systems
- Don't forget indexes
- Don't allow NULL on foreign keys
- Don't skip constraints

### 8.3 API Design

**DO ✅**
- Use RESTful conventions
- Return proper HTTP status codes
- Version your API (/api/v1)
- Document your endpoints
- Validate input data
- Handle errors gracefully

**DON'T ❌**
- Don't return 200 for errors
- Don't expose internal errors
- Don't skip validation
- Don't forget pagination for lists

### 8.4 Security

**DO ✅**
- Use HTTPS in production
- Validate all input
- Sanitize output
- Use prepared statements (JPA does this)
- Hash passwords (bcrypt)
- Use JWT for stateless auth
- Set secure headers

**DON'T ❌**
- Don't store passwords in plain text
- Don't trust user input
- Don't expose stack traces
- Don't commit secrets to git
- Don't skip CORS configuration

### 8.5 Performance

**DO ✅**
- Use connection pooling
- Add database indexes
- Cache static content
- Minimize API calls
- Use pagination
- Optimize images

**DON'T ❌**
- Don't load all data at once
- Don't skip indexes
- Don't over-fetch data
- Don't make unnecessary API calls

### 8.6 Error Handling

**DO ✅**
- Use global exception handler
- Return consistent error format
- Log errors properly
- Show user-friendly messages
- Handle async errors

**DON'T ❌**
- Don't show stack traces to users
- Don't ignore errors
- Don't use generic error messages
- Don't crash on errors

### 8.7 Git Workflow

**DO ✅**
- Use meaningful commit messages
- Create feature branches
- Review code before merging
- Keep commits small and focused
- Use .gitignore properly

**DON'T ❌**
- Don't commit .env files
- Don't commit node_modules
- Don't commit build files
- Don't use vague commit messages

### 8.8 Testing

**DO ✅**
- Test critical paths
- Mock external dependencies
- Test error cases
- Use test database
- Run tests before deployment

**DON'T ❌**
- Don't skip tests
- Don't test against production DB
- Don't ignore failing tests
- Don't only test happy paths

---

## 9. Troubleshooting Common Issues

### Backend Issues

**Issue: Database connection failed**
```
Solution:
1. Check SPRING_DATASOURCE_URL is correct
2. Verify database is running
3. Check username/password
4. Ensure ?sslmode=require for Neon
```

**Issue: Port already in use**
```
Solution:
1. Change SERVER_PORT in .env
2. Or kill process on port 8080
```

**Issue: CORS errors**
```
Solution:
1. Add frontend URL to @CrossOrigin
2. Check CORS configuration
3. Ensure preflight requests work
```

### Frontend Issues

**Issue: API calls failing**
```
Solution:
1. Check VITE_API_BASE_URL is correct
2. Verify backend is running
3. Check CORS configuration
4. Check auth token is being sent
```

**Issue: Google OAuth not working**
```
Solution:
1. Verify VITE_GOOGLE_CLIENT_ID is set
2. Check authorized origins in Google Console
3. Ensure redirect URIs are configured
```

### Deployment Issues

**Issue: Build fails on Render**
```
Solution:
1. Ensure Maven Wrapper exists (mvnw)
2. Check build command is correct
3. Verify Java version (17+)
4. Check pom.xml for errors
```

**Issue: Vercel build fails**
```
Solution:
1. Check build command: npm run build
2. Verify output directory: dist
3. Check environment variables
4. Ensure vite.config.js is correct
```

---

## 10. Maintenance & Monitoring

### Monitoring

**Backend (Render.com):**
- Check logs: Dashboard → Logs
- Monitor metrics: CPU, Memory usage
- Set up alerts for errors

**Frontend (Vercel):**
- Check deployments: Dashboard → Deployments
- Monitor analytics
- Check error logs

### Backups

**Database (Neon):**
- Automatic backups enabled
- Download backups: Dashboard → Backups
- Test restore procedure

### Updates

**Dependencies:**
```bash
# Backend
cd backend
./mvnw versions:display-dependency-updates

# Frontend
cd frontend
npm outdated
```

---

## Summary

**Deployment Complete:** ✅

**Production URLs:**
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.onrender.com/api/v1`
- Database: Neon PostgreSQL Cloud

**Best Practices Covered:**
- ✅ Code organization
- ✅ Database design
- ✅ API design
- ✅ Security
- ✅ Performance
- ✅ Error handling
- ✅ Git workflow
- ✅ Testing

---

**✅ Full-Stack CRUD Application Complete!**

You now have a production-ready task manager application deployed and running!

---

*This is Part 6 - Final Part of the Full-Stack CRUD Guide*


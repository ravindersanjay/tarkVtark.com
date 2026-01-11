# 🚀 Render.com Deployment Guide - TarkVtark Backend

## Issue Fixed ✅

**Problem:** `bash: line 1: ./mvnw: No such file or directory`

**Solution:** Maven Wrapper files have been added to the project root.

---

## Files Added for Deployment

### ✅ Maven Wrapper Files (Now in Git)
```
mvnw           - Maven Wrapper script (Linux/Mac)
mvnw.cmd       - Maven Wrapper script (Windows)
.mvn/          - Maven Wrapper configuration directory
```

### ✅ Render Configuration
```
render.yaml    - Render.com service configuration (optional)
```

---

## Deployment Steps on Render.com

### Step 1: Commit and Push Maven Wrapper Files

```bash
# Navigate to project root
cd /mnt/d/temp/tarkVtark.com

# Add Maven Wrapper files to git
git add mvnw mvnw.cmd .mvn/
git add render.yaml

# Commit
git commit -m "Add Maven Wrapper for Render.com deployment"

# Push to GitHub
git push origin main
```

### Step 2: Configure Render.com

1. **Go to:** https://dashboard.render.com
2. **Click:** "New +" → "Web Service"
3. **Connect:** Your GitHub repository

### Step 3: Configure Build Settings

**Build Command:**
```bash
cd backend && ./mvnw clean package -DskipTests
```

**OR** (if mvnw is in project root):
```bash
./mvnw clean package -DskipTests -f backend/pom.xml
```

**Start Command:**
```bash
cd backend && java -Dserver.port=$PORT -jar target/*.jar
```

**Environment:**
- Select: **Java**
- Region: **Singapore** (or closest to your users)
- Instance Type: **Free** (or Starter for production)

### Step 4: Set Environment Variables

Add these environment variables in Render.com dashboard:

#### Required Variables:

```bash
# Database (Use your Neon DB credentials)
SPRING_DATASOURCE_URL=jdbc:postgresql://ep-curly-queen-a1tu44g3-pooler.ap-southeast-1.aws.neon.tech:5432/neondb?sslmode=require
SPRING_DATASOURCE_USERNAME=neondb_owner
SPRING_DATASOURCE_PASSWORD=npg_TfMWjGuX81EY

# Server Configuration
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=prod

# Security
JWT_SECRET=TarkVtark2026SecureJWTSecretKeyForDebateArenaApplicationMinimum32Characters
JWT_EXPIRATION_MS=86400000
BCRYPT_STRENGTH=12

# Admin User
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin@2026
ADMIN_EMAIL=admin@tarkvtark.com
ADMIN_FULL_NAME=System Administrator

# Google OAuth
GOOGLE_CLIENT_ID=310921464230-b38mm3qmhm17sbekfplh6t0ou9tn8tio.apps.googleusercontent.com

# File Upload
FILE_BASE_URL=https://your-app-name.onrender.com
FILE_UPLOAD_DIR=./uploads
FILE_MAX_SIZE=10485760
```

**⚠️ IMPORTANT:**
- Replace `your-app-name` with your actual Render.com app name
- Keep all passwords secure
- Don't expose these values publicly

### Step 5: Deploy

1. **Click:** "Create Web Service"
2. **Wait:** Render.com will build and deploy (5-10 minutes)
3. **Monitor:** Build logs for any errors

---

## Expected Build Output

```
==> Cloning from https://github.com/ravindersanjay/tarkVtark.com
==> Checking out commit...
==> Using Node.js version 22.16.0
==> Running build command './mvnw clean package -DskipTests'...
[INFO] Scanning for projects...
[INFO] Building debate-backend 1.0.0
[INFO] Compiling 42 source files
[INFO] BUILD SUCCESS
==> Build succeeded 🎉
==> Deploying...
==> Your service is live 🎉
```

---

## Post-Deployment Configuration

### Update Google OAuth Authorized URLs

1. **Go to:** https://console.cloud.google.com
2. **Navigate to:** APIs & Services → Credentials
3. **Edit OAuth 2.0 Client ID**
4. **Add to Authorized JavaScript origins:**
   ```
   https://your-app-name.onrender.com
   ```
5. **Add to Authorized redirect URIs:**
   ```
   https://your-app-name.onrender.com/auth/callback
   ```

### Update Frontend API URL

Update frontend to point to Render.com backend:

```javascript
// frontend/src/services/apiService.js
const API_BASE_URL = 'https://your-app-name.onrender.com/api/v1';
```

---

## Troubleshooting

### Issue: "No such file or directory: ./mvnw"

**Solution:** ✅ FIXED - Maven Wrapper files now included

### Issue: "Cannot find main manifest attribute"

**Cause:** JAR file not built correctly

**Fix:** Add to `pom.xml`:
```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
        </plugin>
    </plugins>
</build>
```

### Issue: "Port already in use"

**Cause:** Hardcoded port 8080

**Fix:** Use Render's PORT environment variable:
```bash
# Start command:
java -Dserver.port=$PORT -jar target/*.jar
```

### Issue: Database connection failed

**Cause:** Wrong database URL or credentials

**Fix:** 
1. Verify Neon DB is accessible from internet
2. Check credentials in Render.com environment variables
3. Ensure `?sslmode=require` is in connection string

### Issue: Build timeout

**Cause:** Dependencies taking too long to download

**Fix:** Use Render.com Starter plan (has more resources)

---

## Render.com Configuration Files

### Option 1: Using render.yaml (Infrastructure as Code)

Create `render.yaml` in project root:

```yaml
services:
  - type: web
    name: tarkvtark-backend
    env: java
    region: singapore
    plan: free
    buildCommand: cd backend && mvn clean package -DskipTests
    startCommand: cd backend && java -Dserver.port=$PORT -jar target/*.jar
    envVars:
      - key: SPRING_DATASOURCE_URL
        sync: false
      - key: SPRING_DATASOURCE_USERNAME
        sync: false
      - key: SPRING_DATASOURCE_PASSWORD
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: ADMIN_PASSWORD
        sync: false
      - key: GOOGLE_CLIENT_ID
        sync: false
```

### Option 2: Using Render Dashboard (Manual)

Configure everything through the web UI (easier for beginners)

---

## Cost Estimates

### Free Tier
- ✅ 750 hours/month free
- ✅ Sleeps after 15 min of inactivity
- ✅ Cold start: ~30 seconds
- ⚠️ Good for development/testing

### Starter Plan ($7/month)
- ✅ Always on (no sleep)
- ✅ Faster performance
- ✅ Custom domains
- ✅ Better for production

---

## Monitoring Your Deployment

### Check Logs
```bash
# In Render.com dashboard:
1. Go to your service
2. Click "Logs" tab
3. Monitor real-time logs
```

### Health Check Endpoint
```
https://your-app-name.onrender.com/api/v1/topics
```

Should return: `200 OK` with list of topics

---

## Security Checklist

Before going live:

- [ ] Change default admin password
- [ ] Use strong JWT secret
- [ ] Enable HTTPS (Render provides free SSL)
- [ ] Configure CORS properly
- [ ] Don't commit `.env` to git
- [ ] Use Render.com secret environment variables
- [ ] Update Google OAuth allowed origins
- [ ] Enable rate limiting (add to code)
- [ ] Monitor error logs

---

## Next Steps

1. ✅ Commit Maven Wrapper files to git
2. ✅ Push to GitHub
3. ✅ Create Render.com account
4. ✅ Deploy backend
5. ✅ Update Google OAuth settings
6. ✅ Deploy frontend (separate service or Vercel/Netlify)
7. ✅ Test end-to-end

---

## Quick Deploy Commands

```bash
# 1. Add files to git
git add mvnw mvnw.cmd .mvn/ render.yaml

# 2. Commit
git commit -m "Add Maven Wrapper and Render config for deployment"

# 3. Push
git push origin main

# 4. Go to Render.com dashboard and deploy!
```

---

## Alternative: Deploy Backend Folder Only

If you want to deploy only the backend folder:

**Render.com Settings:**
- Root Directory: `backend`
- Build Command: `mvn clean package -DskipTests`
- Start Command: `java -Dserver.port=$PORT -jar target/*.jar`

---

## Summary

✅ **Issue Fixed:** Maven Wrapper files added  
✅ **Ready to Deploy:** All configuration files created  
✅ **Next Step:** Commit and push to GitHub, then deploy on Render.com  

**Estimated deployment time:** 10-15 minutes

---

**Go to Render.com and deploy your backend!** 🚀


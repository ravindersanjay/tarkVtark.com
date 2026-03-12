# **AWS AMPLIFY - FRONTEND DEPLOYMENT GUIDE**

**Date**: March 12, 2026  
**Project**: TarkVtark Debate Arena  
**Status**: Ready for Amplify Deployment

---

## **PREREQUISITES**

Before starting, ensure you have:
- ✅ AWS Account created
- ✅ Frontend code pushed to GitHub
- ✅ IAM user with Amplify permissions
- ✅ GitHub personal access token (already have from earlier)

---

## **STEP 1: PREPARE FRONTEND CODE**

### **1.1: Verify Environment Configuration**

Check `frontend/.env`:
```bash
cat frontend/.env
```

Should contain:
```env
VITE_API_URL=http://localhost:8080/api/v1
VITE_GOOGLE_CLIENT_ID=310921464230-tmc47j716puuupbol9fvoev1l03238pd.apps.googleusercontent.com
```

### **1.2: Update for Production**

Create `frontend/.env.production`:
```env
VITE_API_URL=https://your-backend-domain.com/api/v1
VITE_GOOGLE_CLIENT_ID=310921464230-tmc47j716puuupbol9fvoev1l03238pd.apps.googleusercontent.com
```

### **1.3: Commit Changes**

```bash
cd /mnt/d/temp/tarkVtark.com
git add frontend/.env.production
git commit -m "feat: Add production environment config for Amplify"
git push origin main
```

---

## **STEP 2: CREATE AWS AMPLIFY APP**

### **2.1: Open AWS Console**

1. Go to: `https://console.aws.amazon.com`
2. Search for: **Amplify**
3. Click on **AWS Amplify** service

### **2.2: Create New App**

1. Click **"Create app"** button
2. Select **"Deploy an app"**
3. Choose **GitHub** as the repository service
4. Click **"Authorize"** (if first time)

### **2.3: Connect GitHub Repository**

1. You'll be redirected to GitHub authorization page
2. Click **"Authorize aws-amplify"**
3. Back in Amplify, select your repository:
   - **Repository**: `ravindersanjay/tarkVtark.com`
   - **Branch**: `main`
4. Click **"Next"**

---

## **STEP 3: CONFIGURE BUILD SETTINGS**

### **3.1: Configure Build**

The build settings screen appears. Update as follows:

**Project name:**
```
debate-arena-frontend
```

**Build and deploy settings:**

Leave the auto-detected settings OR manually configure:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: frontend/dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### **3.2: Environment Variables**

Add environment variables (optional if using .env files):

| Key | Value |
|-----|-------|
| VITE_API_URL | `https://your-backend-domain.com/api/v1` |
| VITE_GOOGLE_CLIENT_ID | `310921464230-tmc47j716puuupbol9fvoev1l03238pd.apps.googleusercontent.com` |

### **3.3: Review and Deploy**

1. Review all settings
2. Click **"Save and deploy"**
3. Amplify will:
   - Pull code from GitHub
   - Install dependencies
   - Build React app
   - Deploy to CloudFront CDN

---

## **STEP 4: WAIT FOR DEPLOYMENT**

### **4.1: Monitor Deployment**

Watch the **Deployment Status**:

```
Status: Provisioning → Building → Deploying → Live
```

Expected time: **2-5 minutes**

### **4.2: Check Build Logs**

If any errors occur:
1. Click on the failed deployment
2. View build logs
3. Check for error messages

### **4.3: Deployment Complete**

Once status shows **"Live"**, you'll see:
- ✅ Deployment URL (e.g., `https://main.xxxxx.amplifyapp.com`)
- ✅ Build time
- ✅ Deployment date

---

## **STEP 5: CONFIGURE CUSTOM DOMAIN (OPTIONAL)**

### **5.1: Add Custom Domain**

1. In Amplify console, click **"Domain management"**
2. Click **"Add domain"**
3. Enter your domain: `debatemanch.com`
4. Choose subdomain management options
5. Update DNS records as instructed

### **5.2: Enable HTTPS**

Amplify automatically provisions SSL certificates for custom domains.

---

## **STEP 6: ENVIRONMENT VARIABLES FOR PRODUCTION**

### **6.1: Add Backend URL**

Once Elastic Beanstalk is deployed, update API URL:

1. In Amplify console, click **"App settings"** → **"Environment variables"**
2. Add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-beanstalk-domain.com/api/v1`
3. Click **"Save"**
4. Redeploy: Click **"Deployments"** → **"Redeploy this version"**

---

## **STEP 7: TEST AMPLIFY DEPLOYMENT**

### **7.1: Access Frontend**

1. Open deployment URL in browser
2. Verify:
   - ✅ App loads
   - ✅ No console errors
   - ✅ Styling looks correct
   - ✅ Images load

### **7.2: Check Build Artifacts**

Navigate to different pages to verify:
- ✅ Home page
- ✅ Debates list
- ✅ Create debate (may need backend)
- ✅ Responsive design works

### **7.3: Monitor Performance**

In Amplify console:
1. Click **"Monitoring"**
2. Check:
   - ✅ Page load times
   - ✅ Error rates
   - ✅ Build success rate

---

## **STEP 8: ENABLE AUTO-DEPLOYMENTS**

### **8.1: Auto-Deploy Settings**

By default, Amplify auto-deploys on every push to `main` branch.

To verify or change:

1. Click **"App settings"** → **"General"**
2. Find **"Repository settings"**
3. Ensure **"Auto builds"** is enabled for `main` branch

### **8.2: Test Auto-Deploy**

1. Make a small change to frontend code
2. Commit and push:
   ```bash
   git commit -am "test: Auto-deploy verification"
   git push origin main
   ```
3. Watch Amplify console - should auto-deploy
4. Verify changes appear in production

---

## **TROUBLESHOOTING**

### **Build Fails with "npm: not found"**
- Amplify needs Node.js
- Check build settings have `npm ci` command
- Verify `package.json` exists in frontend folder

### **App Loads But API Calls Fail (403 Error)**
- Update `VITE_API_URL` to backend domain
- Ensure backend CORS is configured correctly
- Restart deployment after changing env vars

### **Static Files Not Loading**
- Check `vite.config.js` has correct `base` path
- Verify build output folder is `dist`
- Check artifacts path in build settings

### **Build Takes Too Long**
- Install only production dependencies: `npm ci --production`
- Use build cache effectively
- Consider code-splitting for large bundles

---

## **REFERENCE**

**Amplify Deployment URL Format:**
```
https://[branch-name].xxxxxxxxxxxxx.amplifyapp.com
```

**Production URL (with custom domain):**
```
https://www.debatemanch.com
```

---

## **NEXT STEPS**

1. ✅ Deploy frontend to Amplify
2. ⏳ Deploy backend to Elastic Beanstalk (see next guide)
3. ⏳ Configure S3 for file storage
4. ⏳ Update environment variables after all services are deployed

---

**Amplify Deployment Complete!** 🚀



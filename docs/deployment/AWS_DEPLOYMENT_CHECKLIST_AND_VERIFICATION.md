# **AWS DEPLOYMENT CHECKLIST & VERIFICATION TESTS**

**Date**: March 12, 2026  
**Project**: TarkVtark Debate Arena  
**Stack**: Amplify + Beanstalk + S3 + Neon

---

## **PRE-DEPLOYMENT CHECKLIST**

### **Code Preparation**

- [ ] All code committed to GitHub
- [ ] No uncommitted changes: `git status`
- [ ] Latest code pushed: `git push origin main`
- [ ] Backend compiles: `mvn clean compile`
- [ ] Frontend builds: `npm run build`
- [ ] No critical ESLint warnings
- [ ] No critical security warnings: `npm audit`

### **Environment Files**

- [ ] `.env` file exists in backend folder
- [ ] `.env` file exists in frontend folder
- [ ] Sensitive data NOT committed to git
- [ ] `.env` added to `.gitignore`
- [ ] `.env.example` uploaded with placeholder values

### **Database**

- [ ] Neon PostgreSQL database created
- [ ] Database URL in backend `.env`: `SPRING_DATASOURCE_URL=...`
- [ ] Database credentials correct
- [ ] Database connection tested locally
- [ ] Initial schema created

### **AWS Setup**

- [ ] AWS Account created and verified
- [ ] IAM user created with appropriate permissions
- [ ] AWS CLI configured (optional)
- [ ] Amplify service enabled in AWS
- [ ] Elastic Beanstalk service enabled
- [ ] S3 service enabled
- [ ] EC2 Key pair created (for SSH access)

### **Frontend Configuration**

- [ ] `VITE_API_URL` points to correct backend
- [ ] `VITE_GOOGLE_CLIENT_ID` configured
- [ ] Build output directory is `dist/`
- [ ] No hardcoded IP addresses
- [ ] No hardcoded API URLs (use env vars)

### **Backend Configuration**

- [ ] All environment variables set
- [ ] Database URL correct for Neon
- [ ] JWT secret configured
- [ ] Admin credentials set
- [ ] File upload directory configured
- [ ] CORS configuration correct

### **S3 Bucket**

- [ ] S3 bucket created: `debate-arena-uploads`
- [ ] Bucket in correct region: `us-east-1`
- [ ] Bucket policy configured
- [ ] CORS policy configured
- [ ] IAM user created with S3 permissions
- [ ] Access keys generated and saved

---

## **DEPLOYMENT STEPS CHECKLIST**

### **Phase 1: Backend (Elastic Beanstalk)**

- [ ] Build production JAR: `mvn clean package -DskipTests`
- [ ] JAR file created: `backend/target/debate-backend-1.0.0.jar`
- [ ] JAR file size ~50MB: `ls -lh backend/target/debate-backend-1.0.0.jar`
- [ ] Create Elastic Beanstalk application
- [ ] Create environment: `production`
- [ ] Select platform: Java + Corretto 17
- [ ] Upload JAR file
- [ ] Configure instance type: `t2.micro`
- [ ] Configure load balancer: Application Load Balancer
- [ ] Add all environment variables in Beanstalk
- [ ] Deploy application
- [ ] Wait for status: "Ready" or "OK" (5-10 minutes)
- [ ] Check health: Green indicator
- [ ] Record Beanstalk URL: `https://your-app.elasticbeanstalk.com`

### **Phase 2: Storage (S3)**

- [ ] Create S3 bucket: `debate-arena-uploads`
- [ ] Enable encryption: SSE-S3
- [ ] Block public access: Enabled
- [ ] Add bucket policy
- [ ] Add CORS policy
- [ ] Create IAM user: `debate-arena-s3-user`
- [ ] Attach S3 permissions to user
- [ ] Generate access keys
- [ ] Save keys securely
- [ ] Note AWS_REGION: `us-east-1`

### **Phase 3: Frontend (Amplify)**

- [ ] Update `frontend/.env.production` with Beanstalk URL
- [ ] Commit changes to GitHub
- [ ] Push to main branch
- [ ] Create Amplify app
- [ ] Connect GitHub repository
- [ ] Select branch: `main`
- [ ] Configure build settings (auto-detected OK)
- [ ] Add environment variables (optional)
- [ ] Deploy application
- [ ] Wait for status: "Live" (2-5 minutes)
- [ ] Check build logs for errors
- [ ] Record Amplify URL: `https://main.xxxxx.amplifyapp.com`

### **Phase 4: Configuration (Integration)**

- [ ] Update Amplify env var: `VITE_API_URL` = Beanstalk URL
- [ ] Redeploy Amplify (triggers auto-redeploy)
- [ ] Update Beanstalk: Database is Neon connected
- [ ] Verify S3 environment variables in Beanstalk
- [ ] Set FILE_PROVIDER=s3 in Beanstalk
- [ ] Redeploy Beanstalk

---

## **VERIFICATION TEST SUITE**

### **Test 1: Backend Health Check**

**Objective:** Verify backend is running and accessible

```bash
curl -v https://your-beanstalk-url.elasticbeanstalk.com/api/v1/health
```

**Expected response:**
```json
{
  "status": "UP",
  "timestamp": "2026-03-12T20:00:00Z"
}
```

**Status:** 200 OK ✅ or ❌

### **Test 2: Topics Endpoint**

**Objective:** Verify public GET endpoint works

```bash
curl -v https://your-beanstalk-url.elasticbeanstalk.com/api/v1/topics
```

**Expected response:**
```json
[
  {
    "id": "uuid",
    "name": "Hindu vs Muslim",
    "description": "...",
    "totalDebates": 5,
    "createdAt": "2026-03-12T12:00:00Z"
  }
]
```

**Status:** 200 OK ✅ or ❌

### **Test 3: Admin Login**

**Objective:** Verify authentication works

```bash
curl -X POST \
  https://your-beanstalk-url.elasticbeanstalk.com/api/v1/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@2026"}'
```

**Expected response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "admin",
  "email": "admin@tarkvtark.com"
}
```

**Status:** 200 OK ✅ or ❌

### **Test 4: CORS Preflight**

**Objective:** Verify CORS headers are correct

```bash
curl -v -X OPTIONS \
  https://your-beanstalk-url.elasticbeanstalk.com/api/v1/topics \
  -H "Origin: https://your-amplify-url.amplifyapp.com" \
  -H "Access-Control-Request-Method: GET"
```

**Expected response headers:**
```
Access-Control-Allow-Origin: https://your-amplify-url.amplifyapp.com ✅
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS ✅
```

**Status:** 200 OK ✅ or ❌

### **Test 5: Frontend Loads**

**Objective:** Verify frontend app loads in browser

1. Open: `https://your-amplify-url.amplifyapp.com`
2. Check:
   - ✅ Page loads (no blank white page)
   - ✅ No console errors (DevTools → Console)
   - ✅ Content visible (debates, topics, etc.)
   - ✅ Styling applied (Tailwind CSS works)
   - ✅ Images load

**Status:** Success ✅ or ❌

### **Test 6: Debates Load**

**Objective:** Verify topics/debates data fetches from API

1. Frontend app already open
2. Check:
   - ✅ No "Failed to load topics" error
   - ✅ Debate list visible
   - ✅ Each debate shows name, description, stats

**Console should show:**
```
GET /api/v1/topics 200 OK
Response time: <1000ms
```

**Status:** Success ✅ or ❌

### **Test 7: File Upload**

**Objective:** Verify file upload to S3 works

1. Frontend: Click "Create Question"
2. Fill form and try to upload an image
3. Check:
   - ✅ Upload succeeds (no error message)
   - ✅ File appears in S3 console
   - ✅ Response time <5 seconds

**In S3 console:**
1. Go to `debate-arena-uploads` bucket
2. Check "Objects" tab
3. Should see uploaded file ✅

**Status:** Success ✅ or ❌

### **Test 8: File Download**

**Objective:** Verify file download from S3 works

1. Frontend: Click the uploaded file/image
2. Check:
   - ✅ File displays or downloads
   - ✅ No 403 error
   - ✅ File is correct

**Browser console:**
```
GET /api/v1/files/filename 302 Found
Location: https://s3.amazonaws.com/...
```

**Status:** Success ✅ or ❌

### **Test 9: Database Connection**

**Objective:** Verify backend can read/write to database

1. Frontend: Try creating a new debate
2. Check:
   - ✅ No database errors
   - ✅ Debate appears in list
   - ✅ Data persists on refresh

**Backend logs should show:**
```
INSERT INTO debates (id, name, ...) VALUES (...)
SELECT * FROM debates
```

**Status:** Success ✅ or ❌

### **Test 10: HTTPS/Security**

**Objective:** Verify HTTPS is enabled everywhere

1. Check URLs:
   - Frontend: `https://...` ✅ (not http)
   - Backend: `https://...` ✅ (not http)
   - API calls: Use HTTPS ✅

2. Browser address bar:
   - Green lock icon 🔒 ✅
   - No security warnings ✅

**Status:** Success ✅ or ❌

### **Test 11: Responsive Design**

**Objective:** Verify app works on mobile

1. Desktop: Open DevTools → Responsive Design Mode
2. Test sizes:
   - ✅ Mobile (320px)
   - ✅ Tablet (768px)
   - ✅ Desktop (1024px)
3. Check:
   - ✅ Layout adjusts
   - ✅ No horizontal scroll
   - ✅ Buttons clickable

**Status:** Success ✅ or ❌

### **Test 12: Error Handling**

**Objective:** Verify graceful error handling

1. Stop backend (temporarily)
2. Refresh frontend
3. Check:
   - ✅ Error message shown
   - ✅ No console errors
   - ✅ App doesn't crash

4. Restart backend
5. Check:
   - ✅ Auto-retry or manual retry works
   - ✅ Data loads again

**Status:** Success ✅ or ❌

---

## **PERFORMANCE TESTS**

### **Test 13: Page Load Time**

**Objective:** Verify acceptable page load time

Use Chrome DevTools **Network** tab:

```
Document: < 3 seconds ✅
Fully loaded: < 5 seconds ✅
API response time: < 1 second ✅
```

### **Test 14: Bundle Size**

**Objective:** Verify frontend bundle is optimized

```bash
npm run build
# Check output:
# dist/index.html: < 1MB ✅
# dist/assets/index-xxx.js: < 500KB ✅ (warning at 500KB is OK)
```

### **Test 15: Backend Latency**

**Objective:** Verify backend response times are acceptable

```bash
# Time a GET request
time curl https://your-beanstalk-url.elasticbeanstalk.com/api/v1/topics

# Should complete in < 1 second
```

---

## **ROLLBACK PROCEDURES**

### **Rollback Amplify**

1. In Amplify console, go to **"Deployments"**
2. Find previous successful deployment
3. Click **"Redeploy this version"**
4. Frontend reverts to previous version

### **Rollback Beanstalk**

1. In Beanstalk, go to **"Application versions"**
2. Select previous working version
3. Click **"Deploy"**
4. Backend reverts to previous version

### **Rollback Database** (if needed)

Neon provides:
1. Point-in-time recovery
2. Automated backups
3. Branch restoration

Contact Neon support if needed.

---

## **MONITORING SETUP**

### **CloudWatch Alarms (Recommended)**

Set up alerts for:
- [ ] Backend CPU > 80%
- [ ] Backend memory > 85%
- [ ] Database connection errors
- [ ] 5xx error rate > 1%

### **Amplify Monitoring**

1. Go to **"Monitoring"** tab
2. Check:
   - Build success rate
   - Deployment time
   - Error rates

### **Beanstalk Monitoring**

1. Go to **"Monitoring"** tab
2. Check:
   - CPU utilization
   - Network in/out
   - Instance health
   - Application logs

---

## **SIGN-OFF CHECKLIST**

**After completing all tests above, sign off:**

- [ ] All 15 tests passed ✅
- [ ] No critical errors in logs
- [ ] Performance acceptable
- [ ] Database connected
- [ ] S3 file upload/download works
- [ ] HTTPS enabled
- [ ] Responsive design verified
- [ ] Error handling works
- [ ] Ready for production ✅

---

## **AFTER DEPLOYMENT**

### **Daily Checks**

- [ ] Check Amplify monitoring
- [ ] Check Beanstalk monitoring
- [ ] Check AWS billing (should be $0 or minimal)
- [ ] Review error logs

### **Weekly Checks**

- [ ] Backup database (or verify automated backups)
- [ ] Update dependencies if critical security patches
- [ ] Monitor user feedback
- [ ] Check S3 storage usage

### **Monthly Tasks**

- [ ] Rotate AWS access keys
- [ ] Review and optimize costs
- [ ] Update security policies
- [ ] Performance tuning if needed

---

## **EMERGENCY CONTACTS**

| Service | Support |
|---------|---------|
| AWS | https://console.aws.amazon.com/support |
| Neon DB | https://support.neon.tech |
| Domain | Your registrar |

---

**Deployment Complete!** 🎉



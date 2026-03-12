# **AWS DEPLOYMENT - MASTER GUIDE**

**Date**: March 12, 2026  
**Project**: TarkVtark Debate Arena  
**Stack**: React + Spring Boot + PostgreSQL on AWS

---

## **OVERVIEW**

This master guide provides a complete roadmap for deploying your application to AWS.

### **Architecture**

```
Internet Users
      ↓
   Route 53 (Optional DNS)
      ↓
   Amplify (Frontend)
   ├─ React app
   ├─ Static hosting
   ├─ Global CDN
   └─ Auto-deployments from GitHub
      ↓ (API calls via HTTPS)
   Elastic Beanstalk (Backend)
   ├─ Spring Boot app
   ├─ Load balancer
   ├─ Auto-scaling
   └─ Health monitoring
      ↓ (File operations)
   S3 (File Storage)
   ├─ Attachment uploads
   ├─ File serving
   └─ Access control
      ↓ (Database queries)
   Neon (PostgreSQL)
   ├─ Data persistence
   ├─ Backups
   └─ External service
```

---

## **QUICK START - 5 STEPS**

### **Step 1: Prepare (30 minutes)**

```bash
# 1. Commit all code
git add .
git commit -m "Deploy to AWS"
git push origin main

# 2. Build backend JAR
cd backend
mvn clean package -DskipTests

# 3. Build frontend
cd frontend
npm run build
```

**Verify:** JAR exists (`backend/target/debate-backend-1.0.0.jar`)

### **Step 2: AWS Setup (20 minutes)**

1. Create AWS account: `https://aws.amazon.com`
2. Create IAM user for deployment
3. Create S3 bucket: `debate-arena-uploads`
4. Generate IAM access keys for S3
5. Create Neon database (if not done)

### **Step 3: Deploy Backend (15 minutes)**

See: **AWS_ELASTIC_BEANSTALK_DEPLOYMENT_GUIDE.md**

1. Go to Elastic Beanstalk
2. Create application: `debate-arena-backend`
3. Upload JAR file
4. Add environment variables (6 from `.env`)
5. Deploy and wait ~10 minutes

### **Step 4: Deploy Frontend (10 minutes)**

See: **AWS_AMPLIFY_DEPLOYMENT_GUIDE.md**

1. Go to Amplify
2. Connect GitHub repository
3. Select `main` branch
4. Deploy and wait ~3 minutes

### **Step 5: Verify (10 minutes)**

See: **AWS_DEPLOYMENT_CHECKLIST_AND_VERIFICATION.md**

1. Run 15 verification tests
2. Check all tests pass ✅
3. Done!

**Total time: ~65 minutes**

---

## **DETAILED DEPLOYMENT GUIDES**

### **1. AWS Amplify (Frontend)**
📄 **File:** `AWS_AMPLIFY_DEPLOYMENT_GUIDE.md`
- Create frontend app
- Configure build settings
- Auto-deployments
- Custom domain setup
- Troubleshooting

### **2. AWS Elastic Beanstalk (Backend)**
📄 **File:** `AWS_ELASTIC_BEANSTALK_DEPLOYMENT_GUIDE.md`
- Create backend environment
- Configure environment variables
- Health checks & monitoring
- Auto-scaling
- Troubleshooting

### **3. AWS S3 (File Storage)**
📄 **File:** `AWS_S3_DEPLOYMENT_GUIDE.md`
- Create S3 bucket
- Configure bucket policy & CORS
- Create IAM user
- Generate access keys
- Security best practices

### **4. Code Migration (R2 → S3)**
📄 **File:** `CODE_MIGRATION_R2_TO_S3_GUIDE.md`
- Code changes already done
- Configuration required
- Testing migration
- Rollback procedures

### **5. Deployment Checklist**
📄 **File:** `AWS_DEPLOYMENT_CHECKLIST_AND_VERIFICATION.md`
- Pre-deployment checks
- Deployment step checklist
- 15 verification tests
- Performance tests
- Rollback procedures

---

## **REQUIRED INFORMATION**

Before deploying, have these ready:

### **AWS Account**
```
AWS Account ID:          XXXXXXXXXXXX
AWS Region:              us-east-1
IAM User:                deployment-user
Access Key ID:           AKIA...
Secret Access Key:       wJal...
```

### **Database (Neon)**
```
Database Host:           ep-xxx.ap-southeast-1.aws.neon.tech
Database Name:           neondb
Database User:           neondb_owner
Database Password:       npg_...
Connection String:       jdbc:postgresql://ep-xxx...
```

### **Google OAuth**
```
Google Client ID:        310921464230-...
Client Secret:           (if needed)
Authorized Redirect URI: https://your-domain/auth/callback
```

### **GitHub**
```
Repository:              ravindersanjay/tarkVtark.com
Branch:                  main
GitHub Token:            ghp_... (for CI/CD)
```

### **Domains (Optional)**
```
Frontend Domain:         www.debatemanch.com (or amplifyapp.com)
Backend Domain:          api.debatemanch.com (or elasticbeanstalk.com)
Root Domain:             debatemanch.com (if using custom)
```

---

## **STEP-BY-STEP DEPLOYMENT**

### **Phase 1: Pre-Deployment (Day 1)**

**[ ] Code Review**
- All changes committed to GitHub
- No sensitive data in code
- `.env` in `.gitignore`
- `.env.example` has placeholder values

**[ ] Build & Test**
- Backend builds: `mvn clean package`
- Frontend builds: `npm run build`
- Local testing passes
- No console errors

**[ ] AWS Account Setup**
- Account created
- Billing enabled
- IAM user created
- Permissions configured

**[ ] Database Setup**
- Neon PostgreSQL created
- Connection string ready
- Credentials secured
- Backups configured

### **Phase 2: AWS Service Setup (Day 2)**

**[ ] S3 Bucket**
- Bucket created: `debate-arena-uploads`
- Bucket policy applied
- CORS configured
- IAM user with access keys

**[ ] Database Configuration**
- Neon database ready
- Connection tested
- Credentials in `.env`

**[ ] GitHub Repository**
- Code pushed to `main` branch
- `.env.example` committed
- No sensitive data in repo

### **Phase 3: Backend Deployment (Day 3)**

**[ ] Elastic Beanstalk**
1. Create application
2. Upload backend JAR
3. Configure environment (t2.micro)
4. Add all environment variables
5. Deploy application
6. Wait for health check: Green ✅
7. Note Beanstalk URL

**[ ] Verify Backend**
- Test health endpoint: `/api/v1/health`
- Test public endpoint: `/api/v1/topics`
- Test admin login: `/api/v1/admin/login`
- Check logs: No errors

### **Phase 4: Frontend Deployment (Day 3)**

**[ ] Update Environment**
```env
VITE_API_URL=https://your-beanstalk-url.elasticbeanstalk.com/api/v1
```

**[ ] Commit & Push**
```bash
git add frontend/.env.production
git commit -m "Update API URL for Beanstalk"
git push origin main
```

**[ ] Amplify**
1. Create application
2. Connect GitHub repository
3. Select branch: `main`
4. Deploy application
5. Wait for build complete: "Live" ✅
6. Note Amplify URL

### **Phase 5: Integration & Testing (Day 4)**

**[ ] Verify All Systems**
- Run 15 verification tests
- All tests pass ✅
- No critical errors
- Performance acceptable

**[ ] Update DNS (Optional)**
- Configure Route 53 (if using custom domain)
- Add A records for frontend & backend
- Wait for DNS propagation (5-10 minutes)

**[ ] Security Hardening**
- Enable HTTPS (automatic)
- Configure security headers
- Enable WAF rules
- Set up monitoring

### **Phase 6: Post-Deployment (Day 5)**

**[ ] Monitoring Setup**
- CloudWatch alarms configured
- Error notifications enabled
- Performance monitoring active

**[ ] Backup Verification**
- Database backups configured
- S3 versioning enabled
- Application logs retention set

**[ ] Documentation**
- URL list documented
- Credentials stored securely
- Runbook created
- Incident procedures documented

---

## **DEPLOYMENT TIMELINE**

```
Day 1: Preparation (4-6 hours)
  - Code review and testing
  - AWS account setup
  - Database setup

Day 2: AWS Services (2-3 hours)
  - S3 bucket creation
  - IAM user setup
  - GitHub push

Day 3: Application Deploy (2-3 hours)
  - Backend deployment (10 min)
  - Frontend deployment (5 min)
  - Verification (30 min)

Day 4: Testing (1-2 hours)
  - 15 verification tests
  - Performance tests
  - Security checks

Day 5: Finalization (1 hour)
  - Monitoring setup
  - Backups verification
  - Documentation

TOTAL: 10-16 hours over 5 days
```

---

## **ESTIMATED COSTS**

### **First 12 Months (Free Tier)**

```
AWS Amplify:        $0   (15GB storage + 50GB bandwidth)
AWS Beanstalk:      $0   (750 hours t2.micro)
AWS S3:             $0   (5GB storage + 40k requests)
Neon Database:      $0   (10GB)
─────────────────────────
TOTAL:              $0/month
```

### **After Free Tier (Months 13+)**

```
AWS Amplify:        $2-5/month
AWS Beanstalk:      $8-15/month
AWS S3:             $1-3/month
Neon Database:      $0-10/month
─────────────────────────
TOTAL:              $11-33/month
```

---

## **TROUBLESHOOTING**

### **Amplify Build Fails**

Check: `AWS_AMPLIFY_DEPLOYMENT_GUIDE.md` → Troubleshooting section

Common issues:
- Missing npm dependencies
- Wrong build directory
- Environment variables not set

### **Beanstalk Health Check Failing**

Check: `AWS_ELASTIC_BEANSTALK_DEPLOYMENT_GUIDE.md` → Troubleshooting section

Common issues:
- Database connection fails
- Environment variables missing
- Java version mismatch

### **S3 Upload Fails**

Check: `AWS_S3_DEPLOYMENT_GUIDE.md` → Troubleshooting section

Common issues:
- Access denied (IAM permissions)
- Bucket policy incorrect
- CORS not configured

### **Frontend Can't Connect to Backend**

Causes:
- [ ] Amplify API_URL wrong
- [ ] Beanstalk security group blocks traffic
- [ ] CORS not configured
- [ ] Backend health check failing

Fix:
1. Verify Beanstalk URL: `curl https://...elasticbeanstalk.com/api/v1/health`
2. Verify CORS: Check response headers have `Access-Control-Allow-Origin`
3. Update Amplify `VITE_API_URL` and redeploy

---

## **MONITORING & MAINTENANCE**

### **Daily**
- [ ] Check AWS console status
- [ ] Monitor error logs
- [ ] Check uptime

### **Weekly**
- [ ] Review metrics (CPU, memory, traffic)
- [ ] Check security alerts
- [ ] Backup verification

### **Monthly**
- [ ] Cost review
- [ ] Security patches
- [ ] Performance optimization
- [ ] Capacity planning

---

## **ROLLBACK PLAN**

If something goes wrong:

### **Rollback Amplify**
1. Go to Amplify → Deployments
2. Select previous working deployment
3. Click "Redeploy this version"
4. Frontend reverts in <1 minute

### **Rollback Beanstalk**
1. Go to Beanstalk → Application versions
2. Select previous working version
3. Click "Deploy"
4. Backend reverts in <5 minutes

### **Rollback Database**
- Contact Neon support for recovery
- Or restore from automated backup

---

## **SUCCESS CRITERIA**

Deployment is successful when:

✅ All 15 verification tests pass  
✅ Frontend loads without errors  
✅ Backend API responds with 200 status  
✅ Database connections work  
✅ File upload to S3 works  
✅ HTTPS enabled everywhere  
✅ Performance acceptable (<1s response time)  
✅ No critical errors in logs  
✅ Health checks green  
✅ Auto-deployments working  

---

## **NEXT ACTIONS**

1. **Read all deployment guides:**
   - AWS_AMPLIFY_DEPLOYMENT_GUIDE.md
   - AWS_ELASTIC_BEANSTALK_DEPLOYMENT_GUIDE.md
   - AWS_S3_DEPLOYMENT_GUIDE.md
   - CODE_MIGRATION_R2_TO_S3_GUIDE.md
   - AWS_DEPLOYMENT_CHECKLIST_AND_VERIFICATION.md

2. **Follow the guides step-by-step** (Takes ~3-5 hours)

3. **Run verification tests** (Takes ~30 minutes)

4. **Go live!** 🚀

---

## **SUPPORT**

If you encounter issues:

1. Check troubleshooting sections in each guide
2. Review AWS CloudWatch logs
3. Check application logs in Beanstalk
4. Review browser console for frontend errors
5. Test individual endpoints with curl

---

**Happy Deploying!** 🚀🎉



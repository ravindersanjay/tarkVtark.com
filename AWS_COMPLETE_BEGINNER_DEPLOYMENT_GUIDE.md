# **AWS DEPLOYMENT - COMPLETE BEGINNER'S GUIDE (2026 UI)**

**Date**: March 13, 2026  
**Level**: Complete Beginner  
**Time**: 2-3 hours total  
**For**: People new to AWS

---

## **WHAT IS AWS?**

AWS = Amazon Web Services

**Think of it as:** A company that rents computer servers on the internet

**You pay for:**
- ✅ How much computer power you use
- ✅ How much data you store
- ✅ How much data you transfer

**You DON'T pay for:**
- ✓ First 12 months (free tier)
- ✓ Small usage (free tier limits)

---

## **WHAT ARE WE DEPLOYING?**

Your TarkVtark Debate Arena has 4 parts:

```
1. FRONTEND (React)        → AWS Amplify
   ├─ Your web app
   ├─ HTML/CSS/JavaScript
   └─ What users see

2. BACKEND (Spring Boot)   → AWS Elastic Beanstalk
   ├─ Your API server
   ├─ Processes data
   └─ Handles logic

3. DATABASE (PostgreSQL)   → Neon (External)
   ├─ Stores all data
   ├─ User data, debates, etc.
   └─ Already setup

4. FILE STORAGE (S3)       → AWS S3
   ├─ Stores uploaded files
   ├─ Images, videos, etc.
   └─ Cheap storage
```

---

## **DEPLOYMENT FLOWCHART**

```
┌─────────────────────────────────────────┐
│  Start Here: AWS Account Setup          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Step 1: Create S3 Bucket               │
│  (File storage)                         │
│  Time: 15 minutes                       │
│  Guide: AWS_S3_DETAILED_BEGINNER_GUIDE  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Step 2: Deploy Backend (Beanstalk)     │
│  (Your API server)                      │
│  Time: 30 minutes                       │
│  Guide: AWS_ELASTIC_BEANSTALK_DETAILED_ │
│         BEGINNER_GUIDE                  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Step 3: Deploy Frontend (Amplify)      │
│  (Your website)                         │
│  Time: 20 minutes                       │
│  Guide: AWS_AMPLIFY_DETAILED_BEGINNER_  │
│         GUIDE                           │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  DONE! Your app is LIVE! 🎉             │
│  Users can access it from anywhere      │
└─────────────────────────────────────────┘
```

---

## **WHAT YOU NEED BEFORE STARTING**

### **Checklist:**

- [ ] **AWS Account**: Go to `https://aws.amazon.com` and create free account
- [ ] **AWS Credit Card**: You need valid credit card (won't be charged for free tier)
- [ ] **GitHub Account**: Your code is hosted here (already done)
- [ ] **Backend Built**: Run `mvn clean package -DskipTests`
- [ ] **Frontend Built**: Run `npm run build`
- [ ] **Code Pushed**: Push to GitHub `main` branch
- [ ] **Neon Database**: PostgreSQL database URL ready
- [ ] **Google OAuth**: Client ID ready (already have: `310921464230-...`)

---

## **STEP-BY-STEP DEPLOYMENT GUIDE**

### **STEP 1: Setup AWS Account (15 minutes)**

**If you already have AWS account, skip to Step 2**

1. Go to: `https://aws.amazon.com`
2. Click **"Create AWS Account"**
3. Fill in email, password, account name
4. Add credit card (for verification, won't charge)
5. Verify identity via phone
6. Choose support plan: **Free plan** (Fine for now)
7. Click **"Complete sign up"**
8. Wait for activation (usually instant)
9. Login to AWS Console: `https://console.aws.amazon.com`

**Save your:**
- AWS Account ID (shown in top right)
- AWS Region (set to: `us-east-1`)

---

### **STEP 2: Create S3 Bucket for File Storage (20 minutes)**

**Purpose:** Upload and store files (images, documents, etc.)

**Follow:** `AWS_S3_DETAILED_BEGINNER_GUIDE.md`

**This guide covers:**
- Creating S3 bucket
- Setting up security
- Creating IAM user
- Generating credentials
- Updating backend .env

**After this step, you'll have:**
- ✓ S3 bucket: `debate-arena-uploads`
- ✓ IAM user: `debate-arena-s3-user`
- ✓ Access Key ID: `AKIA...`
- ✓ Secret Access Key: `wJal...`

**Save these credentials!**

---

### **STEP 3: Build Backend JAR File (5 minutes)**

**Purpose:** Create packaged backend app

**Run in terminal:**

```bash
cd /mnt/d/temp/tarkVtark.com/backend
mvn clean package -DskipTests
```

**Wait for:**
```
[INFO] BUILD SUCCESS
```

**File created:**
```
backend/target/debate-backend-1.0.0.jar (~50MB)
```

---

### **STEP 4: Deploy Backend to Elastic Beanstalk (40 minutes)**

**Purpose:** Run your backend server on AWS

**Follow:** `AWS_ELASTIC_BEANSTALK_DETAILED_BEGINNER_GUIDE.md`

**This guide covers:**
- Creating Elastic Beanstalk application
- Uploading JAR file
- Configuring environment variables
- Setting up database connection
- Adding S3 credentials
- Testing backend

**After this step, you'll have:**
- ✓ Beanstalk application running
- ✓ Backend URL: `http://debate-arena-backend-env.elasticbeanstalk.com`
- ✓ Health check passing: `/api/v1/health` → 200 OK
- ✓ Status: **"Ready"** (Green)

**Copy this URL - you'll need it for Amplify!**

---

### **STEP 5: Build Frontend (5 minutes)**

**Purpose:** Create optimized production frontend app

**Run in terminal:**

```bash
cd /mnt/d/temp/tarkVtark.com/frontend
npm run build
```

**Wait for:**
```
✓ built in X.XXs
```

**Folder created:**
```
frontend/dist/
```

---

### **STEP 6: Deploy Frontend to Amplify (25 minutes)**

**Purpose:** Host your website globally

**Follow:** `AWS_AMPLIFY_DETAILED_BEGINNER_GUIDE.md`

**This guide covers:**
- Connecting GitHub repository
- Configuring build settings
- Setting environment variables
- Deploying to Amplify
- Auto-deployments setup
- Testing frontend

**After this step, you'll have:**
- ✓ Amplify application running
- ✓ Frontend URL: `https://main.xxxxxxxxxxxxx.amplifyapp.com`
- ✓ Frontend connected to backend
- ✓ Status: **"Live"** ✅
- ✓ Topics loading from backend

---

## **YOUR DEPLOYED URLS**

After all steps, you'll have:

```
Frontend (Amplify):
https://main.xxxxxxxxxxxxx.amplifyapp.com

Backend (Beanstalk):
http://debate-arena-backend-env.elasticbeanstalk.com

Database (Neon - already exists):
[Your Neon PostgreSQL URL]

File Storage (S3):
https://s3.amazonaws.com/debate-arena-uploads
```

---

## **VERIFY EVERYTHING WORKS**

### **Test 1: Frontend Loads**
1. Open: `https://main.xxxxxxxxxxxxx.amplifyapp.com`
2. Should see: Home page with debates list
3. No errors, no blank page

### **Test 2: Backend Responds**
```bash
curl http://debate-arena-backend-env.elasticbeanstalk.com/api/v1/health
```
Should return:
```json
{"status":"UP"}
```

### **Test 3: Topics Load**
1. Frontend should show debates
2. Topics list appears
3. No "Failed to load" error

### **Test 4: File Upload** (if applicable)
1. Create question with file
2. Upload file
3. File appears in S3 bucket

---

## **COST CALCULATOR**

### **First 12 Months (FREE TIER)**

```
✓ Amplify:    $0 (15GB storage + 50GB bandwidth)
✓ Beanstalk:  $0 (750 hours t2.micro instance)
✓ S3:         $0 (5GB storage + 40k requests)
✓ Neon:       $0 (10GB database)
─────────────────
TOTAL:        $0/month

Includes free tier for 12 months!
```

### **After 12 Months (ESTIMATED)**

```
~ Amplify:    $2-5/month
~ Beanstalk:  $8-15/month  (t2.micro costs ~$0.013/hour)
~ S3:         $1-3/month
~ Neon:       $10-20/month (if you upgrade)
─────────────────
TOTAL:        $21-43/month

(Depends on usage)
```

**For your project:**
- Low traffic (< 1000 users/month)
- Small storage (<5GB)
- Should be very cheap

---

## **WHAT IF SOMETHING GOES WRONG?**

### **Problem: Frontend shows white blank page**

**Check:**
1. Open DevTools: F12
2. Go to Console tab
3. Look for red errors
4. Check Network tab - did API call fail?

**Fix:**
1. Is Beanstalk URL correct in Amplify?
2. Is backend still running?
3. Update env variable and redeploy

### **Problem: Backend not responding**

**Check:**
1. Go to Beanstalk dashboard
2. Is status "Ready"? (Should be green)
3. If red/yellow, check logs
4. Verify database connection

**Fix:**
1. SSH into instance (advanced)
2. Check logs: See troubleshooting guide
3. Restart application

### **Problem: File upload fails**

**Check:**
1. Are S3 credentials correct?
2. Is IAM user permissions set?
3. Is CORS configured?

**Fix:**
1. Verify credentials in Beanstalk env vars
2. Check S3 bucket permissions
3. Update if needed

---

## **NEXT: CUSTOM DOMAIN (OPTIONAL)**

### **Add Your Own Domain Name**

Instead of `xxxxxxxxxxxxx.amplifyapp.com`, use `debatemanch.com`

**Steps:**
1. Go to Amplify Dashboard
2. Click "Domain management"
3. Add your domain
4. Update DNS records at your registrar

**Advanced - can skip for now**

---

## **SUMMARY: WHAT YOU JUST DID**

```
✅ Created S3 bucket for files
✅ Generated AWS credentials
✅ Deployed backend to Beanstalk
✅ Connected backend to database
✅ Deployed frontend to Amplify
✅ Connected frontend to backend
✅ Setup auto-deployments from GitHub
✅ Your app is now LIVE on the internet!
```

**Users can now access your app from anywhere!**

---

## **IMPORTANT THINGS TO REMEMBER**

### **Security:**
- ✅ Never share AWS credentials (S3 keys)
- ✅ Keep credentials in `.env` file only
- ✅ Never commit `.env` to Git
- ✅ AWS will alert you if credentials leaked

### **Maintenance:**
- ✅ Monitor AWS costs (free tier has limits)
- ✅ Check logs if app goes down
- ✅ Backup important data
- ✅ Keep backend code updated

### **Auto-Deploy:**
```bash
# When you push code, Amplify auto-deploys
git push origin main
# ↓ Amplify detects, builds, and deploys
# ↓ Takes 2-3 minutes
# ↓ Your changes are LIVE!
```

---

## **DETAILED GUIDES (IN ORDER)**

1. **AWS_S3_DETAILED_BEGINNER_GUIDE.md** (20 min)
   - Create S3 bucket
   - Setup IAM user
   - Get credentials

2. **AWS_ELASTIC_BEANSTALK_DETAILED_BEGINNER_GUIDE.md** (40 min)
   - Deploy backend
   - Configure database
   - Setup environment variables

3. **AWS_AMPLIFY_DETAILED_BEGINNER_GUIDE.md** (25 min)
   - Deploy frontend
   - Connect to backend
   - Setup auto-deploy

---

## **HELPFUL AWS LINKS**

- **AWS Console**: https://console.aws.amazon.com
- **S3 Console**: https://s3.console.aws.amazon.com/
- **Amplify Console**: https://console.aws.amazon.com/amplify/
- **Beanstalk Console**: https://console.aws.amazon.com/elasticbeanstalk/
- **IAM Console**: https://console.aws.amazon.com/iam/

---

## **COMMON QUESTIONS**

### **Q: How much will this cost?**
**A:** Free for 12 months. After that, ~$20-40/month for your usage level.

### **Q: How do I update my app after deployment?**
**A:** Just push to GitHub! Amplify auto-deploys.

### **Q: Can I use a custom domain?**
**A:** Yes! See "Custom Domain" section.

### **Q: What if I need to scale up?**
**A:** Change instance type from t2.micro to larger (paid).

### **Q: How do I monitor costs?**
**A:** AWS Billing Dashboard shows current costs.

### **Q: Can I delete the app later?**
**A:** Yes! Delete from each service (Amplify, Beanstalk, S3).

---

## **SUPPORT & HELP**

**If you get stuck:**

1. Check the detailed guide for that service
2. Look at "Troubleshooting" section
3. Check AWS documentation
4. Ask on AWS forums
5. Contact AWS support (available for paid plans)

---

## **CONGRATULATIONS!** 🎉

**Your app is now:**
- ✅ Deployed to AWS
- ✅ Running 24/7
- ✅ Accessible globally
- ✅ Auto-updating from GitHub
- ✅ Professional-grade infrastructure

**You're officially a cloud developer!**

---

**Next: Follow the detailed guides in order!**

Start with: `AWS_S3_DETAILED_BEGINNER_GUIDE.md`



# **AWS MIGRATION GUIDE - Complete Stack Migration**

**Date**: March 12, 2026  
**Project**: TarkVtark Debate Arena  
**Plan**: Migrate from Vercel (Frontend) + Render (Backend) + Cloudflare R2 (Storage) → **AWS (All-in-One)**

---

## **EXECUTIVE SUMMARY**

Your project stack:
- **Frontend**: React (Vite) - currently on Vercel
- **Backend**: Spring Boot 3.2 (Java 17) - currently on Render  
- **Database**: PostgreSQL (Neon) - keep as is
- **Storage**: Cloudflare R2 → **Migrate to AWS S3**

### **Recommended AWS Stack** ✅

| Component | Current | AWS Recommendation | Why |
|-----------|---------|-------------------|-----|
| **Frontend** | Vercel | **AWS Amplify** | Best for React, built for SPA, auto-deploy from Git |
| **Backend** | Render | **AWS Elastic Beanstalk** | Best for Spring Boot, managed, scales easily |
| **Storage** | R2 | **AWS S3** | Industry standard, same cost, better ecosystem |
| **Database** | Neon (external) | Keep Neon OR **AWS RDS** | Neon is fine, or move to RDS for full AWS |

---

## **DETAILED AWS SERVICE RECOMMENDATIONS**

### **1. FRONTEND: AWS Amplify** ✅ (RECOMMENDED)

**What it is**: Managed hosting for static sites and SPAs (Single Page Applications)

**Perfect for your project because**:
- ✅ Built for React applications
- ✅ Automatic deployments from GitHub
- ✅ FREE tier includes: 15GB storage + 50GB bandwidth/month
- ✅ Built-in CI/CD pipeline
- ✅ Custom domain support
- ✅ HTTPS by default
- ✅ Same cost as Vercel (~$1-5/month for your usage)
- ✅ Integrates with AWS ecosystem

**How it works**:
1. Push React code to GitHub
2. AWS Amplify auto-detects and deploys
3. Built site hosted on AWS CDN
4. Public URL or custom domain

**Alternative**: AWS CloudFront + S3 (more manual, cheaper but complex)

---

### **2. BACKEND: AWS Elastic Beanstalk** ✅ (RECOMMENDED)

**What it is**: Managed service for deploying web applications (Java, Python, Node, etc.)

**Perfect for your project because**:
- ✅ Native support for Spring Boot
- ✅ Automatic scaling based on traffic
- ✅ Managed environment - no server management
- ✅ FREE tier: 750 hours/month t2.micro instance
- ✅ Environment variables support
- ✅ Auto-rollback on failed deployments
- ✅ Easy database connection (to RDS or external)
- ✅ LoadBalancer built-in
- ✅ Health monitoring included

**How it works**:
1. Push Spring Boot code to GitHub or upload JAR
2. Elastic Beanstalk deploys automatically
3. Manages scaling, patching, monitoring
4. Public URL for API

**Alternative**: AWS EC2 (more control, more management)

---

### **3. STORAGE: AWS S3** ✅ (FINAL)

**What it is**: Object storage service

**Your current plan**: Already using S3 for storage ✓

**Benefits**:
- ✅ Industry standard
- ✅ FREE tier: 5GB storage + 20,000 GET requests/month
- ✅ Same SDK as R2 (code changes minimal)
- ✅ Better integration with other AWS services
- ✅ More reliable (99.9% uptime SLA)
- ✅ Pay-as-you-go pricing

**Cost comparison**:
- Cloudflare R2: ~$0 for free tier (then $0.015/GB)
- AWS S3: FREE tier 5GB (then $0.023/GB)
- **For your usage**: Likely FREE on both

---

### **4. DATABASE: Keep Neon OR Move to RDS**

**Option A: Keep Neon (Recommended)** ✅
- ✅ Neon is PostgreSQL-as-a-Service (best-in-class)
- ✅ No need to move - just update connection string
- ✅ Better than self-managed RDS for small projects
- ✅ Simple, reliable, affordable

**Option B: Move to AWS RDS** (If you want everything in AWS)
- ✅ Fully managed PostgreSQL on AWS
- ✅ Automated backups, scaling
- ✅ Same backend code, just change connection string
- ⚠️ Slightly more expensive than Neon (~$15-30/month)
- ⚠️ More overhead to manage

**Recommendation**: **Keep Neon** - better value, already working

---

## **COST COMPARISON**

### **Current Stack (Vercel + Render + R2)**
```
Vercel Frontend:    $0-5/month (FREE tier)
Render Backend:     $7/month (free tier: $0, paid: $7+)
Cloudflare R2:      $0/month (FREE tier)
Neon Database:      $0/month (FREE tier)
────────────────────────────────
TOTAL:              $7-12/month
```

### **New Stack (AWS Amplify + Beanstalk + S3 + Neon)**
```
AWS Amplify:        $0/month (FREE tier: 15GB storage + 50GB/month bandwidth)
AWS Beanstalk:      $0/month (FREE tier: 750 hours t2.micro)
AWS S3:             $0/month (FREE tier: 5GB storage + 20k requests)
Neon Database:      $0/month (FREE tier)
────────────────────────────────
TOTAL:              $0/month (ALL FREE!)
```

### **For medium usage (after free tier)**
```
AWS Amplify:        ~$2-5/month
AWS Beanstalk:      ~$10-20/month (depends on t2 instance size)
AWS S3:             ~$1-3/month (storage + requests)
────────────────────────────────
TOTAL:              ~$15-30/month
```

**Better than current**: You get more features for similar cost

---

## **MIGRATION CHECKLIST**

### **Phase 1: AWS Account Setup** (15 minutes)
- [ ] Create AWS account at `https://aws.amazon.com`
- [ ] Verify email
- [ ] Set up billing alerts
- [ ] Create IAM user (not root account)
- [ ] Generate AWS Access Key for IAM user

### **Phase 2: Frontend Migration** (30 minutes)
- [ ] Create AWS Amplify app
- [ ] Connect to GitHub repo
- [ ] Configure build settings
- [ ] Deploy frontend
- [ ] Test with backend API

### **Phase 3: Backend Migration** (45 minutes)
- [ ] Create Elastic Beanstalk environment
- [ ] Upload Spring Boot JAR or connect GitHub
- [ ] Configure environment variables (6 AWS S3 vars)
- [ ] Set up database connection to Neon
- [ ] Deploy backend
- [ ] Test API endpoints

### **Phase 4: Storage Migration** (30 minutes)
- [ ] Create AWS S3 bucket
- [ ] Generate AWS access keys for S3
- [ ] Update backend code (change R2 to S3 SDK)
- [ ] Update Beanstalk environment variables
- [ ] Test file upload/download

### **Phase 5: Testing & Cutover** (1 hour)
- [ ] Test all features end-to-end
- [ ] Update DNS/domain settings
- [ ] Switch traffic from Vercel/Render to AWS
- [ ] Monitor logs
- [ ] Keep Vercel/Render as backup (1-2 days)

---

## **AWS SERVICES COMPARISON TABLE**

| Service | Frontend | Backend | Storage |
|---------|----------|---------|---------|
| **AWS Amplify** | ✅ BEST | - | - |
| **CloudFront + S3** | ✅ Good | - | - |
| **AWS AppRunner** | - | ✅ Good | - |
| **Elastic Beanstalk** | - | ✅ BEST | - |
| **EC2** | - | ✅ Manual | - |
| **Lambda** | - | ❌ Overkill | - |
| **S3** | - | - | ✅ BEST |
| **EBS** | - | - | ❌ Wrong | - |

---

## **STEP-BY-STEP MIGRATION PLAN**

### **Week 1: Preparation**
1. Create AWS account
2. Set up IAM user
3. Generate credentials
4. Plan cutover date

### **Week 2: Frontend Migration**
1. Create Amplify app
2. Connect GitHub
3. Deploy to Amplify
4. Point domain to Amplify (if using custom domain)
5. Test with current Render backend

### **Week 3: Backend Migration**
1. Create Elastic Beanstalk environment
2. Configure environment variables
3. Deploy Spring Boot app
4. Point Amplify to new backend URL
5. Test end-to-end

### **Week 4: Storage Migration**
1. Create S3 bucket
2. Update backend code (R2 → S3)
3. Deploy updated backend
4. Test file upload/download
5. Migrate any existing files (if needed)

### **Week 5: Testing & Cutover**
1. Full end-to-end testing
2. Performance testing
3. Switch DNS (if using custom domain)
4. Monitor logs
5. Keep backups running

---

## **CODE CHANGES NEEDED**

### **Frontend: Minimal Changes** ✅
- Update API endpoint URL from `render-backend` to `beanstalk-backend`
- That's it! AWS Amplify hosts static React same as Vercel

### **Backend: S3 Configuration Changes**
Change from Cloudflare R2 SDK to AWS S3 SDK (similar code):

**Current (R2):**
```java
@Value("${r2.endpoint}")
private String r2Endpoint;

@Value("${r2.access-key-id}")
private String accessKey;

@Value("${r2.secret-access-key}")
private String secretKey;
```

**New (S3):**
```java
@Value("${aws.s3.region}")
private String region;

@Value("${aws.access-key-id}")
private String accessKey;

@Value("${aws.secret-access-key}")
private String secretKey;
```

The code logic stays 90% the same!

---

## **AWS AMPLIFY DETAILED GUIDE**

### **Setup Steps:**
1. Go to `https://console.aws.amazon.com/amplify`
2. Click "Create new app" → "Deploy an app"
3. Select GitHub and authorize
4. Choose your repository
5. Select branch: `main`
6. Configure build settings:
   ```
   Build output directory: dist/
   Build command: npm run build
   ```
7. Deploy!

**Automatic updates**:
- Every push to `main` → auto-deploys
- No manual steps needed

---

## **AWS ELASTIC BEANSTALK DETAILED GUIDE**

### **Setup Steps:**
1. Go to `https://console.aws.amazon.com/elasticbeanstalk`
2. Click "Create application"
3. Name: `debate-arena-backend`
4. Platform: Java
5. Upload code: Spring Boot JAR
6. Create environment: `production`
7. Configure:
   - Instance type: `t2.micro` (free tier)
   - Environment variables (6 AWS S3 vars)
8. Deploy!

---

## **AWS S3 BUCKET SETUP**

### **Setup Steps:**
1. Go to `https://console.aws.amazon.com/s3`
2. Click "Create bucket"
3. Name: `debate-arena-uploads` (must be globally unique)
4. Region: Same as Beanstalk (e.g., us-east-1)
5. Settings: Keep public access disabled (secure)
6. Create access keys via IAM
7. Add to environment variables in Beanstalk

---

## **IMPORTANT CONSIDERATIONS**

### **Pros of AWS Migration** ✅
- ✅ Everything in one ecosystem
- ✅ Better cost at scale
- ✅ More features and integrations
- ✅ Better for global users (multiple regions)
- ✅ Enterprise-grade reliability
- ✅ Same free tier coverage
- ✅ AWS ecosystem skills valuable

### **Cons of AWS Migration** ⚠️
- ⚠️ Slightly steeper learning curve
- ⚠️ More configuration options (can be overwhelming)
- ⚠️ Need AWS account setup
- ⚠️ Console is more complex than Vercel/Render
- ⚠️ Pricing can escalate faster if not monitored

---

## **MIGRATION RISK MITIGATION**

### **Keep Everything Running** (Safety First)
```
Week 1-3: Deploy AWS stack in parallel
          Keep Vercel/Render/R2 running
          
Week 4: Point traffic to AWS (can revert anytime)
        Keep old stack as backup for 1-2 days
        
Week 5: After confident, decommission old stack
```

**Zero downtime migration!**

---

## **COMPARISON: Amplify vs Netlify vs Vercel** (Frontend)

| Feature | Amplify | Netlify | Vercel |
|---------|---------|---------|---------|
| Price | $0-10 | $0-20 | $0-10 |
| React Support | ✅ | ✅ | ✅✅ |
| Auto-deploy | ✅ | ✅ | ✅ |
| AWS Integration | ✅✅✅ | - | - |
| Learning Curve | Medium | Easy | Very Easy |
| Recommendation | **BEST** | Good | Easy |

---

## **COMPARISON: Beanstalk vs AppRunner vs EC2** (Backend)

| Feature | Beanstalk | AppRunner | EC2 |
|---------|-----------|-----------|-----|
| Price | $0-30 | $0-50 | $0-100 |
| Spring Boot Support | ✅✅✅ | ✅ | ✅✅✅ |
| Auto-scaling | ✅ | ✅ | ❌ (manual) |
| Management | Managed | Managed | Unmanaged |
| Learning Curve | Easy | Easy | Hard |
| Recommendation | **BEST** | Good | Pro Only |

---

## **FINAL RECOMMENDATION** 🎯

### **Best AWS Stack for Your Project:**

```
┌─────────────────────────────────────────┐
│  AWS AMPLIFY (Frontend)                 │
│  - React hosting (dist/ folder)         │
│  - Auto-deploy from GitHub              │
│  - FREE tier 15GB + 50GB/month          │
└─────────────────────────────────────────┘
         ↓ API calls ↓
┌─────────────────────────────────────────┐
│  AWS ELASTIC BEANSTALK (Backend)        │
│  - Spring Boot deployment               │
│  - t2.micro instance (free tier)        │
│  - Auto-scaling included                │
│  - Environment variables support        │
└─────────────────────────────────────────┘
         ↓ File storage ↓
┌─────────────────────────────────────────┐
│  AWS S3 (Storage)                       │
│  - File uploads (attachments)           │
│  - FREE tier: 5GB + 20k requests        │
│  - Server-side encryption enabled       │
└─────────────────────────────────────────┘
         ↓ Database ↓
┌─────────────────────────────────────────┐
│  NEON (PostgreSQL)                      │
│  - Keep current setup                   │
│  - No changes needed                    │
│  - FREE tier                            │
└─────────────────────────────────────────┘
```

---

## **TOTAL MIGRATION TIME**

- **Planning**: 1 day
- **AWS Setup**: 1 day
- **Frontend Migration**: 1 day
- **Backend Migration**: 1-2 days
- **Storage Migration**: 1 day
- **Testing**: 1-2 days

**Total: 1-2 weeks**

---

## **NEXT STEPS**

### **Immediate Actions:**
1. Create AWS account: `https://aws.amazon.com`
2. Review this guide
3. Plan migration timeline
4. Create test environment first

### **Then:**
I can provide:
1. ✅ Detailed AWS Amplify setup guide
2. ✅ Detailed Elastic Beanstalk setup guide
3. ✅ AWS S3 setup and code changes
4. ✅ Environment variables configuration
5. ✅ Migration checklist with scripts

---

**Ready to proceed with AWS migration?** Let me know and I'll create detailed step-by-step guides for each service! 🚀



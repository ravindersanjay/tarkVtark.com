# **AWS SERVICES VISUAL COMPARISON CHARTS**

---

## **FRONTEND HOSTING: AMPLIFY vs CloudFront+S3**

### **Setup Complexity**

```
AMPLIFY:
┌─ Go to AWS Amplify
│  └─ Connect GitHub
│     └─ Done! ✅ (10 minutes)

CLOUDFRONT+S3:
┌─ Create S3 bucket
│  ├─ Upload dist/ folder
│  └─ Create CloudFront distribution
│     ├─ Configure origin
│     ├─ Set SSL certificate
│     ├─ Configure caching
│     └─ Point domain
│        └─ Done (2-3 hours)
```

### **Deployment Flow**

```
AMPLIFY:
You push code to GitHub
           ↓
Amplify detects ✅ (automatic)
           ↓
Runs "npm run build" ✅ (automatic)
           ↓
Deploys to CloudFront ✅ (automatic)
           ↓
Live! ✅ (2-5 minutes total)

CLOUDFRONT+S3:
You push code to GitHub (nothing happens)
           ↓
You manually run "npm run build"
           ↓
You manually upload to S3
           ↓
You manually invalidate CloudFront
           ↓
You wait for cache clear
           ↓
Live! (10-15 minutes manual work)
```

### **Cost Over Time**

```
AMPLIFY:
$20 ┤
    │     ┌──────────────── (scales with traffic)
$10 ┤    /
    │   /
 $0 ┤──┘────────────────────────
    └─ Free tier for 12+ months

CLOUDFRONT+S3:
$20 ┤
    │ ┌─────────────────────── (bandwidth heavy)
$10 ┤/
    │
 $0 ┤────────────────────────
    └─ Free tier, then flat cost
```

### **Features Matrix**

```
                    AMPLIFY      CLOUDFRONT+S3
Auto-deploy         ✅ YES       ❌ NO
Build management    ✅ AUTO      ❌ MANUAL
CI/CD included      ✅ YES       ❌ NO
Preview deploys     ✅ YES       ❌ NO
Rollback            ✅ 1-click   ⚠️ Manual
Global CDN          ✅ Included  ✅ Included
Custom domain       ✅ Easy      ⚠️ Complex
Monitoring          ✅ Built-in  ⚠️ Limited
Environment vars    ✅ YES       ⚠️ Build-time
Learning curve      🟢 EASY      🔴 HARD
Price               💰 $2-15     💰 $5-15
Recommendation      ⭐⭐⭐⭐⭐    ⭐⭐
```

---

## **BACKEND HOSTING: Beanstalk vs EC2 vs AppRunner vs Lambda**

### **Setup Time Comparison**

```
Lambda:          ████ (30 min - but not recommended)
AppRunner:       ███████ (1-2 hours)
Beanstalk:       ███ (30 minutes) ⭐ BEST
EC2:             ████████████ (2-4 hours)
```

### **Monthly Cost Comparison** (After free tier)

```
Lambda:
FREE
 $0 ┤┐
    │└─────────────────────────────────
$20 │ (but has problems: slow, not ideal)

Beanstalk:
    ┌──────────────────────────────────
$20 ┤│ t2.small + LB: ~$25/month ⭐ BEST
$10 ┤│
 $0 ┤└────────── (t2.micro: free tier)

AppRunner:
$50 ┤ ┌────────────────────────────────
$40 ┤ │ (expensive: $18-50/month) ❌
$30 ┤ │
$20 ┤ │
$10 ┤ │
 $0 ┤ └ (no free tier)

EC2:
$50 ┤
$40 ┤ ┌──────────────────────────────
$30 ┤ │ t2.small: ~$17-35/month
$20 ┤ │
$10 ┤ │
 $0 ┤ └─ (t2.micro: free tier)
```

### **Complexity Matrix**

```
                EASY              HARD
Setup           Beanstalk ✅
Management      AppRunner
Scaling         Lambda (auto)
Operations      EC2 ❌

Legend:
✅ = Easy for beginners
⚠️ = Medium (some learning)
❌ = Hard (DevOps knowledge)
```

### **Spring Boot Compatibility**

```
BEANSTALK:  ⭐⭐⭐⭐⭐ (5/5) - PERFECT FIT
            - Native Spring Boot support
            - Auto-detects JAR
            - Zero configuration needed

EC2:        ⭐⭐⭐⭐⭐ (5/5) - Works great
            - Full control
            - But manual setup

AppRunner:  ⭐⭐⭐ (3/5) - Works, but overkill
            - Needs Docker image
            - More complexity

Lambda:     ⭐ (1/5) - NOT RECOMMENDED
            - Cold start: 5-15 seconds ❌
            - Heavy framework overhead
            - Not designed for continuous APIs
```

### **Cold Start Performance** (First request after idle)

```
Beanstalk:
Time: <1 second ✅ (always warm)
      ┌─────
      │ 0ms
      └─────────────────────────────────

AppRunner:
Time: ~2-3 seconds ⚠️
      ┌──────────────────
      │ 2000ms
      └─────────────────────────────────

Lambda:
Time: 5-15 seconds ❌ (users wait!)
      ┌──────────────────────────────────
      │ 5000-15000ms (TOO SLOW!)
      └─────────────────────────────────

EC2:
Time: <1 second ✅ (always running)
      ┌─────
      │ 0ms
      └─────────────────────────────────
```

### **Auto-Scaling Capability**

```
BEANSTALK:  ✅✅✅ Built-in, automatic, easy
            1 instance
                ↓ (traffic increases)
            2 instances
                ↓ (more traffic)
            4 instances
            (Load balancer distributes)

EC2:        ⚠️ Manual, need Auto Scaling Group
            (More setup required)

AppRunner:  ✅✅ Built-in, but expensive
            (Each request-based unit is $)

Lambda:     ✅✅✅ Auto scales infinitely
            BUT: cold starts + cost model
```

### **Feature Comparison**

```
                    BEANSTALK   EC2     APPRUNNER   LAMBDA
Managed service     ✅ YES      ❌ NO   ✅ YES      ✅ YES
Auto-scaling        ✅ Easy     ⚠️ Hard ✅ Built-in ✅ Auto
Health checks       ✅ YES      ❌ NO   ✅ YES      ✅ YES
Load balancer       ✅ Included ❌ Extra ✅ Included ✅ API GW
Database support    ✅ Easy     ✅ Easy ✅ Easy     ⚠️ Hard
File upload         ✅ YES      ✅ YES  ✅ YES      ❌ 15min
SSH access          ❌ NO       ✅ YES  ❌ NO       ❌ NO
Monitoring          ✅ Built-in ⚠️ Extra ✅ YES      ✅ YES
Learning curve      🟢 Easy     🔴 Hard 🟡 Medium   🟡 Medium
Cost (small)        💰 $0-10    💰 $0-25 💰 $18+    💰 $0-5
Cost (large)        💰 $20-50   💰 $50+ 💰 $50+    💰 Varies
Recommended         ⭐⭐⭐⭐⭐    ⭐⭐    ❌          ❌
```

---

## **DECISION TREE**

### **For Frontend:**

```
Do you want auto-deploy?
    │
    ├─ YES → Amplify ✅ (RECOMMENDED)
    │
    └─ NO  → Do you want maximum control?
             │
             ├─ YES → CloudFront + S3
             │
             └─ NO  → Amplify ✅
```

### **For Backend:**

```
Using Spring Boot?
    │
    ├─ YES → Do you want managed service?
    │        │
    │        ├─ YES → Beanstalk ✅ (RECOMMENDED)
    │        │
    │        └─ NO  → Do you want maximum control?
    │                 │
    │                 ├─ YES → EC2
    │                 │
    │                 └─ NO  → Beanstalk ✅
    │
    └─ NO  → Using containers?
             │
             ├─ YES → AppRunner ⚠️ (Expensive)
             │
             └─ NO  → Beanstalk ✅
```

---

## **WINNER'S CIRCLE**

### **🏆 Best Frontend: AWS Amplify**
```
✅ Easiest setup
✅ Auto-deploy from GitHub
✅ Same price as alternatives
✅ Perfect for React
✅ Managed service (no hassle)
```

### **🏆 Best Backend: AWS Elastic Beanstalk**
```
✅ Perfect for Spring Boot
✅ Auto-scaling included
✅ Managed service (no hassle)
✅ Free tier: 750 hours/month
✅ Only $8-25/month after
```

### **🥈 Runner-up Frontend: CloudFront + S3**
```
⚠️ More control
⚠️ Manual deployment
⚠️ More complex
⚠️ Same cost
→ Use only if you need full control
```

### **🥈 Runner-up Backend: EC2**
```
⚠️ Maximum control
⚠️ Manual management
⚠️ More complexity
⚠️ More expensive initially
→ Use only if you have DevOps engineer
```

---

## **FINAL VERDICT**

```
              AMPLIFY           BEANSTALK
             ┌─────────┐       ┌──────────┐
             │ Frontend│       │ Backend  │
             │  Auto   │───────│  Auto    │
             │ Deploy  │  API  │ Scaling  │
             └──┬──────┘       └──┬───────┘
                │                 │
                │                 │
              S3 BUCKET ────────────────────
              (Storage)
                │
                │
              NEON DB
              (Database)

STACK: Amplify + Beanstalk + S3 + Neon
COST: $0-33/month
EFFORT: ~2 hours to set up
QUALITY: ⭐⭐⭐⭐⭐ (5/5 stars)
RECOMMENDATION: ✅ DO THIS!
```

---

**Ready to proceed with this stack?** 🚀



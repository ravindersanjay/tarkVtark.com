# **AWS ELASTIC BEANSTALK - DETAILED BEGINNER'S GUIDE (2026 UI)**

**Date**: March 13, 2026  
**Difficulty**: Beginner-Intermediate  
**Time**: 45-60 minutes

---

## **BEFORE YOU START**

✅ AWS account created and logged in  
✅ S3 bucket created with credentials (see S3 guide)  
✅ Backend JAR file built: `backend/target/debate-backend-1.0.0.jar`  
✅ Environment variables ready (see below)  

---

## **PREPARE YOUR BACKEND JAR FILE**

### **Step 0.1: Build the JAR**

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
target/debate-backend-1.0.0.jar
```

### **Step 0.2: Verify JAR Size**

```bash
ls -lh target/debate-backend-1.0.0.jar
```

Should show size ~50MB (this is normal)

---

## **PART 1: CREATE ELASTIC BEANSTALK APPLICATION**

### **Step 1.1: Go to Elastic Beanstalk Service**

1. Go to: `https://console.aws.amazon.com`
2. Search for: `Elastic Beanstalk` at the top
3. Click on **"AWS Elastic Beanstalk"**
4. You'll see the Elastic Beanstalk Dashboard

**What you should see:**
- Left sidebar with options
- A section showing "Applications"
- A button **"Create application"**

### **Step 1.2: Click Create Application**

1. Click the **"Create application"** button (top right)
2. You'll see a form to create a new application

---

## **PART 2: CONFIGURE APPLICATION SETTINGS**

### **Step 2.1: Fill Application Details**

**Field 1: Application name**
```
debate-arena-backend
```

**Field 2: Application tags (optional)**
- Skip this for now

**Visual Form:**
```
Application name:
┌─────────────────────────────────┐
│ debate-arena-backend            │
└─────────────────────────────────┘

Tags (optional):
[Add tag button]
```

### **Step 2.2: Environment Configuration**

**Find the section: "Environment tier"**

```
☑ Web server environment (default, already selected)
☐ Worker environment
```

**Keep default selected**

### **Step 2.3: Environment Name**

```
Environment name:
┌─────────────────────────────────┐
│ debate-arena-backend-prod       │
└─────────────────────────────────┘
```

Or simply:
```
debate-arena-backend-env
```

---

## **PART 3: CONFIGURE PLATFORM SETTINGS**

### **Step 3.1: Select Platform**

**Look for section: "Platform"**

**Platform dropdown 1: "Platform"**
```
Select: Java
```

**Platform dropdown 2: "Platform branch"**
```
Scroll and select: Corretto 17 running on 64bit Amazon Linux 2
```
(This matches your backend Java version)

**Platform version (optional):**
```
Leave as: Recommended
```

**Visual:**
```
Platform:
┌─────────────────────────────────┐
│ Java                        ▼   │
└─────────────────────────────────┘

Platform branch:
┌─────────────────────────────────┐
│ Corretto 17 running on...   ▼   │
└─────────────────────────────────┘

Platform version:
┌─────────────────────────────────┐
│ Recommended                 ▼   │
└─────────────────────────────────┘
```

---

## **PART 4: UPLOAD YOUR JAR FILE**

### **Step 4.1: Application Code**

**Look for: "Application code"**

**Option 1: Upload your code**
```
☑ Upload your code (should be selected)
```

**If not selected, click this option**

### **Step 4.2: Upload JAR File**

1. Click **"Choose file"** button
2. Navigate to: `backend/target/debate-backend-1.0.0.jar`
3. Click **"Open"** or **"Select"**

**What you should see:**
```
File selected: debate-backend-1.0.0.jar
```

### **Step 4.3: Version Label (optional)**

```
Version label: 1.0.0
```

This helps track different versions of your app.

---

## **PART 5: CONFIGURE INSTANCE SETTINGS**

### **Step 5.1: Scroll Down to "Presets"**

You'll see different preset configurations:
```
☑ Single instance (1 free tier eligible)
☐ Load balanced (multiple instances)
```

**Select:** Single instance (cheapest for testing)

### **Step 5.2: Instance Type**

After selecting Single instance, you'll see:

```
Instance type: t2.micro
```

**t2.micro** = Free tier eligible (perfect!)

**Why?**
- Free for 12 months
- Good for testing
- Can scale up later

---

## **PART 6: ENVIRONMENT VARIABLES**

### **Step 6.1: Find Environment Properties**

**Scroll down to find:** "Preset configuration"

Or look for: **"Environment properties"** section

### **Step 6.2: Add Environment Variables**

**You'll see a table to add key-value pairs:**

```
Variable name | Variable value
─────────────────────────────────
[input]       | [input]
```

**Click "Add environment property" button**

**Add these variables (one by one):**

```
1.
Key:   SPRING_DATASOURCE_URL
Value: jdbc:postgresql://[your-neon-db-host]:5432/neondb?sslmode=require

2.
Key:   SPRING_DATASOURCE_USERNAME
Value: neondb_owner

3.
Key:   SPRING_DATASOURCE_PASSWORD
Value: [your-neon-password]

4.
Key:   SERVER_PORT
Value: 8080

5.
Key:   JWT_SECRET
Value: TarkVtark2026SecureJWTSecretKeyForDebateArenaApplicationMinimum32Characters

6.
Key:   ADMIN_USERNAME
Value: admin

7.
Key:   ADMIN_PASSWORD
Value: Admin@2026

8.
Key:   ADMIN_EMAIL
Value: admin@debatemanch.com

9.
Key:   ADMIN_FULL_NAME
Value: System Administrator

10.
Key:   FILE_PROVIDER
Value: s3

11.
Key:   AWS_ACCESS_KEY_ID
Value: AKIA... (from S3 guide)

12.
Key:   AWS_SECRET_ACCESS_KEY
Value: wJal... (from S3 guide)

13.
Key:   AWS_S3_BUCKET
Value: debate-arena-uploads

14.
Key:   AWS_REGION
Value: us-east-1

15.
Key:   AWS_S3_BASE_URL
Value: https://s3.amazonaws.com

16.
Key:   GOOGLE_CLIENT_ID
Value: 310921464230-tmc47j716puuupbol9fvoev1l03238pd.apps.googleusercontent.com

17.
Key:   FILE_BASE_URL
Value: https://[your-beanstalk-url].elasticbeanstalk.com

18.
Key:   BCRYPT_STRENGTH
Value: 12

19.
Key:   JWT_EXPIRATION_MS
Value: 86400000
```

**Get these values from:**
- `backend/.env` file (DATABASE and ADMIN vars)
- S3 setup (AWS credentials)
- Google Console (GOOGLE_CLIENT_ID)

---

## **PART 7: REVIEW AND CREATE**

### **Step 7.1: Review Configuration**

Scroll up and verify:
- ✅ Application name: `debate-arena-backend`
- ✅ Environment name: `debate-arena-backend-env`
- ✅ Platform: Java with Corretto 17
- ✅ Instance type: t2.micro
- ✅ JAR file uploaded
- ✅ Environment variables added

### **Step 7.2: Create Environment**

1. Click the **"Create environment"** button (bottom right)
2. **This will take 5-10 minutes**

**What happens:**
- AWS creates EC2 instance
- Configures security groups
- Deploys your JAR
- Starts the application

**Status progression:**
```
Creating → Updating → Deploying → Ready
```

Watch the status at the top of the page.

### **Step 7.3: Wait for Status = "Ready"**

Wait until you see:
```
✓ Environment is ready
Status: Ready
```

**Time to wait:** Usually 5-10 minutes

**Keep this page open - don't close it!**

---

## **PART 8: VERIFY DEPLOYMENT**

### **Step 8.1: Get Your Beanstalk URL**

**When status shows "Ready":**

1. Look for the URL at the top of the page
2. It should look like:
```
http://debate-arena-backend-env.elasticbeanstalk.com
```

**Copy this URL - you'll need it later for Amplify!**

### **Step 8.2: Test Your Backend**

**Open in new browser tab:**

```
http://debate-arena-backend-env.elasticbeanstalk.com/api/v1/health
```

**Expected response (in browser):**
```json
{
  "status": "UP",
  "timestamp": "2026-03-13T..."
}
```

**If you see this, your backend is working!** ✅

### **Step 8.3: Test Topics Endpoint**

```
http://debate-arena-backend-env.elasticbeanstalk.com/api/v1/topics
```

**Expected response:**
```json
[
  {
    "id": "...",
    "name": "Hindu vs Muslim",
    "description": "...",
    "totalDebates": 0
  }
]
```

**Or empty list if no topics:**
```json
[]
```

---

## **PART 9: CHECK LOGS (IF SOMETHING GOES WRONG)**

### **Step 9.1: View Deployment Logs**

1. You're on the Beanstalk environment page
2. Find the left sidebar
3. Click **"Logs"**
4. Click **"Request logs"** under "Logs"
5. Click **"Download"** next to latest log

### **Step 9.2: Check Application Logs**

1. Go to **"Monitoring"** section
2. Look at:
   - CPU utilization (should be low)
   - Instance health (should be Green)
   - Application logs (check for errors)

### **Step 9.3: Common Issues and Fixes**

**Issue: Status shows "Degraded" (Red)**

**Check:**
1. Is database connection working?
2. Are all environment variables set?
3. Check logs for error messages

**Fix:**
1. Click **"Configuration"** → **"Software"**
2. Update environment variables if needed
3. Click **"Apply"** button
4. Wait 2-3 minutes for redeploy

**Issue: Health check failing**

**Solution:**
1. Go to **"Configuration"** → **"Monitoring"**
2. Change health check endpoint to: `/api/v1/health`
3. Click **"Apply"**

---

## **PART 10: UPDATE ENVIRONMENT VARIABLES LATER**

If you need to change any settings:

### **Step 10.1: Go to Configuration**

1. Click on your environment name (if you left)
2. In left sidebar, click **"Configuration"**
3. Find section: **"Software"**
4. Click **"Edit"** button

### **Step 10.2: Modify Variables**

1. Find the variable you want to change
2. Update the value
3. Click **"Apply"** button
4. Wait 2-3 minutes for changes to take effect

---

## **PART 11: SECURITY GROUPS & FIREWALL**

### **Step 11.1: Allow Traffic**

By default, Elastic Beanstalk allows:
- ✅ HTTP (port 80)
- ✅ HTTPS (port 443)
- ✅ From anywhere (0.0.0.0/0)

**This is fine for now.**

---

## **VERIFICATION CHECKLIST**

- [ ] Application created: `debate-arena-backend`
- [ ] Environment created: `debate-arena-backend-env`
- [ ] Platform: Java with Corretto 17
- [ ] Instance type: t2.micro
- [ ] JAR uploaded: `debate-backend-1.0.0.jar`
- [ ] All 19 environment variables added
- [ ] Status shows: "Ready" (Green)
- [ ] Health check: "Ok" (Green)
- [ ] Health endpoint responds: `/api/v1/health` → 200 OK
- [ ] Topics endpoint works: `/api/v1/topics` → returns data
- [ ] Beanstalk URL copied and saved

---

## **YOUR BEANSTALK URL**

**Save this for later:**
```
http://debate-arena-backend-env.elasticbeanstalk.com
```

(Your actual URL might be different - check your Beanstalk dashboard)

---

## **TROUBLESHOOTING**

### **Problem: "No instances running"**

**Check:**
1. Is status "Ready"?
2. Are you using free tier eligible instance (t2.micro)?
3. Check AWS Billing - did you run out of free tier hours?

### **Problem: Database connection fails**

**Check:**
1. `SPRING_DATASOURCE_URL` is correct
2. `SPRING_DATASOURCE_USERNAME` is correct
3. `SPRING_DATASOURCE_PASSWORD` is correct
4. Neon database is online

### **Problem: Application keeps restarting**

**Check:**
1. View logs (see Part 9)
2. Look for error messages
3. All environment variables properly set
4. JAR file size is reasonable (~50MB)

---

## **NEXT STEPS**

✅ Elastic Beanstalk deployed  
✅ Backend running and responding  
✅ Database connected  

**Next:**
1. Deploy frontend to Amplify (see AWS_AMPLIFY_DETAILED_BEGINNER_GUIDE.md)
2. Update Amplify with Beanstalk URL
3. Run verification tests

---

## **HELPFUL LINKS**

- Elastic Beanstalk Console: https://console.aws.amazon.com/elasticbeanstalk/
- View Logs: [Your Dashboard] → Logs → Download
- Monitor Health: [Your Dashboard] → Monitoring
- AWS Documentation: https://docs.aws.amazon.com/elasticbeanstalk/

---

**Elastic Beanstalk Deployment Complete!** ✅



# **AWS AMPLIFY - DETAILED BEGINNER'S GUIDE (2026 UI)**

**Date**: March 13, 2026  
**Difficulty**: Beginner  
**Time**: 20-30 minutes

---

## **BEFORE YOU START**

✅ AWS account created and logged in  
✅ Frontend code built: `npm run build`  
✅ Code pushed to GitHub: `main` branch  
✅ GitHub personal access token ready (or use OAuth)  
✅ Elastic Beanstalk URL available (from backend deployment)  

---

## **PART 1: BUILD FRONTEND FOR PRODUCTION**

### **Step 1.1: Build Frontend**

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

This folder contains your optimized production app.

### **Step 1.2: Push to GitHub**

Make sure your code is on GitHub `main` branch:

```bash
cd /mnt/d/temp/tarkVtark.com
git add .
git commit -m "Deploy to AWS Amplify"
git push origin main
```

---

## **PART 2: CONNECT TO AWS AMPLIFY**

### **Step 2.1: Go to Amplify Service**

1. Go to: `https://console.aws.amazon.com`
2. Search for: `Amplify` at the top
3. Click on **"AWS Amplify"**
4. You'll see the Amplify Dashboard

**What you should see:**
- "Get started" section with options
- Or "Applications" list if you've used it before
- A button **"Create app"** or **"New app"**

### **Step 2.2: Click Create App**

1. Click **"Create app"** button (or "New app")
2. You'll see deployment options

**Choose: "Deploy an app"**
(This connects to your GitHub repo)

### **Step 2.3: Choose Repository Service**

**Select:** GitHub
(Other options: GitLab, Bitbucket, CodeCommit)

**Then:** Click **"Authorize"** button

### **Step 2.4: GitHub Authorization**

1. You'll be taken to GitHub authorization page
2. GitHub asks permission for Amplify to access your repos
3. Click **"Authorize aws-amplify"** button
4. You might be asked to login to GitHub if not already logged in

---

## **PART 3: CONNECT GITHUB REPOSITORY**

### **Step 3.1: Select Repository**

**After GitHub authorization, you'll see:**

```
Repository:
┌─────────────────────────────────┐
│ Choose repository          ▼   │
└─────────────────────────────────┘
```

1. Click the dropdown
2. Find and select: `ravindersanjay/tarkVtark.com`
   (Or your username/tarkVtark.com)

### **Step 3.2: Select Branch**

```
Branch:
┌─────────────────────────────────┐
│ main (already selected)    ▼   │
└─────────────────────────────────┘
```

**Should be already set to:** `main`

If not, select `main` from dropdown.

### **Step 3.3: Review and Connect**

Review:
- Repository: `your-username/tarkVtark.com`
- Branch: `main`

Click **"Next"** button

---

## **PART 4: CONFIGURE BUILD SETTINGS**

### **Step 4.1: Build Settings**

Amplify might auto-detect your build commands, or you can configure:

**Build settings shows:**
```
Build commands:
├─ npm ci
├─ npm run build

Output directory:
├─ dist

Environment variables:
├─ [Add if needed]
```

**Verify these are correct:**

```
Frontend framework:    Vite (or auto-detected)
Package manager:       npm
Build command:         npm run build
Output directory:      dist
```

### **Step 4.2: Environment Variables (Optional)**

If you need API URL:

1. Click **"+ Add environment variables"** (if visible)
2. Add:

```
Variable name:  VITE_API_URL
Variable value: http://localhost:8080/api/v1
```

⚠️ **We'll change this after deployment!**

For now, leave it pointing to localhost (will update).

### **Step 4.3: Review and Deploy**

1. Review all settings one more time:
   - ✓ Repository connected
   - ✓ Branch selected: main
   - ✓ Build settings look good
   - ✓ Output directory: dist

2. Click **"Next"** button

---

## **PART 5: REVIEW AND CREATE**

### **Step 5.1: Review Summary**

You'll see a summary page:

```
App name:        [auto-generated]
Repository:      your-username/tarkVtark.com
Branch:          main
Build settings:  Configured
Environment:     Production
```

### **Step 5.2: Edit App Name (Optional)**

1. Click on "App name" field
2. Change to: `debate-arena-frontend`
3. Or use auto-generated name

### **Step 5.3: Create App**

Click **"Create app"** button

**This will:**
- Deploy your app
- Create Amplify hosting
- Generate a URL
- **Takes 2-5 minutes**

---

## **PART 6: WAIT FOR DEPLOYMENT**

### **Step 6.1: Watch Deployment Status**

You'll see a page with deployment progress:

```
Status: Provisioning → Building → Deploying → Live
```

**Build phases:**
1. **Provisioning** (30 seconds)
2. **Building** (extracting/installing/building) (2-3 minutes)
3. **Deploying** (generating URLs) (1 minute)
4. **Live** - Your app is live! ✅

### **Step 6.2: Build Complete**

When you see:
```
✓ Build completed successfully
Status: Live
```

Your app is deployed!

---

## **PART 7: GET YOUR AMPLIFY URL**

### **Step 7.1: Find Your URL**

On the deployment success page, you'll see:

```
Live URL: https://main.xxxxxxxxxxxxx.amplifyapp.com
```

**Copy this URL** - this is your frontend!

**Example:**
```
https://main.d1a2b3c4.amplifyapp.com
```

### **Step 7.2: Test Your Frontend**

1. Click on the Amplify URL or open in browser
2. You should see your app loading
3. But topics will fail to load (wrong API URL)

**This is expected - we'll fix it next!**

---

## **PART 8: UPDATE API URL**

Frontend tried to connect to `http://localhost:8080`, but now it needs to connect to your Beanstalk backend.

### **Step 8.1: Get Your Beanstalk URL**

From your Elastic Beanstalk deployment:
```
http://debate-arena-backend-env.elasticbeanstalk.com
```

### **Step 8.2: Update Frontend Environment Variables**

**In Amplify Dashboard:**

1. Click on the app name (left sidebar)
2. Go to **"Deployments"** tab
3. Find your deployment
4. Click the **"App settings"** button (or menu)
5. Click **"Environment variables"** (left sidebar)

**Or go directly to Amplify App Settings:**

1. Click **"App settings"** in left sidebar
2. Find **"Environment variables"** section
3. Click **"Manage variables"** button

### **Step 8.3: Add/Edit Variables**

1. Find or create variable:

```
Variable name:  VITE_API_URL
Variable value: http://debate-arena-backend-env.elasticbeanstalk.com/api/v1
```

(Use your actual Beanstalk URL)

2. Click **"Save"** button

### **Step 8.4: Redeploy with New Variables**

**Method 1: Automatic Redeploy**
1. Amplify automatically redeploys when you save env vars
2. Wait 1-2 minutes

**Method 2: Manual Redeploy**
1. Go to **"Deployments"** tab
2. Find latest deployment
3. Click **"Redeploy this version"**
4. Wait for deployment to complete

### **Step 8.5: Verify New Deployment**

1. Wait for status to show **"Live"**
2. Open your Amplify URL again
3. Topics should now load from backend! ✅

---

## **PART 9: VERIFY FRONTEND WORKS**

### **Step 9.1: Test Your Frontend**

Open: `https://main.xxxxxxxxxxxxx.amplifyapp.com`

**Check:**
- ✓ Page loads (no blank white screen)
- ✓ Topics appear on home page
- ✓ Can see debates list
- ✓ Styling looks good (colors/layout)
- ✓ No errors in browser console (F12)

### **Step 9.2: Test Navigation**

1. Click on a debate
2. Debate page should load
3. Click on a topic
4. Should see questions

### **Step 9.3: Check Browser Console**

1. Open DevTools: Press F12
2. Go to **"Console"** tab
3. Look for errors (red text)

**Expected:** No errors, just normal logs

---

## **PART 10: AUTO-DEPLOYMENTS**

### **Step 10.1: Auto-Deploy is Already Enabled**

By default, when you push to GitHub:

```bash
git push origin main
```

Amplify automatically:
1. Detects the push
2. Builds your app
3. Deploys to production

**All automatically!**

### **Step 10.2: View Deployment History**

1. Go to **"Deployments"** tab
2. You'll see list of all deployments
3. Each deployment shows status (building/live/failed)
4. Click on any deployment to see details

### **Step 10.3: Test Auto-Deploy**

1. Make a small change to your frontend code
2. Commit and push:

```bash
git add .
git commit -m "test: Auto-deploy verification"
git push origin main
```

3. Go to Amplify Deployments
4. Within 30 seconds, new deployment should appear
5. After 2-3 minutes, it should show **"Live"**

**Congratulations! Auto-deployments work!**

---

## **PART 11: CUSTOM DOMAIN (OPTIONAL)**

### **Step 11.1: Connect Custom Domain**

If you own a domain (like `debatemanch.com`):

1. Click **"Domain management"** (left sidebar)
2. Click **"Add domain"**
3. Enter your domain: `www.debatemanch.com`

### **Step 11.2: Update DNS Records**

Amplify will show you DNS records to add at your domain registrar.

**This is complex and optional - skip for now if you want**

---

## **VERIFICATION CHECKLIST**

- [ ] Repository connected to Amplify
- [ ] Branch selected: main
- [ ] App deployed successfully: Status = Live
- [ ] Amplify URL generated: `https://main.xxxxxxxxxxxxx.amplifyapp.com`
- [ ] Frontend loads without errors
- [ ] Topics visible on home page
- [ ] API connected to backend
- [ ] No console errors (F12)
- [ ] Environment variable updated: `VITE_API_URL`
- [ ] Auto-deploy working (test with code push)

---

## **YOUR AMPLIFY URL**

**Save this for reference:**
```
https://main.xxxxxxxxxxxxx.amplifyapp.com
```

(Replace xxxxxxxxxxxxx with your actual ID)

---

## **TROUBLESHOOTING**

### **Problem: Topics don't load / "Failed to load topics"**

**Check:**
1. Is `VITE_API_URL` correct?
2. Is backend (Beanstalk) still running?
3. Test backend directly: `curl http://[beanstalk-url]/api/v1/health`
4. Check browser console for CORS errors

**Fix:**
1. Update API URL in Amplify
2. Click "Save"
3. Wait for redeploy
4. Refresh browser (Ctrl+F5)

### **Problem: Build failed (red error)**

**Check logs:**
1. Click on failed deployment
2. Click **"View logs"** or **"Build details"**
3. Look for error message at bottom

**Common fixes:**
- Missing npm dependencies
- Wrong build script
- Node version mismatch

### **Problem: White page loads but nothing displays**

**Check:**
1. Open DevTools (F12)
2. Go to Console tab
3. Look for error messages
4. Check Network tab to see API calls

### **Problem: Style/CSS doesn't load**

**Check:**
1. Is `dist/` folder created correctly? (`npm run build`)
2. Check Amplify output directory in settings
3. File path issues

---

## **NEXT STEPS**

✅ Frontend deployed to Amplify  
✅ Frontend connected to backend  
✅ Auto-deployments working  

**Complete Setup:**
1. ✅ Backend running on Beanstalk
2. ✅ Frontend running on Amplify
3. ✅ Database on Neon
4. ✅ Files stored on S3

**Your app is LIVE!** 🎉

---

## **HELPFUL LINKS**

- Amplify Console: https://console.aws.amazon.com/amplify/
- Amplify Deployments: [Your App] → Deployments
- Environment Variables: [Your App] → App settings → Environment variables
- AWS Documentation: https://docs.aws.amazon.com/amplify/

---

**Amplify Deployment Complete!** ✅



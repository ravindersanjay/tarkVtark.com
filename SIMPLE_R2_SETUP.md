# **CLOUDFLARE R2 SETUP - SIMPLE GUIDE**

**Time**: 15 minutes  
**Cost**: FREE ✅

---

## **WHAT IS CLOUDFLARE R2?**

It's a cloud storage service (like a hard drive in the cloud) where your files will be stored instead of on your local server. It's:
- ✅ FREE for small usage
- ✅ Fast (uses Cloudflare CDN)
- ✅ Reliable
- ✅ Perfect for your app

---

## **STEP-BY-STEP SETUP**

### **Step 1: Create Cloudflare Account** (2 minutes)

1. Go to: `https://dash.cloudflare.com/sign-up`
2. Enter your email address
3. Create a password
4. Click "Create account"
5. Verify your email

✅ **You now have a Cloudflare account**

---

### **Step 2: Access R2** (1 minute)

1. Log in to: `https://dash.cloudflare.com`
2. In the left sidebar, scroll down
3. Find **"R2"** section
4. Click on it

(If you don't see R2, search for "R2" in the search bar)

✅ **You're now in R2 section**

---

### **Step 3: Create Your First Bucket** (2 minutes)

1. Click the red **"Create bucket"** button (top right area)
2. You'll see a form asking for "Bucket name"
3. Enter: `tarkvtark-uploads` (no spaces, lowercase)
4. Leave region as default: **"US"**
5. Leave all other settings as default
6. Click **"Create bucket"**

✅ **Your bucket is created!**

---

### **Step 4: Generate API Token** (3 minutes)

1. In R2, look for **"Settings"** or **"API Tokens"** (usually top right or side menu)
2. Or go directly to: `https://dash.cloudflare.com/?to=/:account/r2/api-tokens`
3. Click **"Create API Token"** button
4. A form appears with:
   - **Name**: Enter `tarkVtark-token` (or any name you like)
   - **Permissions**: Check these ✅:
     - `Object Read`
     - `Object Write`
     - `Object Delete`
   - **Bucket**: Select `tarkvtark-uploads`
5. Set expiration: "90 days" is fine
6. Click **"Create API Token"**

✅ **API Token created!**

---

### **Step 5: Copy Your Credentials** (2 minutes)

⚠️ **IMPORTANT:** Copy these 3 values NOW (you won't see them again):

**You'll see a screen with this information. COPY each one:**

```
Access Key ID:      [COPY THIS - looks like: xxxxxxxxxxxxx]
Secret Access Key:  [COPY THIS - looks like: xxxxxxxxxxxxxxxxxxxxxxx]
Endpoint:          [COPY THIS - looks like: https://xxxxx.r2.cloudflarestorage.com]
```

**Save these 3 values somewhere safe** (copy to a text file on your computer).

✅ **You have all 3 credentials!**

---

### **Step 6: Test Your Credentials** (2 minutes)

1. Go back to R2 console
2. Click your bucket: `tarkvtark-uploads`
3. Click the **"Upload"** button
4. Pick any small image file from your computer
5. Upload it

You should see the file appear in the bucket ✅

---

## **WHAT YOU SHOULD HAVE NOW**

Three credentials:

```
R2_ACCESS_KEY_ID = [something like: xxxxxxxxxxxxxxxx]
R2_SECRET_ACCESS_KEY = [something like: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx]
R2_ENDPOINT = [something like: https://xxxxxxxx.r2.cloudflarestorage.com]
```

---

## **NEXT STEP**

Once you have these 3 credentials, tell me:

**"I have my R2 credentials ready"**

Then I'll guide you to add them to Render.

---

## **TROUBLESHOOTING**

### **"I can't find R2"**
- Make sure you're logged into Cloudflare
- Try searching for "R2" in the search box
- Or go directly: `https://dash.cloudflare.com/?to=/:account/r2`

### **"Where's my API Token?"**
- The token only shows once after creation
- If you missed it, you can create a new one
- Delete the old one and create a new token

### **"Upload test file failed"**
- Make sure you're in your bucket: `tarkvtark-uploads`
- The bucket needs to exist first
- Try a smaller file (image less than 5MB)

---

**Ready to set up R2?** 

Follow these 6 steps, get your 3 credentials, and come back!

Once you have them, reply: **"I have my R2 credentials"** ✅



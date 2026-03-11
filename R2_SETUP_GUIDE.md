# **STEP-BY-STEP: Set Up Cloudflare R2 (FREE)**

**Estimated Time**: 15-20 minutes  
**Cost**: FREE tier covers your needs (no credit card required initially)  
**Difficulty**: Very Easy

---

## **Part A: Create Cloudflare Account (If You Don't Have One)**

### **Step 1: Sign Up**
1. Go to `https://www.cloudflare.com/en-in/`
2. Click "Sign up" (top right)
3. Enter your email
4. Verify email
5. Create password

✅ **Done with Part A**

---

## **Part B: Create R2 Bucket**

### **Step 2: Access Cloudflare Dashboard**
1. Log in to `https://dash.cloudflare.com`
2. In left sidebar, scroll down to find **"R2"** section
3. If you don't see it, click "Browse more products" and search for "R2"

### **Step 3: Create a Bucket**
1. Click **"R2"** in sidebar
2. You'll see "Create bucket" button (red button, top right area)
3. Click it

### **Step 4: Name Your Bucket**
- **Bucket name**: `tarkvtark-uploads` (or any lowercase name you like, no spaces)
- Keep region as default: "US" is fine
- Leave all other settings as default
- Click **"Create bucket"**

✅ **Bucket created! Now we get the keys.**

---

## **Part C: Create API Token (for Backend Access)**

### **Step 5: Generate Access Credentials**
1. In R2 dashboard, look for **"Settings"** or **"API Tokens"** option
2. Or go directly: `https://dash.cloudflare.com/?to=/:account/r2/tokens`
3. Look for button **"Create API Token"** or **"Generate S3 API token"**
4. Click it

### **Step 6: Configure Token Permissions**
A form will appear asking for permissions:
- **Permission type**: Select "Object-level permissions" or similar
- **Permissions needed**:
  - ✅ Read objects
  - ✅ Write objects
  - ✅ Delete objects
  - ✅ Manage objects
- **Bucket access**: Select your bucket (`tarkvtark-uploads`)
- Click **"Create API Token"**

### **Step 7: Copy Your Credentials**
You'll see a screen with credentials. **COPY AND SAVE THESE** (you'll need them):

```
Access Key ID: xxxxxxxxxxxxxxx
Secret Access Key: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Endpoint: https://xxxxxxxxxxx.r2.cloudflarestorage.com
```

💾 **Save to a text file. You'll need these in 5 minutes.**

✅ **Part C done!**

---

## **Part D: Configure Render.com Environment Variables**

### **Step 8: Go to Render Dashboard**
1. Log in to `https://dashboard.render.com`
2. Find your backend service (should be named something like `debate-arena-backend`)
3. Click on it

### **Step 9: Open Environment Variables**
1. In the service page, find **"Environment"** or **"Environment Variables"** section
2. Click **"Edit"** or **"Add Environment Variable"**

### **Step 10: Add These 6 Variables**

Enter each one exactly as shown (copy-paste from the credentials you saved):

```
Name: FILE_PROVIDER
Value: r2

Name: R2_ACCESS_KEY_ID
Value: <paste your access key ID>

Name: R2_SECRET_ACCESS_KEY
Value: <paste your secret access key>

Name: R2_BUCKET
Value: tarkvtark-uploads

Name: R2_ENDPOINT
Value: <paste the endpoint URL you saved>

Name: R2_REGION
Value: us-east-1
```

### **Step 11: (Optional but Recommended) Add Public URL**

If you want nice URLs for your files:

```
Name: R2_PUBLIC_BASE_URL
Value: https://tarkvtark.r2.cloudflarestorage.com/tarkvtark-uploads
```

(Replace the account ID part with your actual endpoint)

### **Step 12: Save & Deploy**
1. Click **"Save Changes"** or **"Deploy"**
2. Render will automatically rebuild your backend
3. Wait ~2-3 minutes for the rebuild to complete

✅ **Environment configured!**

---

## **Part E: Test Everything**

### **Step 13: Wait for Deploy to Finish**
- Go to your Render service page
- Look for status indicator
- Should say "Live" or "Active"
- Check the logs to confirm no errors

### **Step 14: Upload a Test File**
1. Go to your app: `https://www.debatemanch.com` (or local if testing locally)
2. Go to Home → Create a Debate (or any page that has file upload)
3. Try uploading a test image

### **Step 15: Verify File in R2**
1. Go back to Cloudflare R2 dashboard
2. Click your bucket (`tarkvtark-uploads`)
3. You should see your uploaded file listed there!
4. Click the file → you should see a "View" button that shows the image

### **Step 16: Test Download**
1. Go back to your app
2. Try to view/download the file you uploaded
3. It should work and show the file

✅ **Everything working!**

---

## **Troubleshooting**

### **"Upload Failed" Error Still Appears**
- Check Render logs (go to service page → Logs)
- Look for error messages about R2
- Verify environment variables are exactly correct (no typos, no extra spaces)
- Try rebuilding: click "Discard Draft" and "Clear Build Cache" if needed

### **File Uploads But Doesn't Appear in R2 Console**
- Wait 1-2 minutes, refresh R2 page
- Check that `R2_BUCKET` name matches exactly
- Verify API token has "Write objects" permission

### **Can't Download File**
- Verify `FILE_PROVIDER` is set to `r2` (not `local`)
- Check Render logs for errors
- Try uploading a different file

### **"Invalid credentials" error**
- Copy-paste credentials exactly from Cloudflare dashboard
- Check for accidental spaces at beginning/end
- Regenerate new API token if unsure

---

## **Success Checklist**

- [ ] Cloudflare account created
- [ ] R2 bucket created (name: `tarkvtark-uploads`)
- [ ] API token generated
- [ ] Access Key ID saved
- [ ] Secret Access Key saved
- [ ] Endpoint URL saved
- [ ] All 6 environment variables added to Render
- [ ] Render backend rebuilt successfully
- [ ] Test file uploaded via app
- [ ] File appears in R2 console
- [ ] File can be downloaded from app

✅ **All checks done? You're ready for production!**

---

## **Frequently Asked Questions About R2**

**Q: Is this free forever?**  
A: First 10 GB storage + 1 million API requests are free per month. After that, ~$0.015/GB. For your usage (small debates), you'll likely stay in free tier.

**Q: What if I exceed free tier?**  
A: They email you before charging. You can delete old files to stay in free tier.

**Q: Is my data safe?**  
A: Yes. Cloudflare has enterprise-grade security. Better than your local server.

**Q: Can users delete other people's files?**  
A: No. Only your backend can delete files (via API).

**Q: Can I switch to AWS S3 later?**  
A: Yes, easily. Same API, just change config variables.

**Q: Should I make the bucket public or private?**  
A: R2 defaults to private. Your backend creates public URLs for viewing. This is correct.

**Q: What about privacy?**  
A: Files are private by default. Only URLs your backend generates can access them. Correct setup.

---

## **Next Steps After R2 Setup**

Once R2 is working:

1. ✅ Your upload issue is FIXED
2. ✅ Files are stored durably
3. ✅ You can redeploy anytime without losing files
4. ✅ Files are cached by Cloudflare CDN (fast)
5. ✅ New feature: Users can share file URLs

---

## **Backup Plan: If R2 Doesn't Work**

If something goes wrong, just:
1. Set `FILE_PROVIDER=local` in Render env vars
2. Redeploy
3. Falls back to old behavior (you'll see upload errors again, but app still runs)
4. Then we debug R2 config or try S3 instead

**No data loss, no permanent damage.**

---

**Ready to set up R2? Follow the steps above. Takes ~15 minutes. Reach out if you get stuck on any step!**



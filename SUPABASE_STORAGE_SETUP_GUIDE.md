# Supabase Storage Setup Guide for Debate Arena

## Overview
This guide shows how to set up Supabase Storage for your attachment uploads. Supabase provides both a PostgreSQL database AND cloud file storage in one integrated platform.

**Current Status:**
- ✅ Backend code is configured for Supabase
- ✅ Environment variables are set (.env.dev and .env.prod)
- ⏳ YOU: Create Supabase bucket (5 minutes)
- ⏳ YOU: Test the integration

---

## Prerequisites
- Supabase account (free tier available at https://supabase.com)
- Your Supabase project already created
- Your Supabase credentials (already provided in .env.dev)

---

## Step 1: Verify Your Supabase Project is Ready

Your Supabase Project URL:
```
https://jhqlijxwinzsgqgjzhwu.supabase.co
```

This URL contains your project ID. You should see it in your browser when you log into Supabase.

---

## Step 2: Create the "attachments" Storage Bucket

### In Supabase Dashboard:

1. **Go to Storage Section**
   - Open https://app.supabase.com
   - Login with your credentials
   - Select your project from the left sidebar
   - Click **Storage** in the left menu

2. **Create New Bucket**
   - Click the **"New Bucket"** button
   - Bucket name: `attachments` (exactly this name)
   - Accessibility: Select **"Public"** (since you want files to be directly accessible)
   - Click **"Create Bucket"**

3. **Verify Bucket Settings**
   - After creation, click on the bucket to see its details
   - Confirm it's set to "Public" so files are accessible via direct URL
   - If you want to make it Private later, you'll need to implement signed URLs in the backend

---

## Step 3: Verify Credentials in Your .env.dev

Your `.backend/.env.dev` should have these values (already configured):

```env
FILE_PROVIDER=supabase
SUPABASE_URL=https://jhqlijxwinzsgqgjzhwu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpocWxpanh3aW56c2dxZ2p6aHd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzUyNTEwOCwiZXhwIjoyMDk5MTAxMTA4fQ.kRiOhIgpVEFzat80ibb1qG3ck4iDkNGphPIauZx-RIk
SUPABASE_STORAGE_BUCKET=attachments
```

✅ These are already set in your `.env.dev` file.

---

## Step 4: Start Backend with Supabase Configuration

### Option A: Via IntelliJ IDEA (Recommended)

1. Open IntelliJ
2. Go to **Run** → **Edit Configurations**
3. Select your Spring Boot run configuration
4. In **Environment Variables**, ensure these are set:
   ```
   FILE_PROVIDER=supabase
   SUPABASE_URL=https://jhqlijxwinzsgqgjzhwu.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpocWxpanh3aW56c2dxZ2p6aHd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzUyNTEwOCwiZXhwIjoyMDk5MTAxMTA4fQ.kRiOhIgpVEFzat80ibb1qG3ck4iDkNGphPIauZx-RIk
   SUPABASE_STORAGE_BUCKET=attachments
   ```
5. Click **Run** to start the backend

### Option B: Via Command Line (PowerShell)

```powershell
cd D:\temp\tarkVtark.com\backend

# Set environment variables
$env:FILE_PROVIDER = "supabase"
$env:SUPABASE_URL = "https://jhqlijxwinzsgqgjzhwu.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpocWxpanh3aW56c2dxZ2p6aHd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzUyNTEwOCwiZXhwIjoyMDk5MTAxMTA4fQ.kRiOhIgpVEFzat80ibb1qG3ck4iDkNGphPIauZx-RIk"
$env:SUPABASE_STORAGE_BUCKET = "attachments"

# Or load from .env.dev
mvn spring-boot:run
```

### Option C: Using .env.dev (if supported by your IDE)

1. Load `.env.dev` values into your environment
2. Start backend via IntelliJ Run button

---

## Step 5: Test the Integration

### Test Upload via Frontend

1. **Start Frontend:**
   ```powershell
   cd D:\temp\tarkVtark.com\frontend
   npm run dev
   ```

2. **Start Backend:**
   - Using IntelliJ or command line (see Step 4)
   - Should boot on http://localhost:8080

3. **Test Upload:**
   - Go to http://localhost:5173
   - Create a new question or reply
   - Add an attachment (image, PDF, etc.)
   - Click "Upload"

4. **Expected Results:**
   - File uploads successfully
   - Attachment appears in the list
   - Clicking attachment downloads/opens it
   - Database shows `storage_provider: supabase` and URL like:
     ```
     https://jhqlijxwinzsgqgjzhwu.supabase.co/storage/v1/object/public/attachments/uuid.jpg
     ```

### Test via API (using curl or Postman)

1. **Create a test question/reply first** (to get ID)

2. **Upload a file:**
   ```powershell
   $file = "C:\path\to\test-image.jpg"
   $questionId = "your-question-uuid"
   
   curl -X POST `
     -F "file=@$file" `
     -F "questionId=$questionId" `
     http://localhost:8080/api/v1/files/upload
   ```

3. **Expected Response:**
   ```json
   {
     "id": "...",
     "fileName": "test-image.jpg",
     "fileSize": 123456,
     "storageUrl": "https://jhqlijxwinzsgqgjzhwu.supabase.co/storage/v1/object/public/attachments/uuid.jpg",
     "storageProvider": "supabase"
   }
   ```

---

## Step 6: Verify Files in Supabase

1. Open Supabase Dashboard
2. Go to **Storage** → **attachments** bucket
3. You should see your uploaded files listed
4. Click a file to preview or download

---

## Troubleshooting

### Issue: "Supabase storage is not configured"

**Solution:**
- Check that `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set in your environment
- Verify `.env.dev` has the values
- Restart the backend after changing environment variables

### Issue: "Upload returns 401 Unauthorized"

**Solution:**
- Verify the Service Role Key is correct
- Make sure the bucket name is exactly "attachments"
- Check that the bucket is set to "Public" in Supabase Storage settings

### Issue: "File URL returns 404 Not Found"

**Solution:**
- Verify bucket is set to "Public" (not "Private")
- Check Storage bucket permissions in Supabase
- Verify file was actually uploaded to Supabase (check Storage tab in Dashboard)

### Issue: "Files don't persist after backend restart"

**Solution:**
- This is expected! Unlike local storage, Supabase files persist in the cloud
- If files disappear, check that they're actually in the Supabase bucket (Storage tab)
- You may need to verify the database attachment records match uploaded files

### Issue: "Cannot connect to Supabase"

**Solution:**
- Check internet connectivity
- Verify SUPABASE_URL is correct: `https://jhqlijxwinzsgqgjzhwu.supabase.co`
- Verify Service Role Key starts with `eyJ...`
- Check firewall/proxy settings aren't blocking outbound HTTPS

---

## Production Deployment

When deploying to production:

1. **Use production Supabase credentials:**
   - Consider creating a separate Supabase project for production
   - Update `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in your deployment environment

2. **Set FILE_PROVIDER=supabase** in production environment variables

3. **Security Best Practices:**
   - ✅ Never commit `.env` files to git
   - ✅ Use CI/CD secrets for environment variables (GitHub Secrets, GitLab CI, etc.)
   - ✅ Rotate credentials periodically
   - ✅ Monitor Supabase Storage usage and costs
   - ✅ Keep bucket access logs

4. **Cost Estimation (Free Tier):**
   - First 1 GB Storage: FREE
   - After 1 GB: $0.10/GB per month
   - Bandwidth: FREE for 100 GB/month, then $0.10/GB

---

## Architecture Overview

```
Frontend (React)
    ↓ upload file
Backend (Spring Boot)
    ↓ uses FileStorageService
SupabaseFileStorageService
    ↓ HTTP POST to Supabase API
Supabase Storage (Cloud)
    ↓ returns public URL
Database (PostgreSQL)
    ↓ stores metadata + URL
```

When user downloads:
```
Frontend → clicks attachment link
    ↓
Browser → redirects to Supabase URL
    ↓
Supabase CDN → serves file directly
    ↓
User → file downloads/opens
```

---

## What Changed in Your Code

### Backend Changes:
1. ✅ **application.yml** - Added Supabase config properties
2. ✅ **.env.dev** - Set FILE_PROVIDER=supabase with credentials
3. ✅ **.env.prod** - Set FILE_PROVIDER=supabase for production
4. ✅ **SupabaseFileStorageService.java** - Already implemented (upload/delete to Supabase)
5. ✅ **FileUploadController.java** - Already supports provider abstraction

### No Changes Needed:
- Frontend code works as-is with Supabase URLs
- Database models unchanged
- All existing endpoints work the same way

---

## Next Steps

1. ✅ Create "attachments" bucket in Supabase
2. ✅ Start backend with Supabase configuration
3. ✅ Test file upload via frontend
4. ✅ Verify files appear in Supabase Storage Dashboard
5. ✅ Test file download/access
6. Ready for production deployment!

---

## Support & Documentation

- **Supabase Storage Docs:** https://supabase.com/docs/guides/storage
- **This Project's Storage Abstraction:** See `FileStorageService.java` interface
- **Backend Configuration:** See `application.yml` and `.env.dev`

---

**Last Updated:** July 11, 2026
**Backend Status:** ✅ Compiled and Ready
**Integration Status:** ⏳ Awaiting Supabase Bucket Creation


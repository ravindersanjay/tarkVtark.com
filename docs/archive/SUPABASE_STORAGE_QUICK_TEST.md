# Supabase Storage - Step-by-Step Testing Guide

## Pre-Test Verification

Before starting, verify:
- ✅ Supabase bucket "attachments" has been created (set to PUBLIC)
- ✅ Your credentials are in `.env.dev`
- ✅ Backend compiled successfully (you saw "BUILD SUCCESS")

---

## Test 1: Backend Configuration Verification

### Goal: Ensure backend properly loads Supabase configuration

### Steps:

1. **Open Terminal/PowerShell**
   ```powershell
   cd D:\temp\tarkVtark.com\backend
   ```

2. **Set Supabase environment variables:**
   ```powershell
   $env:FILE_PROVIDER = "supabase"
   $env:SUPABASE_URL = "https://jhqlijxwinzsgqgjzhwu.supabase.co"
   $env:SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpocWxpanh3aW56c2dxZ2p6aHd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzUyNTEwOCwiZXhwIjoyMDk5MTAxMTA4fQ.kRiOhIgpVEFzat80ibb1qG3ck4iDkNGphPIauZx-RIk"
   $env:SUPABASE_STORAGE_BUCKET = "attachments"
   ```

3. **Start backend:**
   ```powershell
   mvn spring-boot:run
   ```

4. **Wait for startup** (you should see logs like):
   ```
   ...
   o.springframework.boot.StartupInfoLogger : Started DemoApplication in ...
   ```

5. **Verify Supabase is configured in logs:**
   - Open IntelliJ debug console or terminal output
   - You should NOT see error: "Supabase storage is not configured"
   - Backend should start successfully

### Expected Result: ✅
- Backend starts without errors
- No "configuration missing" messages for Supabase
- Application ready at http://localhost:8080

---

## Test 2: File Upload via API (Direct Test)

### Goal: Test file upload directly to Supabase via API

### Prerequisites:
- Backend running (from Test 1)
- A test file (image, PDF, etc.)

### Steps:

1. **Create a test file if needed:**
   ```powershell
   # Create a simple test image (1x1 pixel)
   $testPath = "D:\temp\test-image.jpg"
   # Or use an existing image: C:\Users\YourName\Pictures\sample.jpg
   ```

2. **Create a test question/reply first:**
   - Go to http://localhost:5173
   - Create a new question
   - Note the question ID (you'll need it)
   - Example ID: `550e8400-e29b-41d4-a716-446655440000` (your actual ID will show in URL)

3. **Test upload with curl (PowerShell):**
   ```powershell
   $questionId = "550e8400-e29b-41d4-a716-446655440000"  # Replace with actual ID
   $filePath = "D:\temp\test-image.jpg"                   # or your file
   
   curl -X POST `
     -F "file=@$filePath" `
     -F "questionId=$questionId" `
     -F "uploadedBy=TestUser" `
     http://localhost:8080/api/v1/files/upload | ConvertFrom-Json | ConvertTo-Json -Depth 10
   ```

4. **Review API response:**
   Should return JSON like:
   ```json
   {
     "id": "uuid-of-attachment",
     "fileName": "test-image.jpg",
     "fileSize": 12345,
     "fileType": "image/jpeg",
     "storageUrl": "https://jhqlijxwinzsgqgjzhwu.supabase.co/storage/v1/object/public/attachments/[uuid].jpg",
     "storageProvider": "supabase",
     "uploadedBy": "TestUser"
   }
   ```

### Expected Result: ✅
- Upload returns HTTP 200 OK
- Response includes storageUrl starting with `https://jhqlijxwinzsgqgjzhwu.supabase.co/storage/v1/object/public/attachments/`
- storageProvider is "supabase"
- No 401/403 errors (auth failed)
- No 404 errors (bucket not found)

### Troubleshooting:
- **403 Forbidden**: Service Role Key might be wrong
- **404 Not Found**: Bucket name might be wrong or not created
- **500 Internal Server Error**: Check backend logs for details

---

## Test 3: Frontend File Upload

### Goal: Upload file through the UI and verify it works end-to-end

### Prerequisites:
- Backend running with Supabase
- Frontend dev server running

### Steps:

1. **Start frontend (if not running):**
   ```powershell
   cd D:\temp\tarkVtark.com\frontend
   npm run dev
   ```
   Opens http://localhost:5173

2. **Navigate to create a question:**
   - Go to http://localhost:5173
   - Click "New Question" button
   - Fill in:
     - Title: "Test Supabase Upload"
     - Description: "Testing file attachment to Supabase"
     - Side: Choose one

3. **Add an attachment:**
   - Scroll down to "Attachments" section
   - Click "Choose File" or drag-drop a file
   - Select a test image or PDF
   - The file should appear in the preview

4. **Submit the question:**
   - Click "Create Question" or "Submit"
   - Wait for success message

5. **View the question:**
   - Find your newly created question in the feed
   - Click on the "Attachments" section
   - You should see your uploaded file

6. **Test download/access:**
   - Click the attachment file
   - It should download or open in browser
   - File should be intact (no corruption)

### Expected Result: ✅
- File uploads successfully
- Attachment appears in question
- File can be downloaded/opened
- URL in browser shows: `https://jhqlijxwinzsgqgjzhwu.supabase.co/storage/v1/object/public/attachments/...`
- No "port refused" errors like before
- No 404 errors

---

## Test 4: Verify Files in Supabase Dashboard

### Goal: Confirm files are actually stored in Supabase (not locally)

### Steps:

1. **Open Supabase Dashboard:**
   - Go to https://app.supabase.com
   - Login with your credentials

2. **Navigate to Storage:**
   - Click **Storage** in the left sidebar
   - You should see your **attachments** bucket

3. **View uploaded files:**
   - Click on **attachments** bucket
   - You should see files listed like:
     ```
     attachments/
     ├── [uuid-1].[ext]
     ├── [uuid-2].[ext]
     └── [uuid-3].[ext]
     ```

4. **Test file access:**
   - Right-click a file → "Copy Public URL"
   - Paste URL in new browser tab
   - File should open/display
   - Example URL: 
     ```
     https://jhqlijxwinzsgqgjzhwu.supabase.co/storage/v1/object/public/attachments/478a1d2b-9263-45aa-96b8-631e891ea378.jpeg
     ```

### Expected Result: ✅
- Files appear in Supabase Storage Dashboard
- Files are in the "attachments" folder (bucket)
- Each file is accessible via direct public URL
- File access doesn't require authentication

---

## Test 5: File Deletion

### Goal: Verify files can be deleted from Supabase

### Steps:

1. **Delete via UI:**
   - Go to your question with attachments
   - Find the attachment
   - Click delete/trash icon
   - Confirm deletion

2. **Verify deletion in backend logs:**
   - Check backend console
   - Should see: `Supabase delete succeeded: attachments/[uuid].[ext]`

3. **Verify deletion in Supabase Dashboard:**
   - Go to Storage → attachments
   - File should no longer be listed

### Expected Result: ✅
- Deletion completes without errors
- File removed from Supabase Storage Dashboard
- Database record for attachment is removed
- No files left behind

---

## Test 6: Multiple File Types

### Goal: Ensure different file types work

### Test files to upload:
- [ ] **Image:** .jpg, .png, .gif (any image)
- [ ] **PDF:** .pdf document
- [ ] **Text:** .txt or .doc file
- [ ] **ZIP:** Compressed archive
- [ ] **Video:** .mp4 or .webm (if configured)

### Steps for each file type:

1. Create a new question/reply
2. Upload the file
3. Verify upload succeeds (API response HTTP 200)
4. Verify file appears in Supabase Storage Dashboard
5. Verify file can be downloaded/accessed
6. Delete the file

### Expected Result: ✅
- All supported file types upload successfully
- Files maintain correct format (no corruption)
- Download works for each type

---

## Test 7: Large File Upload

### Goal: Test upload limit handling

### Prerequisites:
- File larger than 10 MB (configured limit in .env)

### Steps:

1. **Try uploading a file > 10 MB:**
   ```powershell
   # Create a large test file (20 MB)
   [System.IO.File]::WriteAllBytes("D:\temp\large-file.bin", (New-Object Byte[] 20000000))
   ```

2. **Upload via UI or API:**
   - Should receive HTTP 400 error
   - Error message: "File size exceeds maximum allowed"

3. **Try file = 9 MB:**
   - Should succeed (under limit)

### Expected Result: ✅
- Files under 10 MB upload successfully
- Files over 10 MB rejected with clear error message
- Limit is enforced by backend

---

## Test 8: Database Integrity

### Goal: Verify attachment metadata is correctly stored

### Steps:

1. **Connect to your database** (NeonDB in this case):
   ```powershell
   # Via psql (if installed)
   psql -h your-host -U neondb_owner -d neondb -c "SELECT * FROM attachments LIMIT 5;"
   ```

2. **Verify attachment records contain:**
   - `id` (UUID)
   - `fileName` (original filename)
   - `fileSize` (bytes)
   - `fileType` (MIME type)
   - `storageUrl` (Supabase URL)
   - `storageProvider` (should be "supabase")
   - `uploadedBy` (user name)
   - `question_id` or `reply_id` (parent reference)
   - `created_at` (timestamp)

### Expected Result: ✅
- Attachment records created in database
- storageProvider = "supabase" (not "local")
- storageUrl contains Supabase domain
- All fields populated correctly

---

## Test 9: Cleanup & Reset (Optional)

### Goal: Clean up test files

### Steps:

1. **Delete test files from Supabase:**
   - Go to Storage → attachments in Supabase Dashboard
   - Select test files
   - Click Delete

2. **Delete test questions from UI:**
   - Go to your test questions
   - Delete them (automatically removes attachments)

---

## Troubleshooting During Tests

### Issue: "Supabase service is not configured"
**Solution:**
- Ensure environment variables are set BEFORE starting backend
- Check that variables have correct values
- Restart backend after setting variables

### Issue: "401 Unauthorized" on upload
**Solution:**
- Verify SUPABASE_SERVICE_ROLE_KEY is exact (no typos)
- Make sure it's the "Service Role" key, not "Anon" key
- Re-copy from Supabase Dashboard if needed

### Issue: "404 Not Found" on upload
**Solution:**
- Verify bucket name is exactly "attachments" (lowercase)
- Verify bucket exists in Supabase Storage
- Verify bucket is set to "Public"

### Issue: File URL returns 403 or 404 on access
**Solution:**
- Go to Supabase Dashboard → Storage → attachments
- Check bucket settings (should be "Public")
- Verify file actually exists in the bucket
- Try copying URL directly from Supabase and opening in browser

### Issue: Backend crashes with OutOfMemoryError
**Solution:**
- Reduce file size limit in `application.yml` or `.env`
- Increase JVM memory: `JAVA_OPTS=-Xmx1g mvn spring-boot:run`

### Issue: Network timeout on upload
**Solution:**
- Check internet connectivity to Supabase
- Verify Supabase API is accessible: `curl https://jhqlijxwinzsgqgjzhwu.supabase.co`
- Try smaller file first
- Check firewall/proxy settings

---

## Success Criteria ✅

When all tests pass, you have successfully integrated Supabase Storage:

- ✅ Backend loads Supabase configuration without errors
- ✅ Files upload via API with Supabase provider
- ✅ Files upload via UI successfully
- ✅ Files appear in Supabase Dashboard
- ✅ Files persist in cloud (not deleted on restart)
- ✅ Files can be downloaded/accessed via public URL
- ✅ Files can be deleted successfully
- ✅ Multiple file types work correctly
- ✅ Large files are rejected appropriately
- ✅ Database records created correctly
- ✅ No "port refused" errors (unlike local storage)
- ✅ Frontend and backend work together seamlessly

---

## Next Steps

Once testing passes:

1. **Production Deployment:**
   - Update `.env.prod` with production Supabase credentials
   - Deploy backend to your hosting (Railway, Render, Heroku, etc.)
   - Verify Supabase configuration in production

2. **Monitoring:**
   - Set up Supabase alerts for storage usage
   - Monitor upload success rates
   - Set budget alerts for costs

3. **Optimization:**
   - Consider implementing image optimization
   - Add file size/type validation
   - Implement signed URLs for private bucket (if needed)

4. **Documentation:**
   - Share setup guide with team
   - Document file storage architecture
   - Create runbooks for common tasks

---

## Testing Summary Checklist

| Test | Status | Pass | Fail | Notes |
|------|--------|------|------|-------|
| 1. Backend Config | [ ] | [ ] | [ ] | |
| 2. API Upload | [ ] | [ ] | [ ] | |
| 3. UI Upload | [ ] | [ ] | [ ] | |
| 4. Supabase Dashboard | [ ] | [ ] | [ ] | |
| 5. File Deletion | [ ] | [ ] | [ ] | |
| 6. File Types | [ ] | [ ] | [ ] | |
| 7. Large File | [ ] | [ ] | [ ] | |
| 8. Database | [ ] | [ ] | [ ] | |
| 9. Cleanup | [ ] | [ ] | [ ] | |

Mark each test as PASS or FAIL during testing. All should be PASS before production use.

---

**Happy Testing! 🚀**

Last Updated: July 11, 2026


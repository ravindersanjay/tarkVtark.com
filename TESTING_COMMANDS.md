# 🚀 QUICK TESTING COMMANDS

## Copy-Paste Commands to Test Everything

### Step 1: Start Backend (Option A - If Maven works in WSL)
```bash
cd /mnt/d/temp/tarkVtark.com/backend
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
mvn clean spring-boot:run
```

### Step 1: Start Backend (Option B - If using Windows)
```cmd
# In Windows CMD or PowerShell:
cd D:\temp\tarkVtark.com\backend
mvnw.cmd clean spring-boot:run
```

**Expected Output:**
```
Started DebateApplication in X.XXX seconds
Tomcat started on port(s): 8080
```

### Step 2: Start Frontend (New Terminal/Tab)
```bash
# In WSL:
cd /mnt/d/temp/tarkVtark.com/frontend
npm run dev
```

**OR in Windows:**
```cmd
cd D:\temp\tarkVtark.com\frontend
npm run dev
```

**Expected Output:**
```
VITE vX.X.X  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Step 3: Open Browser
```
http://localhost:5173
```

### Step 4: Test File Upload

1. **Create a test question with file:**
   - Click on a debate topic
   - Click "Add New Question"
   - Enter question text
   - Select left or right side
   - Click "Choose File" and select any image/PDF
   - Click "Add Question"

2. **Verify in browser DevTools:**
   ```javascript
   // Open Console (F12)
   // Check localStorage - should NOT have evidence_* keys
   Object.keys(localStorage).filter(k => k.startsWith('evidence_'))
   // Should return: []
   ```

3. **Verify file was uploaded:**
   ```bash
   # In WSL or Windows:
   ls -lh D:\temp\tarkVtark.com\backend\uploads\
   # OR
   dir D:\temp\tarkVtark.com\backend\uploads
   ```

4. **Verify in database:**
   ```bash
   psql "postgresql://neondb_owner:npg_TfMWjGuX81EY@ep-curly-queen-a1tu44g3-pooler.ap-southeast-1.aws.neon.tech:5432/neondb?sslmode=require" -c "SELECT file_name, file_size FROM attachments ORDER BY created_at DESC LIMIT 5;"
   ```

### Step 5: Test File Download

1. **In browser:**
   - Refresh the page
   - Look for the uploaded file in the question
   - Click on the file link
   - File should open in new tab

2. **OR test directly:**
   ```bash
   # Get the filename from uploads directory
   # Then open in browser:
   http://localhost:8080/api/v1/files/<FILENAME>
   ```

### Step 6: Test Evidence URL

1. **Add evidence URL:**
   - Create a question
   - Paste a YouTube URL or article URL
   - Click "Add URL"
   - Submit question

2. **Verify in database:**
   ```bash
   psql "postgresql://neondb_owner:npg_TfMWjGuX81EY@ep-curly-queen-a1tu44g3-pooler.ap-southeast-1.aws.neon.tech:5432/neondb?sslmode=require" -c "SELECT url FROM evidence_urls ORDER BY created_at DESC LIMIT 5;"
   ```

### Step 7: Test Cascade Delete

1. **Delete a question with attachments:**
   - Go to Admin Dashboard
   - Delete a question that has files
   - Check uploads directory - files should be deleted

2. **Verify:**
   ```bash
   # Check database
   psql "postgresql://..." -c "SELECT COUNT(*) FROM attachments;"
   # Should be less than before
   
   # Check uploads directory
   ls -lh D:\temp\tarkVtark.com\backend\uploads\
   # Deleted files should not be there
   ```

---

## 🧪 Advanced Testing

### Test 1: Large File Upload
```bash
# Create 9MB test file
dd if=/dev/zero of=test_9mb.bin bs=1M count=9

# Upload via curl
curl -X POST http://localhost:8080/api/v1/files/upload \
  -F "file=@test_9mb.bin" \
  -F "questionId=<UUID>" \
  -F "uploadedBy=TestUser"

# Should succeed (under 10MB limit)
```

### Test 2: File Too Large
```bash
# Create 11MB test file
dd if=/dev/zero of=test_11mb.bin bs=1M count=11

# Upload via curl
curl -X POST http://localhost:8080/api/v1/files/upload \
  -F "file=@test_11mb.bin" \
  -F "questionId=<UUID>" \
  -F "uploadedBy=TestUser"

# Should fail with error: "File size exceeds maximum allowed"
```

### Test 3: Get All Attachments
```bash
# Get question ID from database or frontend
QUESTION_ID="<UUID>"

curl "http://localhost:8080/api/v1/files/attachments?questionId=$QUESTION_ID"

# Should return JSON array of attachments
```

### Test 4: Multiple Files per Question
1. Create question
2. Upload file 1
3. Upload file 2
4. Upload file 3
5. Verify all 3 display in UI

### Test 5: Evidence URLs
```bash
curl -X POST "http://localhost:8080/api/v1/files/evidence-url" \
  -d "url=https://youtube.com/watch?v=example" \
  -d "questionId=<UUID>" \
  -d "title=Example Video"

# Should return EvidenceUrlDTO
```

---

## 🔍 Debugging

### Backend not starting?
```bash
# Check Java version
java -version
# Should be 17 or higher

# Check port 8080 available
netstat -ano | findstr :8080
# If occupied, kill the process or change port in application.yml
```

### Frontend not loading files?
```bash
# Check browser console for errors
# Check Network tab for failed requests
# Verify backend is running on port 8080
curl http://localhost:8080/api/v1/topics
# Should return list of topics
```

### Files not uploading?
```bash
# Check backend logs
# Check uploads directory exists and has write permissions
mkdir -p D:\temp\tarkVtark.com\backend\uploads
chmod 777 D:\temp\tarkVtark.com\backend\uploads
```

### Database connection issues?
```bash
# Test connection
psql "postgresql://neondb_owner:npg_TfMWjGuX81EY@ep-curly-queen-a1tu44g3-pooler.ap-southeast-1.aws.neon.tech:5432/neondb?sslmode=require" -c "SELECT 1;"
# Should return: 1
```

---

## ✅ Success Indicators

### Everything Working When:
- ✅ Backend starts without errors
- ✅ Frontend loads at http://localhost:5173
- ✅ Can create question with file
- ✅ File appears in uploads directory
- ✅ File metadata in database
- ✅ File displays in UI
- ✅ Can click file to view
- ✅ No localStorage evidence_* keys
- ✅ Page loads fast (no base64 parsing)

---

## 📞 Troubleshooting Quick Reference

| Problem | Solution |
|---------|----------|
| **DuplicateKeyException: duplicate key spring** | ✅ **FIXED!** application.yml had duplicate spring sections - now merged |
| Backend won't compile | Check JAVA_HOME, run `mvn clean install` |
| Port 8080 already used | Kill process or change port |
| File upload fails | Check file size < 10MB, check uploads dir exists |
| File not displaying | Check storageUrl in API response |
| Database error | Check connection string, tables exist |
| Frontend compile error | Run `npm install`, check imports |
| CORS error | Check backend CORS config allows localhost:5173 |
| File too large | Increase max-file-size in application.yml |

---

**Ready to test? Start with Step 1!** 🚀


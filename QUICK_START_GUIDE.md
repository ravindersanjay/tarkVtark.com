# 🚀 QUICK START GUIDE - Evidence Migration

## Step-by-Step Instructions to Get Running

### Step 1: Run Database Migration

Open WSL terminal and run:

```bash
cd /mnt/d/temp/tarkVtark.com

# Run the schema migration to create attachments and evidence_urls tables
psql "postgresql://neondb_owner:npg_TfMWjGuX81EY@ep-curly-queen-a1tu44g3-pooler.ap-southeast-1.aws.neon.tech:5432/neondb?sslmode=require" -f database-attachments-schema.sql
```

**Expected Output:**
```
DROP TABLE
DROP TABLE
CREATE TABLE
CREATE TABLE
CREATE INDEX
CREATE INDEX
CREATE INDEX
CREATE INDEX
CREATE INDEX
CREATE INDEX
CREATE INDEX
CREATE INDEX
COMMENT
COMMENT
COMMENT
COMMENT
COMMENT
```

### Step 2: Verify Tables Were Created

```bash
# Check if tables exist
psql "postgresql://neondb_owner:npg_TfMWjGuX81EY@ep-curly-queen-a1tu44g3-pooler.ap-southeast-1.aws.neon.tech:5432/neondb?sslmode=require" -c "SELECT table_name FROM information_schema.tables WHERE table_name IN ('attachments', 'evidence_urls');"
```

**Expected Output:**
```
   table_name    
-----------------
 attachments
 evidence_urls
(2 rows)
```

### Step 3: Check Backend for Errors

```bash
cd backend

# Clean and rebuild
./mvnw clean install
```

**Look for:** No compilation errors related to Attachment or EvidenceUrl classes.

### Step 4: Start Backend Server

```bash
./mvnw spring-boot:run
```

**Expected Output:**
```
2026-01-04 ... INFO ... Started DebateApplication in X.XXX seconds
```

**Watch for:**
- ✅ `HikariPool-1 - Start completed.`
- ✅ `Tomcat started on port(s): 8080`
- ✅ No errors about missing tables

### Step 5: Test File Upload Endpoint

In another terminal:

```bash
# Create a test file
echo "Test PDF content" > test.txt

# Test file upload (replace <QUESTION_UUID> with actual UUID from your database)
curl -X POST http://localhost:8080/api/v1/files/upload \
  -F "file=@test.txt" \
  -F "uploadedBy=TestUser"
```

**Expected Error (correct!):**
```json
"Either questionId or replyId must be provided"
```

**Test with question ID:**
```bash
# First get a question ID
curl http://localhost:8080/api/v1/questions/topic/<TOPIC_UUID>

# Then upload with that question ID
curl -X POST http://localhost:8080/api/v1/files/upload \
  -F "file=@test.txt" \
  -F "questionId=<QUESTION_UUID>" \
  -F "uploadedBy=TestUser"
```

**Expected Output:**
```json
{
  "id": "...",
  "fileName": "test.txt",
  "fileSize": 18,
  "fileType": "text/plain",
  "storageUrl": "http://localhost:8080/api/v1/files/...",
  "storageProvider": "local",
  "uploadedBy": "TestUser",
  "displayOrder": 0,
  "createdAt": "2026-01-04T..."
}
```

### Step 6: Verify File Was Saved

```bash
# Check uploads directory
ls -lh backend/uploads/

# You should see your uploaded file
```

### Step 7: Test File Download

```bash
# Get the filename from the storageUrl in previous response
curl http://localhost:8080/api/v1/files/<FILENAME>

# Should return: "Test PDF content"
```

### Step 8: Test Questions with Attachments

```bash
# Get questions for a topic - should now include attachments array
curl http://localhost:8080/api/v1/questions/topic/<TOPIC_UUID>
```

**Expected Output:**
```json
[
  {
    "id": "...",
    "text": "Question text",
    ...
    "attachments": [
      {
        "id": "...",
        "fileName": "test.txt",
        "storageUrl": "http://localhost:8080/api/v1/files/..."
      }
    ],
    "evidenceUrls": []
  }
]
```

---

## 🎯 Success Criteria

✅ Database migration completed without errors  
✅ Backend starts without errors  
✅ Can upload file to `/api/v1/files/upload`  
✅ File saved in `./backend/uploads/` directory  
✅ Can download file from `/api/v1/files/{filename}`  
✅ Questions API includes attachments array  
✅ Evidence URLs can be added via API  

---

## 🚨 Troubleshooting

### Error: "Table attachments does not exist"

**Solution:**
```bash
# Run the migration again
cd /mnt/d/temp/tarkVtark.com
psql "postgresql://..." -f database-attachments-schema.sql
```

### Error: "Could not write JSON: No serializer found for class"

**Solution:** Already fixed! Attachment/EvidenceUrl entities have `@JsonIgnore` on parent relationships.

### Error: "Field attachmentRepository required a bean of type"

**Solution:** 
1. Check `AttachmentRepository.java` has `@Repository` annotation
2. Run `./mvnw clean install` to recompile
3. Restart backend server

### Error: "File size exceeds maximum allowed"

**Solution:** File is larger than 10MB. Either:
1. Use smaller test file
2. Increase `file.max-size` in `application.yml`

### Error: "Connection refused" when uploading

**Solution:** Backend server not running. Start with `./mvnw spring-boot:run`

---

## 📝 Next Steps After Backend Testing

Once backend is working:

1. **Update Frontend** - Replace localStorage with API calls
2. **Create Migration Script** - Move existing localStorage evidence to database
3. **Test End-to-End** - Upload files from UI
4. **Remove localStorage writes** - Clean up old code

---

## 🔧 Useful Commands

### Check Backend Logs
```bash
# Watch backend logs in real-time
tail -f backend/logs/application.log

# Or just watch console output when running ./mvnw spring-boot:run
```

### Check Database
```bash
# Count attachments
psql "postgresql://..." -c "SELECT COUNT(*) FROM attachments;"

# View recent attachments
psql "postgresql://..." -c "SELECT file_name, file_size, created_at FROM attachments ORDER BY created_at DESC LIMIT 5;"

# View evidence URLs
psql "postgresql://..." -c "SELECT url, title FROM evidence_urls ORDER BY created_at DESC LIMIT 5;"
```

### Clean Uploads Directory
```bash
# Remove all uploaded files (for testing)
rm -rf backend/uploads/*
```

### Rebuild Backend
```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

---

**Status:** Backend implementation complete - Ready to test!  
**Time to complete:** ~10 minutes for testing  
**Next:** Frontend updates


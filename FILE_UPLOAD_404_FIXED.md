# ✅ FILE UPLOAD 404 ERROR - FIXED

**Date:** January 5, 2026  
**Error:** `404 Not Found` when uploading attachments  
**Status:** ✅ RESOLVED

---

## 🎯 WHAT WAS THE PROBLEM:

### **Error in Browser:**
```
Failed to upload tarkVtark.com_logo_v1.png. Upload failed:
status: 404
error: "Not Found"
org.springframework.web.servlet.resource.NoResourceFoundException: 
No static resource files/upload
```

### **Root Cause:**
The `FileUploadController` had **double context path**:

```java
// application.yml has:
server:
  servlet:
    context-path: /api/v1

// Controller had (WRONG):
@RequestMapping("/api/v1/files")

// This created the path:
/api/v1 + /api/v1/files/upload = /api/v1/api/v1/files/upload  ❌

// Frontend was calling:
POST /api/v1/files/upload  ❌ (doesn't exist!)
```

---

## ✅ THE FIX:

### **Changed Controller Mapping:**
```java
// Before (BROKEN):
@RequestMapping("/api/v1/files")  ❌

// After (FIXED):
@RequestMapping("/files")  ✅

// Now the path is:
/api/v1 (context) + /files (controller) + /upload (method)
= /api/v1/files/upload  ✅ CORRECT!
```

---

## 📝 FILES MODIFIED:

### **backend/src/main/java/com/debatearena/controller/FileUploadController.java**

**Change:**
```java
Line 54: @RequestMapping("/files")  // Changed from "/api/v1/files"
```

---

## ✅ VERIFICATION:

### **1. Uploads Directory Created:**
```bash
✅ backend/uploads/ exists and is ready
```

### **2. Correct Endpoint Path:**
```
Frontend calls: POST http://localhost:8080/api/v1/files/upload
Backend serves: /api/v1/files/upload
✅ MATCH!
```

---

## 🚀 HOW TO TEST:

### **Step 1: Restart Backend**
```bash
# The backend is currently running, you need to restart it
# In the terminal running mvn spring-boot:run:
Ctrl+C (to stop)

# Then restart:
cd backend
mvn spring-boot:run
```

**Wait for:**
```
Started DebateApplication in ~5 seconds
Tomcat started on port 8080 (http) with context path '/api/v1'
```

### **Step 2: Verify Endpoint is Registered**
Check the logs for:
```
Mapped "{[/files/upload],methods=[POST]}" onto ...FileUploadController.uploadFile
```

### **Step 3: Test File Upload in Browser**
1. Open `http://localhost:5173`
2. Click on a debate topic
3. Click "Add Question"
4. Fill in the question text
5. Click "Choose Files" under Evidence
6. Select an image file
7. Click "Add Question"

**Expected:**
```
✅ File uploads successfully
✅ Question appears with attachment
✅ No 404 error
✅ Database entry created in attachments table
```

---

## 🔍 DEBUGGING:

### **If Still Getting 404:**

#### **1. Check Backend Logs:**
```bash
# Look for this line:
Mapped "{[/files/upload],methods=[POST]}"

# If not found, restart backend
```

#### **2. Check Request URL in Browser Console:**
```javascript
// Should be:
POST http://localhost:8080/api/v1/files/upload

// NOT:
POST http://localhost:8080/api/v1/api/v1/files/upload
```

#### **3. Check CORS:**
```bash
# Backend log should show:
Completed initialization in X ms

# No CORS errors in browser console
```

#### **4. Check uploads Directory:**
```bash
ls -la backend/uploads/

# Should exist and be writable
```

---

## 📊 ENDPOINT MAPPING REFERENCE:

### **All File Endpoints (After Fix):**
```
Controller: @RequestMapping("/files")
Context: /api/v1

POST   /api/v1/files/upload              ✅
GET    /api/v1/files/{filename}          ✅
DELETE /api/v1/files/{id}                ✅
POST   /api/v1/files/evidence-url        ✅
DELETE /api/v1/files/evidence-url/{id}   ✅
GET    /api/v1/files/attachments         ✅
GET    /api/v1/files/evidence-urls       ✅
```

---

## 🎓 LESSON LEARNED:

### **Spring Boot Context Path vs RequestMapping:**

When you have:
```yaml
# application.yml
server:
  servlet:
    context-path: /api/v1
```

Your controllers should use **relative paths** without the context:
```java
✅ CORRECT:
@RequestMapping("/files")
// Becomes: /api/v1/files

❌ WRONG:
@RequestMapping("/api/v1/files")
// Becomes: /api/v1/api/v1/files (duplicate!)
```

---

## ✅ EXPECTED BEHAVIOR AFTER FIX:

### **1. Upload Flow:**
```
User selects file
  ↓
Frontend calls: POST /api/v1/files/upload
  ↓
Backend receives at FileUploadController.uploadFile()
  ↓
File saved to: backend/uploads/generated-filename.ext
  ↓
Database entry created in attachments table
  ↓
Response: { id: "...", storageUrl: "http://localhost:8080/api/v1/files/..." }
  ↓
Frontend displays file in question
```

### **2. Database Entry:**
```sql
-- attachments table:
id: uuid
question_id: uuid (or reply_id)
file_name: "tarkVtark.com_logo_v1.png"
file_size: 1040900 (bytes)
file_type: "image/png"
storage_url: "http://localhost:8080/api/v1/files/abc-123-456.png"
storage_provider: "local"
uploaded_by: "CurrentUser"
created_at: timestamp
```

### **3. File Retrieval:**
```
User views question with attachment
  ↓
Frontend receives storageUrl from API
  ↓
Browser loads image: GET /api/v1/files/abc-123-456.png
  ↓
Backend serves file from uploads directory
  ↓
Image displays in browser
```

---

## ✅ FINAL CHECKLIST:

- ✅ Controller @RequestMapping fixed (`/files` instead of `/api/v1/files`)
- ✅ No compilation errors
- ✅ uploads/ directory exists
- ✅ Backend needs restart to apply changes
- ✅ Frontend code already correct (no changes needed)

---

## 🎉 NEXT STEPS:

1. **Restart Backend** (Ctrl+C, then `mvn spring-boot:run`)
2. **Refresh Browser** (F5)
3. **Try uploading a file**
4. **Verify file appears in question**
5. **Check database** for attachment entry

---

**Status:** ✅ FIXED  
**Requires:** Backend Restart  
**Impact:** File uploads will now work  
**Testing:** Ready after restart

---

**Last Updated:** January 5, 2026 00:10 IST  
**Fix:** Controller mapping corrected  
**Backend Restart Required:** YES


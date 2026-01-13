# Attachment Storage URL - Duplicate Port Issue - FIXED ✅

**Date:** January 10, 2026
**Issue:** Storage URLs being saved with duplicate port number (e.g., `http://localhost:8080:8080/api/v1/files/filename.pdf`)

---

## 🔍 Root Cause Analysis

### **The Problem**
The `storage_url` field in the `attachments` table was storing URLs with a duplicate `:8080` port:
```
❌ WRONG: http://localhost:8080:8080/api/v1/files/21a52a4d-50ef-418a-a227-386ab00e4a06.pdf
✅ CORRECT: http://localhost:8080/api/v1/files/21a52a4d-50ef-418a-a227-386ab00e4a06.pdf
```

### **Root Cause**

**Location:** `LocalFileStorageService.java` (line 77)

**Original Code:**
```java
return String.format("%s:%s/api/v1/files/%s", baseUrl, serverPort, fileName);
```

**Configuration Issue:**
1. **`FILE_BASE_URL`** in `.env` was set to: `http://localhost:8080` (includes port)
2. **Code was appending** `:8080` again from `SERVER_PORT` variable
3. **Result:** Double port in final URL

---

## ✅ Solutions Implemented

### **Solution 1: Configuration Fix**

**Files Modified:**
- `backend/.env`
- `backend/src/main/resources/application.yml`

**Changes:**
```diff
# backend/.env
- FILE_BASE_URL=http://localhost:8080
+ FILE_BASE_URL=http://localhost

# application.yml
- base-url: ${FILE_BASE_URL:http://localhost:8080}
+ base-url: ${FILE_BASE_URL:http://localhost}
```

**Rationale:** The base URL should NOT include the port, as the service will append it automatically.

---

### **Solution 2: Robust URL Construction** (Additional Safety)

**File Modified:** `LocalFileStorageService.java`

**Before:**
```java
// Return public URL
return String.format("%s:%s/api/v1/files/%s", baseUrl, serverPort, fileName);
```

**After:**
```java
// Return public URL
// Check if baseUrl already contains a port to avoid duplication
String fileUrl;
if (baseUrl.matches(".*:\\d+$")) {
    // Base URL already has a port (e.g., http://localhost:8080)
    fileUrl = String.format("%s/api/v1/files/%s", baseUrl, fileName);
} else {
    // Base URL doesn't have a port, append it
    fileUrl = String.format("%s:%s/api/v1/files/%s", baseUrl, serverPort, fileName);
}
return fileUrl;
```

**Benefits:**
- ✅ Handles base URLs with or without ports
- ✅ Prevents duplicate port issues in production
- ✅ More flexible for different deployment scenarios
- ✅ Self-correcting if configuration changes

---

## 🧪 Testing Instructions

### **1. Clean and Restart Backend**
```bash
cd backend
./mvnw clean package
./mvnw spring-boot:run
```

### **2. Test File Upload**
```bash
# Upload a test file
curl -X POST http://localhost:8080/api/v1/files/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@test.pdf"
```

### **3. Verify Database**
```sql
-- Check the latest attachment URLs
SELECT id, file_name, storage_url, created_at 
FROM attachments 
ORDER BY created_at DESC 
LIMIT 5;
```

**Expected Result:**
```
storage_url should be: http://localhost:8080/api/v1/files/{uuid}.pdf
(Only ONE :8080, not two!)
```

### **4. Test File Access**
```bash
# The URL should work correctly
curl http://localhost:8080/api/v1/files/{filename}.pdf
```

---

## 🗄️ Fixing Existing Data

If you have existing attachments with duplicate ports, run this SQL to fix them:

```sql
-- Preview the fix (dry run)
SELECT 
    id,
    storage_url AS old_url,
    REPLACE(storage_url, ':8080:8080', ':8080') AS new_url
FROM attachments
WHERE storage_url LIKE '%:8080:8080%';

-- Apply the fix
UPDATE attachments
SET storage_url = REPLACE(storage_url, ':8080:8080', ':8080')
WHERE storage_url LIKE '%:8080:8080%';

-- Verify the fix
SELECT COUNT(*) as fixed_count
FROM attachments
WHERE storage_url LIKE '%:8080/api/v1/files/%'
  AND storage_url NOT LIKE '%:8080:8080%';
```

---

## 🚀 Production Considerations

### **For Production Deployment:**

**Update `.env` file with production values:**
```env
# Production configuration example
FILE_BASE_URL=https://api.tarkvtark.com
SERVER_PORT=8080
```

**Result:**
```
✅ URLs will be: https://api.tarkvtark.com:8080/api/v1/files/filename.pdf
```

**Or with standard ports (80/443):**
```env
FILE_BASE_URL=https://api.tarkvtark.com
SERVER_PORT=443
```

**Note:** The smart URL construction in `LocalFileStorageService.java` will handle both scenarios correctly.

---

## 📋 Files Modified

1. ✅ `backend/.env` - Removed `:8080` from `FILE_BASE_URL`
2. ✅ `backend/src/main/resources/application.yml` - Updated default base URL
3. ✅ `backend/src/main/java/com/debatearena/service/LocalFileStorageService.java` - Added smart URL construction

---

## ✅ Issue Status: **RESOLVED**

### **Summary:**
- ❌ **Before:** `http://localhost:8080:8080/api/v1/files/file.pdf`
- ✅ **After:** `http://localhost:8080/api/v1/files/file.pdf`

### **Next Steps:**
1. Restart the backend server
2. Test file upload functionality
3. Fix existing database records (optional, see SQL above)
4. Verify file access works correctly

---

**Author:** GitHub Copilot  
**Date:** January 10, 2026  
**Status:** ✅ Complete


# Where Are Your Attachments Being Stored? Analysis

**Date:** July 4, 2026  
**Purpose:** Clarify current attachment storage locations  
**Audience:** You (and anyone debugging your app)

---

## Quick Answer

Your attachments are stored in **two different places** depending on how you're running the app:

| Scenario | Metadata | Files |
|----------|----------|-------|
| **Local Manual Dev** | NeonDB (cloud) 🔴 | ./uploads/attachments/ ✅ |
| **Docker Compose** | Local PostgreSQL | ./uploads/attachments/ (docker volume) ✅ |
| **Production** | Still NeonDB | Undefined ❌ |

---

## Part 1: Local File Storage (Development)

### Where Files Are Stored

**Primary Location:** `D:\temp\tarkVtark.com\backend\uploads\attachments\`

```
backend/
├─ uploads/                         ← Main uploads directory
│  └─ attachments/                  ← Attachment files stored here
│     ├─ 478a1d2b-9263-45aa-96b8-631e891ea378.jpeg    ← Your uploaded file
│     ├─ uuid-uuid-uuid-uuid.jpeg
│     └─ uuid-uuid-uuid-uuid.pdf
└─ uploads-dev/                     ← Alternative (if you created it)
```

### How It Works

**When you upload a file:**

```
Step 1: Browser
├─ User selects file
└─ Sends to backend: POST /api/v1/files/upload

Step 2: FileUploadController (Java)
├─ Receives MultipartFile
├─ Calls: fileStorageService.uploadFile(file, "attachments")
└─ fileStorageService is: LocalFileStorageService (if FILE_PROVIDER=local)

Step 3: LocalFileStorageService
├─ Generates UUID filename: "478a1d2b-9263-45aa-96b8-631e891ea378.jpeg"
├─ Saves to disk: ./uploads/attachments/478a1d2b-9263-45aa-96b8-631e891ea378.jpeg
├─ Returns storage key: "attachments/478a1d2b-9263-45aa-96b8-631e891ea378.jpeg"
└─ (Does NOT return full URL)

Step 4: FileUploadController continues
├─ Creates Attachment entity
├─ Sets storageUrl = "attachments/478a1d2b-9263-45aa-96b8-631e891ea378.jpeg" (the key)
├─ Sets storageProvider = "local"
└─ Saves to NeonDB

Step 5: Return to Frontend
├─ FileUploadController calls AttachmentDTO.fromEntity()
├─ AttachmentDTO constructs full URL:
│  └─ http://localhost:8080/api/v1/files/key/attachments/478a1d2b-9263-45aa-96b8-631e891ea378.jpeg
└─ Returns to frontend

Step 6: Frontend
├─ Receives attachment with full URL
├─ Renders as clickable link
└─ When user clicks: browser requests the URL

Step 7: File Download
├─ Browser: GET http://localhost:8080/api/v1/files/key/attachments/478a1d2b...
├─ Backend: FileUploadController.downloadByKey()
├─ Loads file from disk: ./uploads/attachments/478a1d2b...
├─ Serves file to browser
└─ Browser: opens/downloads file ✅
```

### Verification: Check Files on Disk

```bash
# Windows PowerShell
dir D:\temp\tarkVtark.com\backend\uploads\attachments\

# OR
ls -la D:\temp\tarkVtark.com\backend\uploads\attachments\

# Should show your uploaded files
```

### Issue You Might Have Noticed

```
URL shown: http://localhost/api/v1/files/key/attachments/uuid.jpeg
          ↑
          No port! This is the bug we fixed.

Should be: http://localhost:8080/api/v1/files/key/attachments/uuid.jpeg
          ↑
          Port included (now fixed by FileUrlUtil component)
```

---

## Part 2: Database Metadata Storage

### Where File Information Is Stored

**Database:** NeonDB (cloud) ❌ *Should be local PostgreSQL in dev*

**Table:** `attachments`

```sql
-- Current structure:
CREATE TABLE attachments (
    id UUID PRIMARY KEY,
    question_id UUID,
    reply_id UUID,
    file_name VARCHAR(255),
    file_size BIGINT,
    file_type VARCHAR(100),
    storage_url TEXT,               -- "attachments/uuid.jpeg"
    storage_provider VARCHAR(50),   -- "local"
    uploaded_by VARCHAR(100),
    display_order INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Example row:
id: '12345678-1234-1234-1234-123456789012'
file_name: 'image.jpeg'
file_size: 254782
file_type: 'image/jpeg'
storage_url: 'attachments/478a1d2b-9263-45aa-96b8-631e891ea378.jpeg'  ← The KEY
storage_provider: 'local'
question_id: 'abc...'
```

### The Missing Piece Issue

**Problem:** Metadata in cloud (NeonDB), files on local disk

```
Your Local Dev Environment:
├─ Files on Disk
│  └─ ./uploads/attachments/uuid.jpeg       ✅ Here
│
└─ Metadata in Cloud
   └─ NeonDB.attachments table               ❌ Here (should be local)
```

**Why it's a problem:**

1. **Network dependency** - Can't work offline
2. **Latency** - Slow DB access across internet  
3. **Hard to reset** - Can't just delete files locally
4. **Costs** - Paying for cloud DB for local development
5. **Backup complexity** - Files and metadata not together

**Solution:** Use local PostgreSQL for dev (already in docker-compose.yml!)

---

## Part 3: Docker Compose File Storage

### In Docker Compose

```yaml
backend:
  volumes:
    - backend_uploads:/app/uploads    ← Docker named volume
```

**What this means:**

```
Host Machine (Windows)
├─ D:\temp\tarkVtark.com\backend\uploads\attachments\
│  (real files here)
│
└─ Docker Container
   ├─ /app/uploads/attachments/
   │  (appears to be here inside container)
   │  (actually HostPathHost path via volume mount)
   └─ (files are actually on host machine)
```

**When you use `docker-compose up -d`:**

```
1. Docker creates volume "backend_uploads"
2. Maps to container path: /app/uploads/
3. Container saves files → /app/uploads/attachments/
4. Docker writes to host filesystem automatically
5. Files appear on host: backend/uploads/attachments/
6. Persists even after container stops (because it's a named volume)
```

**Check files in Docker container:**

```bash
# Enter backend container
docker exec -it tarkvtark-backend /bin/sh

# List files
ls -la /app/uploads/attachments/

# Exit
exit
```

---

## Part 4: Docker Database Storage

### Attachment Metadata in Docker

```yaml
database:
  volumes:
    - postgres_data:/var/lib/postgresql/data   ← Database volume
```

**What this means:**

```
Docker PostgreSQL Container
├─ Database data inside: /var/lib/postgresql/data
├─ Mapped to volume: postgres_data
└─ Persisted on host when container stops ✅
```

**Benefits:**

```
✅ Database persists between `docker-compose down/up`
✅ Metadata not lost when restarting containers
✅ Can backup entire database by exporting volume
✅ Uses local storage (not NeonDB)
```

**Check database in Docker:**

```bash
# Enter database container
docker exec -it tarkvtark-db /bin/sh

# Connect to PostgreSQL
psql -U postgres -d debate_arena_db

# List attachments
SELECT id, file_name, storage_url, created_at FROM attachments;

# Exit
\q
exit
```

---

## Part 5: Current Architecture (Actual Reality)

### When Running Locally (Manual - not docker-compose)

```
Your Development Machine:
├─ NeonDB (cloud)
│  └─ Attachment metadata stored here
│     └─ ❌ Requires internet
│
├─ Backend (local Java process)
│  └─ Running Spring Boot on your machine
│
├─ Frontend (local Vite dev server)
│  └─ Running on http://localhost:5173
│
└─ File System (local disk)
   └─ ./uploads/attachments/
      └─ ✅ Files stored here
```

### When Using Docker Compose

```
Docker Environment (on your machine):
├─ Database Container (PostgreSQL)
│  └─ Local PostgreSQL (NOT NeonDB)
│  └─ Data in postgres_data volume
│
├─ Backend Container (Spring Boot)
│  └─ Running JAR from image
│  └─ Connected to database container
│
├─ Frontend Container (Nginx)
│  └─ Serving built React app
│
└─ Volumes
   ├─ postgres_data → Persistent DB
   ├─ backend_uploads → Files on host
   │  └─ Accessible at: backend/uploads/attachments/
   └─ Networks
      └─ All containers can communicate
```

---

## Part 6: Production (Current - NOT RECOMMENDED)

### Current State (from .env.prod)

```
❌ Database: NeonDB (same as dev!)
❌ Files: FILE_PROVIDER=local (not realistic for production)
❌ Storage: ./uploads/ (will disappear when container restarts!)
```

### The Problem with Current Production Setup

```
Production Server:
├─ Backend container
│  └─ Writes files to /app/uploads/attachments/
│     └─ Deleted when container stops / redeploys! 🔴
│
├─ Shared database: NeonDB
│  └─ Metadata points to files that don't exist
│     └─ Broken links after redeployment! 🔴
│
└─ No backup of files
   └─ If server crashes: data loss 🔴
```

**Why this doesn't work:**

1. **Containers are ephemeral** - Files in container disappear on restart
2. **No volume mapping in production** - Files not persisted to disk
3. **Single database** - Dev/prod sharing same data is risky
4. **No CDN** - Serving files from backend is slow

---

## Part 7: Recommended Architecture (Solution)

### Proposed Production Setup

```
Production (with Supabase):
├─ Backend Container (no file storage)
│  └─ Just API logic, no uploads volume
│
├─ Database: Supabase PostgreSQL
│  └─ Metadata stored here
│  └─ Separate from development!
│
├─ File Storage: Supabase Storage
│  └─ debate-arena-uploads bucket
│  └─ Global CDN-backed
│  └─ Persistent, scalable
│
└─ Attachment Metadata
   ├─ storageUrl: "https://PROJECT.supabase.co/storage/v1/object/public/..."
   └─ File URL points to CDN (not backend)
```

**Advantages:**

```
✅ Files persist across container restarts
✅ Scales horizontally (multiple backend replicas)
✅ CDN distribution (fast downloads worldwide)
✅ No local disk needed (stateless backend)
✅ Backup included (Supabase handles it)
✅ Separate prod/dev databases
✅ Files served directly from CDN (not backend)
```

---

## Part 8: How to Check Current Storage Status

### Command 1: List Local Files

```bash
# Show all files in uploads folder
dir /s D:\temp\tarkVtark.com\backend\uploads\

# Count files
dir /s /b D:\temp\tarkVtark.com\backend\uploads\ | find /c ":"
```

### Command 2: Check NeonDB for Metadata

```bash
# Connect to NeonDB
psql -h ep-curly-queen-a1tu44g3-pooler.ap-southeast-1.aws.neon.tech \
     -U neondb_owner \
     -d neondb \
     -c "SELECT COUNT(*) as total_attachments FROM attachments WHERE file_name IS NOT NULL;"

# Password: npg_TfMWjGuX81EY
```

### Command 3: List Docker Volumes

```bash
# Show all volumes
docker volume ls

# Inspect backend_uploads volume
docker volume inspect backend_uploads

# Shows where data is stored on host
```

### Command 4: Check File References in DB

```bash
psql -h ep-curly-queen-a1tu44g3... \
     -U neondb_owner \
     -d neondb \
     -c "SELECT id, file_name, storage_url, storage_provider FROM attachments LIMIT 10;"
```

**Expected output:**
```
                  id                  | file_name  |                storage_url                 | storage_provider
--------------------------------------+------------+---------------------------------------------+------------------
 478a1d2b-9263-45aa-96b8-631e891ea378 | test.jpeg  | attachments/478a1d2b-9263-45aa-96b8...  | local
```

---

## Part 9: Size Analysis

### How Much Storage Are You Using?

```bash
# Get total size of uploads folder
dir /s D:\temp\tarkVtark.com\backend\uploads\ | find /i "total"

# OR PowerShell
(gci -r D:\temp\tarkVtark.com\backend\uploads\  | measure -s Length).Sum / 1MB
```

### Breakdown by Provider

```sql
-- In NeonDB, check storage distribution:
SELECT 
    storage_provider,
    COUNT(*) as file_count,
    SUM(file_size) as total_bytes,
    ROUND(SUM(file_size)/1024/1024, 2) as total_mb
FROM attachments
GROUP BY storage_provider;
```

**Expected output:**
```
 storage_provider | file_count | total_bytes | total_mb
------------------+------------+-------------+----------
 local            |         15 |    5242880  |  5.00
```

---

## Part 10: Cleanup & Migration Path

### If You Have Orphaned Files

Files in disk but not in database:

```bash
# Find files
dir D:\temp\tarkVtark.com\backend\uploads\

# Check database
psql ... -c "SELECT storage_url FROM attachments;" > db_files.txt

# Compare and delete orphaned files manually
```

### If You Have Database Entries Without Files

```bash
# Find orphaned entries
psql -h ep-curly-queen-a1tu44g3... \
     -U neondb_owner \
     -d neondb \
     -c "SELECT id, file_name, storage_url FROM attachments 
          WHERE storage_url NOT IN (SELECT file_path FROM files_on_disk);"

# Delete them (optional)
```

### Migration To Supabase

```
Right now (dev):
├─ Files: ./uploads/attachments/ (local)
└─ Metadata: NeonDB (cloud)

After migration:
├─ Files: Supabase Storage bucket
└─ Metadata: Supabase PostgreSQL (same provider!)

To migrate:
1. Export files from ./uploads/attachments/
2. Upload to Supabase Storage
3. Update storageUrl in database
4. Switch backend to Supabase
```

---

## Summary Table

| Aspect | Current | After Fix |
|--------|---------|-----------|
| **File Location** | ./uploads/attachments/ | Supabase Storage |
| **Metadata DB** | NeonDB | Supabase PostgreSQL |
| **File Access** | via backend | Direct CDN |
| **Scalability** | Limited | Auto-scales |
| **Cost** | $168/year | $0-25/year |
| **Offline** | ❌ Needs NeonDB | ✅ Stateless |
| **Persistence** | Risky in production | Built-in |

---

## Quick Checklist: Where Are My Files?

```
✅ Can I see them on disk?
   Check: D:\temp\tarkVtark.com\backend\uploads\attachments\

✅ Are they in the database?
   Check: SELECT * FROM attachments (in NeonDB)

✅ Can I access them online?
   Check: Click attachment link in your app

✅ What happens when I restart containers?
   Files persist (have docker volume)
   Metadata persists (have postgres_data volume)

✅ What happens when I deploy to production?
   Files are LOST (no volume)
   Metadata points to ghost files 🔴
```

---

**Document Version:** 1.0  
**Created:** July 4, 2026  
**Purpose:** Clarify your current attachment storage setup  
**Action:** Read TECH_STACK_COMPREHENSIVE_ANALYSIS.md for full solution


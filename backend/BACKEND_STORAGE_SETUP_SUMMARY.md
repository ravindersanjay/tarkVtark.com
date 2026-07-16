# Backend File Storage Configuration - Complete Guide

## Current Status ✅

Your backend now has:
- ✅ **Generic Storage Service** abstraction (interface + 4 implementations)
- ✅ **Environment-based provider selection** system
- ✅ **Automatic bean selection** via `@ConditionalOnProperty`
- ✅ **Multi-provider support**: Local, Supabase, AWS S3, Cloudflare R2
- ✅ **Configuration files** updated for dev & prod
- ✅ **Build successful** - Ready to deploy

---

## What You Have

### File Storage Service Implementations
```
FileStorageService (interface)
├─ LocalFileStorageService        @ConditionalOnProperty(havingValue="local")
├─ SupabaseFileStorageService     @ConditionalOnProperty(havingValue="supabase")
├─ S3FileStorageService           @ConditionalOnProperty(havingValue="s3")
└─ R2FileStorageService           @ConditionalOnProperty(havingValue="r2")
```

### Configuration Files
- `application.yml` - Base configuration (all environments)
- `application-dev.yml` - Dev profile overrides (hot-reload enabled)
- `.env.dev` - Development environment variables (with Supabase creds)
- `.env.prod` - Production environment variables (template)
- `.env.example` - Template for contributors (no secrets)

### Main Application Class
- `DebateApplication.java` - Enhanced with comprehensive .env loading
  - Loads `.env.dev` → `.env` → `.env.local` (in order)
  - Maps all storage provider variables to Spring properties

---

## How to Use

### Running Development Backend with Supabase

**Step 1: Copy environment file**
```powershell
cd D:\temp\tarkVtark.com\backend
Copy-Item .env.dev .env
```

**Step 2: Start backend**
```powershell
mvn spring-boot:run -D"spring-boot.run.profiles=dev"
```

**Step 3: Verify in logs**
Look for:
```
... FILE_PROVIDER=supabase
... SUPABASE_URL=https://jhqlijxwinzsgqgjzhwu.supabase.co
... SupabaseFileStorageService initialized
... Tomcat started on port 8080
```

**Step 4: Upload and test**
```powershell
curl -i -X POST `
  -F "file=@C:\path\to\image.jpg" `
  -F "questionId=test-uuid" `
  http://localhost:8080/api/v1/files/upload
```

**Expected response:**
```json
{
  "storageProvider": "supabase",   ← ✅ Should say "supabase"
  "storageUrl": "https://jhqlijxwinzsgqgjzhwu.supabase.co/storage/v1/object/public/attachments/...",
  ...
}
```

### Switching to Different Provider

**To use S3:**
```env
FILE_PROVIDER=s3
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=your-bucket
AWS_REGION=us-east-1
```

**To use R2:**
```env
FILE_PROVIDER=r2
R2_ACCESS_KEY_ID=your_key
R2_SECRET_ACCESS_KEY=your_secret
R2_BUCKET=your-bucket
R2_ENDPOINT=https://your-endpoint.r2.cloudflairstorage.com
```

**To use Local (no external dependencies):**
```env
FILE_PROVIDER=local
FILE_UPLOAD_DIR=./uploads
FILE_BASE_URL=http://localhost:8080
```

---

## Documentation Files

| File | Purpose |
|------|---------|
| **GENERIC_STORAGE_SERVICE_GUIDE.md** | Comprehensive architecture & design patterns |
| **QUICK_FIX_LOCAL_PROVIDER_ISSUE.md** | Troubleshooting guide for "still getting local" problem |
| **RUN_DEV_WITH_SUPABASE.md** | Step-by-step instructions to run dev backend |
| **API_CONTRACT.yaml** | OpenAPI specification for file upload endpoints |

---

## Key Files Modified

```
backend/
├── src/main/java/com/debatearena/
│   ├── DebateApplication.java           ← Enhanced .env loading
│   ├── service/
│   │   ├── FileStorageService.java       ← Interface (unchanged)
│   │   ├── LocalFileStorageService.java  ← @ConditionalOnProperty("local")
│   │   ├── SupabaseFileStorageService.java ← @ConditionalOnProperty("supabase")
│   │   ├── S3FileStorageService.java     ← @ConditionalOnProperty("s3")
│   │   └── R2FileStorageService.java     ← @ConditionalOnProperty("r2")
│   └── controller/
│       └── FileUploadController.java     ← Uses FileStorageService (no changes needed)
│
├── src/main/resources/
│   ├── application.yml                  ← Updated with all providers config
│   └── application-dev.yml              ← NEW - dev-specific config
│
├── .env.dev                              ← Development environment (Supabase ready)
├── .env.prod                             ← Production template
└── .env.example                          ← Public template (no secrets)
```

---

## Verification Checklist

- [ ] **Build succeeds**: `mvn clean -DskipTests package` returns BUILD SUCCESS
- [ ] `.env.dev` contains `FILE_PROVIDER=supabase`
- [ ] `.env.dev` contains valid `SUPABASE_*` credentials
- [ ] `.env` file exists in backend directory (copied from `.env.dev`)
- [ ] Backend starts with command: `mvn spring-boot:run -D"spring-boot.run.profiles=dev"`
- [ ] Backend logs show: `SupabaseFileStorageService initialized`
- [ ] Upload response shows: `"storageProvider": "supabase"`
- [ ] File appears in Supabase Storage dashboard

---

## Database

When files are uploaded, they're stored in the `attachments` table:

```sql
CREATE TABLE attachments (
    id UUID PRIMARY KEY,
    file_name VARCHAR(255),
    file_size BIGINT,
    file_type VARCHAR(100),
    storage_provider VARCHAR(50),  -- "local", "supabase", "s3", "r2"
    storage_url TEXT,               -- Full URL to the file
    uploaded_by VARCHAR(255),
    created_at TIMESTAMP,
    ...
);
```

### Query Recent Uploads
```sql
SELECT id, file_name, storage_provider, storage_url, created_at 
FROM attachments 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## Architecture Benefits

✅ **Zero Code Duplication** - Controllers don't care which provider is used

✅ **Runtime Configuration** - Change providers by editing `.env`, not code

✅ **Production-Ready** - Same code runs on all environments

✅ **Testable** - Easy to mock `FileStorageService` for unit tests

✅ **Extensible** - Add Google Cloud Storage, Azure Blob, etc. without touching existing code

✅ **Cost Optimization** - Use local storage for dev, S3 for high-traffic prod

---

## Common Tasks

### Search and Replace `FILE_PROVIDER` Across Codebase

If you need to support additional providers:

1. Add a new `@Service` class implementing `FileStorageService`
2. Annotate with `@ConditionalOnProperty(name = "file.provider", havingValue = "myprovider")`
3. Add configuration section to `application.yml`
4. Add environment variable mappings to `DebateApplication.java`
5. Add values to `.env.dev` and `.env.prod`
6. No other code changes needed!

### Migrate Existing Files

If you have files in local storage and want to move to Supabase:

```sql
-- 1. Backup
BACKUP TABLE attachments TO 'backup_' + CURRENT_DATE;

-- 2. Update all records (if using same bucket)
UPDATE attachments 
SET storage_provider = 'supabase',
    storage_url = 'https://jhqlijxwinzsgqgjzhwu.supabase.co/storage/v1/object/public/attachments/' || file_name 
WHERE storage_provider = 'local';
```

Then implement a migration script to:
1. Read files from `./uploads`
2. Upload each to Supabase
3. Update DB records with new URLs

---

## Troubleshooting

### Problem: Still seeing `"storageProvider": "local"`

**Solution:** See `QUICK_FIX_LOCAL_PROVIDER_ISSUE.md`

**Quick Fix:**
```powershell
# 1. Stop backend (Ctrl+C)
# 2. Copy .env
Copy-Item .env.dev .env
# 3. Restart
mvn spring-boot:run -D"spring-boot.run.profiles=dev"
```

### Problem: Build Fails

**Solution:**
```powershell
mvn clean
mvn -DskipTests package
```

Check for compile errors in service classes.

### Problem: Supabase Upload 401 Unauthorized

**Solution:** Verify credentials in `.env`:
```powershell
# Check if credentials are intact
Get-Content .env | Select-String -Pattern "SUPABASE" | Select-String -Pattern "KEY"
```

Key should start with `eyJ` (base64 JWT).

---

## Next Steps

1. **🚀 Start backend with Supabase:**
   ```powershell
   cd D:\temp\tarkVtark.com\backend
   Copy-Item .env.dev .env
   mvn spring-boot:run -D"spring-boot.run.profiles=dev"
   ```

2. **📤 Upload a test file:**
   Use PostMan or cURL to POST to `/api/v1/files/upload`

3. **✅ Verify in Supabase:**
   Check Supabase Storage dashboard for the uploaded file

4. **📚 Read architecture docs:**
   Open `GENERIC_STORAGE_SERVICE_GUIDE.md` for deep dive

5. **🔧 Setup IntelliJ Run Config:**
   See `RUN_DEV_WITH_SUPABASE.md` for IDE setup

---

## Support

If you encounter issues:

1. Check `QUICK_FIX_LOCAL_PROVIDER_ISSUE.md` first
2. Verify `.env.dev` → `.env` is copied
3. Check backend logs for provider name
4. Run debug endpoint: `GET /api/v1/debug/config` (if added)
5. Query database: `SELECT * FROM attachments ORDER BY created_at DESC LIMIT 5;`

---

## Files Summary

**Created/Modified:**
- ✅ `backend/src/main/java/com/debatearena/DebateApplication.java` - Enhanced env loading
- ✅ `backend/src/main/resources/application-dev.yml` - Dev profile config
- ✅ `backend/.env.dev` - Dev environment variables
- ✅ `backend/.env.prod` - Prod template
- ✅ `backend/.env.example` - Public template
- ✅ Backend service implementations (4 providers)

**Documentation:**
- 📄 `GENERIC_STORAGE_SERVICE_GUIDE.md` - Architecture reference
- 📄 `QUICK_FIX_LOCAL_PROVIDER_ISSUE.md` - Problem solver
- 📄 `RUN_DEV_WITH_SUPABASE.md` - Quick start guide
- 📄 `BACKEND_STORAGE_SETUP_SUMMARY.md` - This file

---

**Version:** 1.0.0  
**Last Updated:** 2026-07-11  
**Status:** ✅ Ready for Development & Production


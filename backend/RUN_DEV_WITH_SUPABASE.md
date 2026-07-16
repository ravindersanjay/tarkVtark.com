# Running Backend with Supabase Storage (Development)

## Quick Start

### From Backend Directory

**PowerShell:**
```powershell
# Copy .env.dev to .env (required for Spring to load environment variables)
Copy-Item .env.dev .env

# Run with dev profile
mvn spring-boot:run -D"spring-boot.run.profiles=dev"
```

**Bash/Unix:**
```bash
# Copy .env.dev to .env
cp .env.dev .env

# Run with dev profile
mvn spring-boot:run -D"spring-boot.run.profiles=dev"
```

---

## How It Works

1. **application-dev.yml** loads on the dev profile
2. **Spring config import** reads environment variables from `.env.dev`
3. **Configuration properties** like `FILE_PROVIDER` and `SUPABASE_*` are sourced from `.env`
4. **FileStorageService** implementation is auto-selected via `@ConditionalOnProperty`:
   - If `FILE_PROVIDER=supabase` → SupabaseFileStorageService bean is created
   - If `FILE_PROVIDER=local` → LocalFileStorageService bean is created
   - If `FILE_PROVIDER=s3` → S3FileStorageService bean is created
   - If `FILE_PROVIDER=r2` → R2FileStorageService bean is created

---

## Key Configuration Files

### `.env.dev` (Environment Variables)
```
FILE_PROVIDER=supabase
SUPABASE_URL=https://jhqlijxwinzsgqgjzhwu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_STORAGE_BUCKET=attachments
FILE_BASE_URL=http://localhost:8080
```

### `application-dev.yml` (Profile-Specific Config)
```yaml
spring:
  config:
    import: optional:file:.env.dev[.properties]  # Load .env.dev as properties

file:
  provider: ${FILE_PROVIDER:local}  # Read from .env.dev, default to local
  upload-dir: ${FILE_UPLOAD_DIR:./uploads}
  base-url: ${FILE_BASE_URL:http://localhost:8080}

supabase:
  url: ${SUPABASE_URL:}
  service-role-key: ${SUPABASE_SERVICE_ROLE_KEY:}
  storage-bucket: ${SUPABASE_STORAGE_BUCKET:attachments}
```

---

## Verifying Configuration at Startup

**Expected log output:**
```
Starting Main application...
2026-07-11T15:40:00.000Z  INFO: Spring Profile: dev
2026-07-11T15:40:00.000Z  DEBUG: file.provider = supabase
2026-07-11T15:40:00.000Z  DEBUG: supabase.url = https://jhqlijxwinzsgqgjzhwu.supabase.co
2026-07-11T15:40:00.000Z  DEBUG: supabase.storage-bucket = attachments
Tomcat started on port 8080
```

---

## Testing Upload with Supabase

### Using cURL (PowerShell)
```powershell
# First, create a test image file
$testImage = "C:\temp\test.jpg"  # Use actual image path

# Upload to backend
curl -i -X POST `
  -F "file=@$testImage" `
  -F "questionId=test-question-id" `
  http://localhost:8080/api/v1/files/upload
```

### Expected Response (Supabase)
```json
{
  "id": "0e137277-21f6-4515-9ef5-5be26a725219",
  "fileName": "test.jpg",
  "fileSize": 82645,
  "fileType": "image/jpeg",
  "storageUrl": "https://jhqlijxwinzsgqgjzhwu.supabase.co/storage/v1/object/public/attachments/abc-def-ghi-jkl.jpg",
  "storageProvider": "supabase",  ← Should be "supabase"
  "uploadedBy": "TestUser",
  "createdAt": "2026-07-11T15:40:05.926617"
}
```

### If Still Showing "local"

**Step 1: Verify .env is being read**
```powershell
# Check if .env.dev file exists and is readable
Test-Path .env.dev
```

**Step 2: Verify environment variable is set in the running process**
- Backend logs should show: `FILE_PROVIDER = supabase`
- If not, restart the backend after ensuring .env.dev is copied to .env

**Step 3: Check database record**
```sql
SELECT id, file_name, storage_provider, storage_url, created_at 
FROM attachments 
ORDER BY created_at DESC 
LIMIT 1;
```

---

## Switching Between Providers

Edit `.env.dev` and change:
```
# For Local Storage (development)
FILE_PROVIDER=local

# For Supabase Storage
FILE_PROVIDER=supabase

# For AWS S3
FILE_PROVIDER=s3

# For Cloudflare R2
FILE_PROVIDER=r2
```

Then restart the backend.

---

## Troubleshooting

### Issue: Still getting "local" provider

**Cause 1:** `.env` file not created
```powershell
# Solution: Copy .env.dev to .env
Copy-Item .env.dev .env
```

**Cause 2:** Backend not restarted after .env change
```powershell
# Stop the backend (Ctrl+C)
# Then run again:
mvn spring-boot:run -D"spring-boot.run.profiles=dev"
```

**Cause 3:** Wrong working directory
```powershell
# Ensure you're in the backend directory
cd D:\temp\tarkVtark.com\backend
```

### Issue: "Supabase upload failed"

Check backend logs for error details:
```
[ERROR] Supabase upload failed: 401 ...
```

**Common causes:**
- SUPABASE_SERVICE_ROLE_KEY is missing or invalid
- SUPABASE_URL is incorrect
- Bucket name doesn't exist or is misspelled

---

## IDE Run Configuration (IntelliJ IDEA)

For easier development without command-line flags:

1. **Edit Run Configurations** (Run → Edit Configurations)
2. **Create new Maven run configuration**
3. **Settings:**
   - Name: `Backend (Dev with Supabase)`
   - Working directory: `$PROJECT_DIR$/backend`
   - Command line: `spring-boot:run -D"spring-boot.run.profiles=dev"`
   - Environment variables: (leave empty - .env will be loaded automatically)
4. **Click Run** (or Shift+F10)

---

## Production (No Profile)

```powershell
# Copy .env.prod to .env
Copy-Item .env.prod .env

# Run without profile (uses application.yml only)
mvn spring-boot:run
```


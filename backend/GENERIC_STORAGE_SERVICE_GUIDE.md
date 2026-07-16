# Generic File Storage Service Architecture

## Overview

Your project uses a **generic, provider-agnostic File Storage Service** that allows seamless switching between different storage backends without changing any controller or business logic code.

### Supported Storage Providers

| Provider | Ideal For | Configuration |
|----------|-----------|---|
| **local** | Development | `FILE_PROVIDER=local` |
| **supabase** | Development/Production | `FILE_PROVIDER=supabase` + Supabase credentials |
| **s3** | Production (AWS) | `FILE_PROVIDER=s3` + AWS credentials |
| **r2** | Production (Cloudflare) | `FILE_PROVIDER=r2` + Cloudflare R2 credentials |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ FileUploadController                                         │
│ - POST /files/upload                                        │
│ - GET /files/key/**                                         │
│ - DELETE /files/{id}                                        │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼ (Dependency Injection)
┌─────────────────────────────────────────────────────────────┐
│ FileStorageService (Interface)                              │
│ - uploadFile(MultipartFile, String): String                │
│ - deleteFile(String): void                                 │
│ - getProviderName(): String                                │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┼──────────┬──────────┐
        │          │          │          │
        ▼          ▼          ▼          ▼
   ┌────────┐ ┌───────────┐ ┌────────┐ ┌──────┐
   │ Local  │ │ Supabase  │ │  AWS   │ │ R2   │
   │ Store  │ │  Storage  │ │  S3    │ │ (CDN)│
   │        │ │           │ │        │ │      │
   │./uploads│ │ REST API │ │ SDK    │ │ SDK  │
   └────────┘ └───────────┘ └────────┘ └──────┘
```

**Key Point:** FileUploadController NEVER knows which provider is being used. It simply calls `fileStorageService.uploadFile()` and gets back a URL.

---

## How It Works

### 1. Configuration-Based Selection

The provider is selected via **Spring's `@ConditionalOnProperty` annotation**:

```java
@Service
@ConditionalOnProperty(name = "file.provider", havingValue = "supabase")
public class SupabaseFileStorageService implements FileStorageService {
    // ...
}

@Service
@ConditionalOnProperty(name = "file.provider", havingValue = "local", matchIfMissing = true)
public class LocalFileStorageService implements FileStorageService {
    // ...
}
```

### 2. Environment Variable Loading

**Entry Point:** `DebateApplication.java` (main method)

```java
public static void main(String[] args) {
    // Loads .env.dev → .env → .env.local (in order)
    Dotenv dev = Dotenv.configure().filename(".env.dev").ignoreIfMissing().load();
    Dotenv base = Dotenv.configure().filename(".env").ignoreIfMissing().load();
    
    // Maps environment variables to Spring properties
    mapIfPresent(dev, "FILE_PROVIDER", "file.provider");  // Read FILE_PROVIDER from .env
    mapIfPresent(dev, "SUPABASE_URL", "supabase.url");     // Read SUPABASE_URL
    // ... more mappings ...
    
    SpringApplication.run(DebateApplication.class, args);
}
```

### 3. Spring Configuration Binding

**File:** `application.yml` and `application-dev.yml`

```yaml
file:
  provider: ${FILE_PROVIDER:local}  # Uses mapped property from .env
  upload-dir: ${FILE_UPLOAD_DIR:./uploads}
  base-url: ${FILE_BASE_URL:http://localhost:8080}

supabase:
  url: ${SUPABASE_URL:}
  service-role-key: ${SUPABASE_SERVICE_ROLE_KEY:}
  storage-bucket: ${SUPABASE_STORAGE_BUCKET:attachments}
```

### 4. Service Implementation Selection

When Spring starts:
1. Reads `file.provider` from application.yml (which came from .env)
2. Scans all `@Service` classes implementing `FileStorageService`
3. Checks each class's `@ConditionalOnProperty` annotation
4. Auto-selects the matching implementation
5. Injects it into `FileUploadController`

```java
@RestController
public class FileUploadController {
    @Autowired
    private FileStorageService fileStorageService;  // ← Spring auto-selects impl
    
    @PostMapping("/upload")
    public ResponseEntity<AttachmentDTO> upload(MultipartFile file) {
        String url = fileStorageService.uploadFile(file, "attachments");  // ← Works with any provider
        // ...
    }
}
```

---

## Switching Between Providers

### Switch from Local to Supabase

**File:** `.env.dev`

**Before:**
```env
FILE_PROVIDER=local
```

**After:**
```env
FILE_PROVIDER=supabase
SUPABASE_URL=https://jhqlijxwinzsgqgjzhwu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_STORAGE_BUCKET=attachments
```

**Then restart backend:**
```powershell
# Stop the running backend (Ctrl+C)
# Copy .env.dev to .env
Copy-Item .env.dev .env
# Run again
mvn spring-boot:run -D"spring-boot.run.profiles=dev"
```

### Switch from Supabase to S3

**File:** `.env.dev`

```env
FILE_PROVIDER=s3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=my-bucket-name
AWS_REGION=us-east-1
```

Then restart backend. No code changes needed!

---

## Running Backend with Different Providers

### Development with Local Storage
```powershell
# .env.dev
FILE_PROVIDER=local
FILE_UPLOAD_DIR=./uploads

# Run
Copy-Item .env.dev .env
mvn spring-boot:run -D"spring-boot.run.profiles=dev"
```

### Development with Supabase
```powershell
# .env.dev
FILE_PROVIDER=supabase
SUPABASE_URL=https://jhqlijxwinzsgqgjzhwu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Run
Copy-Item .env.dev .env
mvn spring-boot:run -D"spring-boot.run.profiles=dev"
```

### Production with AWS S3
```powershell
# .env.prod
FILE_PROVIDER=s3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=debate-arena-prod

# Run
Copy-Item .env.prod .env
mvn spring-boot:run  # No profile = uses application.yml
```

---

## Implementation Details

### FileStorageService Interface

```java
public interface FileStorageService {
    /**
     * Upload a file to storage
     * @param file The file to upload
     * @param folder Folder path (e.g., "attachments")
     * @return Public URL to access the file
     */
    String uploadFile(MultipartFile file, String folder) throws IOException;

    /**
     * Delete a file from storage
     * @param fileUrl The URL or key of the file to delete
     */
    void deleteFile(String fileUrl) throws IOException;

    /**
     * Get the storage provider name
     * @return "local", "s3", "r2", or "supabase"
     */
    String getProviderName();
}
```

### Implementations

#### LocalFileStorageService
- **Stores files:** In `./uploads` directory (or `${FILE_UPLOAD_DIR}`)
- **Returns URL:** `http://localhost:8080/api/v1/files/key/attachments/{uuid}.{ext}`
- **Best for:** Development, testing
- **When to use:** Quick local iteration

#### SupabaseFileStorageService
- **Stores files:** Supabase Storage REST API
- **Returns URL:** `https://xxx.supabase.co/storage/v1/object/public/attachments/{path}`
- **Best for:** Development or small-scale production
- **When to use:** Free/dev tier projects, quick cloud integration

#### S3FileStorageService
- **Stores files:** AWS S3 bucket
- **Returns URL:** `https://s3.amazonaws.com/bucket-name/{path}` (or custom domain)
- **Best for:** Production
- **When to use:** High-traffic, enterprise deployments

#### R2FileStorageService
- **Stores files:** Cloudflare R2 storage (S3-compatible)
- **Returns URL:** `https://r2.custom-domain.com/{path}` (via CDN)
- **Best for:** Production with CDN
- **When to use:** Better pricing than S3, built-in CDN

---

## Database Integrity

When a file is uploaded, the database stores:

```sql
INSERT INTO attachments (
    file_name,
    storage_provider,  -- "local", "supabase", "s3", or "r2"
    storage_url,       -- Full URL returned by provider
    created_at
) VALUES (...);
```

### Database Query Example

```sql
-- See all uploaded files and their provider
SELECT 
    id,
    file_name,
    storage_provider,
    storage_url,
    created_at
FROM attachments
ORDER BY created_at DESC;

-- Example output:
-- id | file_name       | storage_provider | storage_url                                              | created_at
-- ---|-----------------|------------------|---------------------------------------------------------|---
-- 1  | doc.pdf         | supabase         | https://xxx.supabase.co/storage/v1/object/public/...    | 2026-07-11
-- 2  | image.jpg       | local            | http://localhost:8080/api/v1/files/key/attachments/...  | 2026-07-10
-- 3  | video.mp4       | s3               | https://my-bucket.s3.amazonaws.com/...                  | 2026-07-09
```

The client doesn't need to know which provider is used—it just stores and retrieves files via the same API endpoints.

---

## Advantages

✅ **No Controller Changes:** Add new storage backend without touching `FileUploadController`

✅ **Easy Configuration:** Switch providers by changing one environment variable

✅ **Dev-Prod Parity:** Same code runs on local, staging, and production

✅ **Testing:** Easy to mock `FileStorageService` for unit tests

✅ **Future-Proof:** Add new providers (e.g., Google Cloud Storage) without refactoring existing code

✅ **Per-File Provider:** Different files can be stored in different providers if needed

---

## Adding a New Storage Provider

To add Google Cloud Storage, for example:

### 1. Create Implementation

```java
package com.debatearena.service;

@Service
@ConditionalOnProperty(name = "file.provider", havingValue = "gcs")
public class GoogleCloudStorageService implements FileStorageService {
    
    @Value("${gcs.bucket}")
    private String bucket;
    
    @Override
    public String uploadFile(MultipartFile file, String folder) throws IOException {
        // ... upload to GCS ...
        return "https://storage.googleapis.com/" + bucket + "/" + path;
    }
    
    @Override
    public void deleteFile(String fileUrl) throws IOException {
        // ... delete from GCS ...
    }
    
    @Override
    public String getProviderName() {
        return "gcs";
    }
}
```

### 2. Add Configuration

**application.yml:**
```yaml
gcs:
  bucket: ${GCS_BUCKET:}
  project-id: ${GCS_PROJECT_ID:}
```

### 3. Use It

```env
FILE_PROVIDER=gcs
GCS_BUCKET=my-bucket
GCS_PROJECT_ID=my-project
```

No other code needs to change!

---

## Troubleshooting

### Issue: Still getting "local" provider after changing .env.dev

**Root Cause:** Backend not restarted or .env not copied to .env

**Solution:**
```powershell
# 1. Copy .env.dev to .env
Copy-Item .env.dev .env

# 2. Stop backend (Ctrl+C)

# 3. Restart
mvn spring-boot:run -D"spring-boot.run.profiles=dev"

# 4. Watch logs for:
# "SupabaseFileStorageService initialized" or "LocalFileStorageService initialized"
```

### Issue: "Unsupported provider: unknown"

**Solution:** 
- Check `FILE_PROVIDER` value in .env
- Must be exactly one of: `local`, `supabase`, `s3`, `r2`
- No spaces or extra characters

### Issue: Supabase upload fails with 401 Unauthorized

**Solution:**
- Verify `SUPABASE_SERVICE_ROLE_KEY` is copied exactly
- Keys are case-sensitive and long
- Restart backend to reload new key value

---

## Best Practices

1. **Environment Separation**
   - `.env.dev` → Development (Supabase or Local)
   - `.env.prod` → Production (S3 or R2)
   - Never commit real credentials; use placeholders in `.env.example`

2. **Key Management**
   - Store API keys in runtime environment, never in code
   - Use `.env.local` for machine-specific overrides
   - Rotate keys regularly

3. **Monitoring**
   - Log provider name at startup
   - Track upload/delete operations
   - Monitor storage usage per provider

4. **Testing**
   - Use `local` provider in unit tests (no external calls)
   - Use `MockFileStorageService` in integration tests if available
   - Test each provider in CI/CD pipeline

5. **Fallback Strategy**
   - If remote provider fails, consider implementing retry logic
   - Keep `local` as a fallback for emergencies
   - Document provider failover procedures


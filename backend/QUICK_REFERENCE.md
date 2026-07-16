# Quick Reference Card - File Storage System

## 🚀 Start Here (Development with Supabase)

```powershell
# Step 1: Copy environment file
Copy-Item .env.dev .env

# Step 2: Start backend
mvn spring-boot:run -D"spring-boot.run.profiles=dev"

# Step 3: Test upload (from another terminal)
curl -X POST -F "file=@C:\path\to\image.jpg" -F "questionId=test-id" http://localhost:8080/api/v1/files/upload

# Step 4: Check response
# Should show: "storageProvider": "supabase"
```

---

## 🔄 Switch Between Providers

### Local Storage (Development - No Dependencies)
```env
FILE_PROVIDER=local
FILE_UPLOAD_DIR=./uploads
FILE_BASE_URL=http://localhost:8080
```
**Files stored in:** `./uploads` directory  
**URL format:** `http://localhost:8080/api/v1/files/key/attachments/uuid.jpg`

### Supabase (Development or Small Production)
```env
FILE_PROVIDER=supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
SUPABASE_STORAGE_BUCKET=attachments
```
**Files stored in:** Supabase Storage REST API  
**URL format:** `https://your-project.supabase.co/storage/v1/object/public/attachments/uuid.jpg`

### AWS S3 (Production)
```env
FILE_PROVIDER=s3
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=my-bucket
AWS_REGION=us-east-1
```
**Files stored in:** AWS S3 bucket  
**URL format:** `https://my-bucket.s3.amazonaws.com/attachments/uuid.jpg`

### Cloudflare R2 (Production with CDN)
```env
FILE_PROVIDER=r2
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=my-bucket
R2_ENDPOINT=https://xxx.r2.cloudflairstorage.com
R2_PUBLIC_BASE_URL=https://cdn.example.com
```
**Files stored in:** Cloudflare R2 (S3-compatible)  
**URL format:** `https://cdn.example.com/attachments/uuid.jpg`

---

## 🔧 Configuration Files

| File | Purpose | Edit? |
|------|---------|-------|
| `.env.dev` | Dev environment variables | ✏️ EDIT |
| `.env.prod` | Prod template (copy to .env on prod server) | ✏️ EDIT |
| `application.yml` | Base config (all environments) | ⚠️ Only if changing core settings |
| `application-dev.yml` | Dev profile overrides | ⚠️ Usually don't edit |
| `.env.example` | Public template (no secrets, for GitHub) | ✏️ EDIT |

---

## 📋 Common Steps

### Add New Environment Variable
1. Add to `.env.dev`
2. Add to `DebateApplication.java` `mapIfPresent()` call
3. Add to `application-dev.yml` property binding
4. Restart backend

### Test Supabase Connection
```powershell
# Check .env file exists
ls .env

# View FILE_PROVIDER value
Get-Content .env | Select-String "FILE_PROVIDER"

# View Supabase URL
Get-Content .env | Select-String "SUPABASE"
```

### Debug: What Provider is Running?
```powershell
# Check backend logs during startup
# Look for:
# - "FILE_PROVIDER=supabase" 
# - "SupabaseFileStorageService initialized"
# - "Tomcat started on port 8080"

# OR create debug endpoint in FileUploadController
```

### Verify Database
```sql
-- See all uploads and their provider
SELECT id, file_name, storage_provider, storage_url, created_at 
FROM attachments 
ORDER BY created_at DESC;
```

---

## ⚠️ Common Mistakes

| ❌ Mistake | ✅ Solution |
|-----------|-----------|
| Running backend, then editing `.env.dev`, expecting it to reload | Copy `.env.dev` to `.env` and RESTART backend |
| Typo in FILE_PROVIDER (e.g., `Supabase` or `s3 `) | Use exact values: `local`, `supabase`, `s3`, `r2` (no spaces) |
| Running from wrong directory | Always run from `backend/` directory: `cd D:\temp\tarkVtark.com\backend` |
| Not copying `.env.dev` to `.env` | Backend reads `.env`, not `.env.dev`. Copy: `Copy-Item .env.dev .env` |
| Credentials expired or invalid | Regenerate/update credentials in `.env.dev` and restart |

---

## 🏗️ Architecture

```
[Controller]
    ↓ (Autowire)
[FileStorageService] ← Interface
    ↓ (Spring @Conditional)
[Implementation Selected by FILE_PROVIDER]
    ├─ LocalFileStorageService (FILE_PROVIDER=local)
    ├─ SupabaseFileStorageService (FILE_PROVIDER=supabase)
    ├─ S3FileStorageService (FILE_PROVIDER=s3)
    └─ R2FileStorageService (FILE_PROVIDER=r2)
```

**Key:** Controller NEVER knows which provider. Spring auto-selects based on config.

---

## 📊 Comparison

| Feature | Local | Supabase | S3 | R2 |
|---------|-------|----------|----|----|
| Setup Time | 1 min | 5 min | 15 min | 10 min |
| Cost | Free | $5-25/mo | $0.023/GB | $0.015/GB |
| Speed | Fast | Medium | Fast | Fastest (CDN) |
| For Dev | ✅ Yes | ✅ Yes | ❌ Overkill | ❌ Overkill |
| For Prod | ❌ No | ✅ Small sites | ✅ Large | ✅ Best value |

---

## 📞 Troubleshooting

### Q: Still getting `storageProvider: local` after changing .env.dev

A: You need to:
1. Stop the backend (Ctrl+C)
2. Copy `.env.dev` to `.env`: `Copy-Item .env.dev .env`
3. Restart backend: `mvn spring-boot:run -D"spring-boot.run.profiles=dev"`

### Q: Build fails with compilation error

A: Run:
```powershell
mvn clean
mvn -DskipTests compile
```
Check error messages. Usually in Java service files.

### Q: Can't upload to Supabase / 401 error

A: Check credentials:
1. Verify `SUPABASE_SERVICE_ROLE_KEY` is complete (should start with `eyJ`)
2. Verify `SUPABASE_URL` is correct
3. Verify bucket name is `attachments`
4. Restart backend

### Q: File uploaded but not appearing in Supabase dashboard

A: Check:
1. Response shows correct `storageUrl`
2. Database record was created (query attachments table)
3. Supabase dashboard showing correct bucket (check bucket selector)
4. File might be uploaded but not yet showing in UI (refresh)

---

## 🎯 Performance Tips

- **Dev:** Use `local` - no network overhead
- **Staging:** Use `s3` or `r2` - test real production behavior
- **Prod:** Use `r2` with Cloudflare CDN - best performance/cost
- **Multiple Regions:** Use S3 regions closer to users

---

## 🔐 Security

- **Never** commit real credentials to git
- Use `.env.dev` template with expiring test keys locally
- Use `.env.prod` template (placeholder) in repo
- Store real production keys in secure environment (AWS Secrets Manager, Vault, etc.)
- Rotate API keys regularly

---

## 📚 Full Documentation

- Architecture deep-dive: `GENERIC_STORAGE_SERVICE_GUIDE.md`
- Problem solving: `QUICK_FIX_LOCAL_PROVIDER_ISSUE.md`
- Running backend: `RUN_DEV_WITH_SUPABASE.md`
- Complete setup: `BACKEND_STORAGE_SETUP_SUMMARY.md`

---

## ✅ Ready to Go!

1. ✅ Build successful
2. ✅ Configurations ready
3. ✅ All providers supported
4. ✅ Documentation complete

**Next:** Run `Copy-Item .env.dev .env` and start backend! 🚀


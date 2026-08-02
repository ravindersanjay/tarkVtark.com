# Supabase Storage - Quick Reference

## Your Credentials (Already Configured ✅)

```
URL:                https://jhqlijxwinzsgqgjzhwu.supabase.co
Service Role Key:   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpocWxpanh3aW56c2dxZ2p6aHd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzUyNTEwOCwiZXhwIjoyMDk5MTAxMTA4fQ.kRiOhIgpVEFzat80ibb1qG3ck4iDkNGphPIauZx-RIk
Bucket Name:        attachments
Bucket Type:        PUBLIC
Environment:        Development & Production
```

---

## 5-Minute Setup Checklist

- [ ] **1. Create Supabase Bucket (2 min)**
  - Go to https://app.supabase.com → Storage → New Bucket
  - Name: `attachments` | Type: `Public` | Create

- [ ] **2. Start Backend with Supabase Config (1 min)**
  - Option A: IntelliJ → set ENV vars → Run
  - Option B: PowerShell → set $env vars → mvn spring-boot:run
  - Option C: Load .env.dev → Start

- [ ] **3. Start Frontend (1 min)**
  - `cd frontend && npm run dev`
  - Opens http://localhost:5173

- [ ] **4. Test Upload (1 min)**
  - Create question/reply
  - Add attachment
  - Verify file downloads

---

## Commands

### Start Backend (PowerShell)
```powershell
cd D:\temp\tarkVtark.com\backend
$env:FILE_PROVIDER = "supabase"
$env:SUPABASE_URL = "https://jhqlijxwinzsgqgjzhwu.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpocWxpanh3aW56c2dxZ2p6aHd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzUyNTEwOCwiZXhwIjoyMDk5MTAxMTA4fQ.kRiOhIgpVEFzat80ibb1qG3ck4iDkNGphPIauZx-RIk"
$env:SUPABASE_STORAGE_BUCKET = "attachments"
mvn spring-boot:run
```

### Start Frontend
```powershell
cd D:\temp\tarkVtark.com\frontend
npm run dev
```

---

## Expected URL Format for Uploaded Files

```
https://jhqlijxwinzsgqgjzhwu.supabase.co/storage/v1/object/public/attachments/[uuid].[ext]
```

**Example:**
```
https://jhqlijxwinzsgqgjzhwu.supabase.co/storage/v1/object/public/attachments/478a1d2b-9263-45aa-96b8-631e891ea378.jpeg
```

---

## Verify Setup

1. **Check Backend Logs:**
   - Look for: `📤 Uploading file using provider: supabase`
   - Look for: `Supabase upload succeeded`

2. **Check Supabase Dashboard:**
   - go.supabase.com → Storage → attachments
   - Should see uploaded files listed

3. **Test Download:**
   - Click attachment in UI
   - Should download/open successfully
   - No "port refused" errors

---

## Common Issues

| Issue | Solution |
|-------|----------|
| "storage is not configured" | Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars |
| "401 Unauthorized" | Verify Service Role Key is correct |
| "404 Not Found on download" | Verify bucket is "Public" in Supabase Storage settings |
| "Cannot connect to Supabase" | Check internet, verify URL is correct |

---

## Files Changed

```
✅ backend/src/main/resources/application.yml  (added Supabase config)
✅ backend/.env.dev                             (FILE_PROVIDER=supabase + credentials)
✅ backend/.env.prod                            (FILE_PROVIDER=supabase + credentials)
✅ backend/.env.example                         (added Supabase documentation)
```

---

## Documentation Files

- **SUPABASE_STORAGE_SETUP_GUIDE.md** ← Full guide (read this first!)
- **SUPABASE_STORAGE_QUICK_TEST.md** ← Step-by-step testing
- **SUPABASE_STORAGE_QUICK_REFERENCE.md** ← This file (you are here!)

---

**Status:** ✅ Code Ready | ⏳ Awaiting Bucket Setup | ⏳ Testing


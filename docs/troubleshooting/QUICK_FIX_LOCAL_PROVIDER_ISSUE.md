# Troubleshooting: Storage Provider Not Switching

## Problem
Running backend with `mvn spring-boot:run -D"spring-boot.run.profiles=dev"` but still getting `"storageProvider": "local"` instead of `"supabase"`.

## Root Cause
When you change `.env.dev`, the changes are NOT automatically loaded by the running backend. Here's why:

1. **Environment variables are read at startup** - When JVM starts, it reads all environment variables once
2. **`.env` file must be copied from `.env.dev`** - Spring Boot needs `.env` file in classpath, not `.env.dev`
3. **Configuration is cached after startup** - Changing `.env.dev` while backend is running has NO effect

## Solution (Step-by-Step)

### Step 1: Stop the Running Backend
- If backend is running, press **Ctrl+C** to stop it
- Wait for it to fully shut down (you'll see "Terminated" or similar message)

### Step 2: Copy .env.dev to .env
The key step that most people miss!

**PowerShell:**
```powershell
cd D:\temp\tarkVtark.com\backend
Copy-Item .env.dev .env
Write-Host "✅ Copied .env.dev to .env"
```

**Command Prompt (cmd.exe):**
```cmd
cd D:\temp\tarkVtark.com\backend
copy .env.dev .env
echo ✅ Copied .env.dev to .env
```

**Bash/Unix:**
```bash
cd backend
cp .env.dev .env
echo "✅ Copied .env.dev to .env"
```

### Step 3: Verify .env File Exists
```powershell
# PowerShell
if (Test-Path .env) { 
    Write-Host "✅ .env file found"
    Get-Content .env | Select-String "FILE_PROVIDER"
} else { 
    Write-Host "❌ .env file NOT found!"
}
```

Expected output:
```
✅ .env file found
FILE_PROVIDER=supabase
```

### Step 4: Start Backend with Dev Profile
```powershell
cd D:\temp\tarkVtark.com\backend
mvn spring-boot:run -D"spring-boot.run.profiles=dev"
```

### Step 5: Watch Startup Logs
Look for these lines in the console:

**Good Signs ✅:**
```
... FILE_PROVIDER=supabase
... SUPABASE_URL=https://jhqlijxwinzsgqgjzhwu.supabase.co
... SupabaseFileStorageService initialized
... Tomcat started on port 8080
```

**Bad Signs ❌:**
```
... FILE_PROVIDER=local
... LocalFileStorageService initialized  
... "Could not load .env files"
```

---

## Complete Step-by-Step Test

### 1. Create Test File

**PowerShell:**
```powershell
# Create a 1KB test image
$bytes = [byte[]]@(137, 80, 78, 71, 13, 10, 26, 10)  # PNG header
$bytes += [byte[]]@(0..255 | Get-Random) * 100
[System.IO.File]::WriteAllBytes("$env:TEMP\test.png", $bytes)
Write-Host "✅ Test file created: $env:TEMP\test.png"
```

### 2. Upload and Check Response

```powershell
# From a new PowerShell window (keep backend running in another window)
$testFile = "$env:TEMP\test.png"
$response = curl -X POST `
  -F "file=@$testFile" `
  -F "questionId=test-q-123" `
  http://localhost:8080/api/v1/files/upload

Write-Host $response | ConvertFrom-Json | Format-Table

# Check storageProvider field
```

### 3. Expected Response (Supabase)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "fileName": "test.png",
  "fileSize": 8456,
  "fileType": "image/png",
  "storageUrl": "https://jhqlijxwinzsgqgjzhwu.supabase.co/storage/v1/object/public/attachments/abc-def-123.png",
  "storageProvider": "supabase",    ← ✅ SHOULD BE "supabase"
  "uploadedBy": "TestUser",
  "createdAt": "2026-07-11T15:40:05.926617",
  "fileSizeFormatted": "8.3 KB"
}
```

### 4. Verify in Supabase Dashboard
1. Login to Supabase: https://app.supabase.com
2. Select your project (jhqlijxwinzsgqgjzhwu)
3. Go to **Storage** → **attachments** bucket
4. Look for the uploaded file with name like `abc-def-123.png`

---

## Common Mistakes

### ❌ Mistake 1: Running Backend Before Copying .env
```
# Wrong - backend running with old config
mvn spring-boot:run

# Don't change .env.dev and expect it to reload!
# Editor changes .env.dev while backend is running
```

**Fix:** Always copy `.env.dev` to `.env` and restart backend.

### ❌ Mistake 2: Changing .env.dev Instead of .env
```powershell
# Wrong - editing the source file
notepad .env.dev
# Make changes
# Run backend

# Backend doesn't read .env.dev directly, only .env!
```

**Fix:** Let `.env.dev` be the template. Copy it to `.env`, then modify `.env` if needed.

### ❌ Mistake 3: Wrong Working Directory
```powershell
# Wrong - running from root directory
cd D:\temp\tarkVtark.com
mvn spring-boot:run

# Can't find .env file!
```

**Fix:** Always run from `backend` directory:
```powershell
cd D:\temp\tarkVtark.com\backend
mvn spring-boot:run -D"spring-boot.run.profiles=dev"
```

### ❌ Mistake 4: Typo in FILE_PROVIDER
```env
# Wrong
FILE_PROVIDER = supabase  # Extra spaces!
FILE_PROVIDER=Supabase    # Wrong case!
FILE_PROVIDER=s3          # Correct but need S3 instead

# Right
FILE_PROVIDER=supabase    # Exact match, no spaces
```

---

## Using IntelliJ IDEA (Recommended for Development)

Instead of using command-line `mvn spring-boot:run`, use IntelliJ's built-in run configuration:

### Setup

1. **Open IntelliJ IDEA**
2. **Click Run** → **Edit Configurations**
3. **Click +** → **Maven**
4. **Set these fields:**
   - Name: `Backend (Dev - Supabase)`
   - Working directory: `$PROJECT_DIR$/backend`
   - Command line: `spring-boot:run -D"spring-boot.run.profiles=dev"`
5. **Click OK**

### Run

1. **Make sure `.env` is copied to `.env`** from `.env.dev` (PowerShell):
   ```powershell
   cd D:\temp\tarkVtark.com\backend
   Copy-Item .env.dev .env
   ```
2. **Open IntelliJ**
3. **Select** `Backend (Dev - Supabase)` from dropdown
4. **Press** Shift+F10 (or click green Run button)
5. **Watch console** for startup messages

**Benefit:** No need to type command every time, just press F10!

---

## Production Mode (No Profile)

When deploying to production:

```powershell
cd D:\temp\tarkVtark.com\backend

# Copy production env
Copy-Item .env.prod .env

# Run without profile (uses application.yml directly)
mvn spring-boot:run
```

---

## Quick Reference

| Issue | Solution |
|-------|----------|
| Getting "local" provider | Copy `.env.dev` to `.env` and restart backend |
| Changes in `.env.dev` not taking effect | Restart backend after copying to `.env` |
| "Could not load .env files" in logs | Verify `.env` exists in `backend` directory |
| Supabase upload fails with 401 | Check SUPABASE_SERVICE_ROLE_KEY is correct |
| Backend won't start | Check that `backend` is the working directory |

---

## Debug Command (Check Current Configuration)

Add this endpoint temporarily to verify runtime config:

**Create file:** `backend/src/main/java/com/debatearena/controller/DebugController.java`

```java
package com.debatearena.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DebugController {
    
    @Value("${file.provider:NOT_SET}")
    private String fileProvider;
    
    @Value("${supabase.url:NOT_SET}")
    private String supabaseUrl;
    
    @GetMapping("/debug/config")
    public Object getConfig() {
        return Map.of(
            "file.provider", fileProvider,
            "supabase.url", supabaseUrl,
            "working_dir", System.getProperty("user.dir")
        );
    }
}
```

Then call:
```powershell
curl http://localhost:8080/api/v1/debug/config | ConvertFrom-Json
```

**Output:**
```json
{
  "file.provider": "supabase",
  "supabase.url": "https://jhqlijxwinzsgqgjzhwu.supabase.co",
  "working_dir": "D:\\temp\\tarkVtark.com\\backend"
}
```

If `file.provider` shows `"NOT_SET"`, the environment variables aren't being loaded!

---

## Next Steps

1. ✅ Copy `.env.dev` to `.env`
2. ✅ Start backend with: `mvn spring-boot:run -D"spring-boot.run.profiles=dev"`
3. ✅ Upload a test file
4. ✅ Verify `storageProvider` in response is `"supabase"`
5. ✅ Check Supabase dashboard to see the uploaded file
6. 📧 If still issues, share the response JSON and backend logs


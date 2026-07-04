# Quick Start - Test Attachment Fix

## What Changed
The attachment URL now includes the port (`:8080`), so when you click an attachment, it will actually reach your backend server.

**Before:**
```
http://localhost/api/v1/files/key/attachments/uuid.jpg  ❌ (no port - fails)
```

**After:**
```
http://localhost:8080/api/v1/files/key/attachments/uuid.jpg  ✅ (with port - works)
```

## Step-by-Step Testing in Dev Environment

### 1. Rebuild Backend with New Code
```bash
cd D:\temp\tarkVtark.com\backend
mvn -DskipTests clean package
```
✅ Build should succeed (BUILD SUCCESS message)

### 2. Start Backend Server
```bash
# Option A: From IDE (IntelliJ IDEA)
- Right-click Application.java → Run

# Option B: From terminal
cd D:\temp\tarkVtark.com\backend
mvn spring-boot:run

# Expected output should show:
# "Started Application in X seconds"
# "Server running on port 8080"
```

### 3. Start Frontend  
```bash
cd D:\temp\tarkVtark.com\frontend
npm run dev

# Should show:
# VITE v5.X.X  ready in XXX ms
# http://localhost:5173/
```

### 4. Test Attachment Upload
1. Open `http://localhost:5173` in browser
2. Create a new question or reply
3. Upload an attachment (image, PDF, etc.)
4. **Important:** Check your attachment was saved:
   - Folder `backend/uploads/attachments/` should exist with your file

### 5. Click Attachment to Download
1. Find your question/reply with attachment
2. Click the attachment link
3. **Expected Result:**
   - ✅ File downloads OR displays in browser
   - ✅ Browser URL shows `localhost:8080` (with port)
   - ✅ No "connection refused" error

### 6. Inspector Check (Advanced)
Open Browser DevTools (F12):
1. Go to `Network` tab
2. Click an attachment link
3. Look for request to `/api/v1/files/key/...`
4. **Should show:**
   - URL includes `:8080` port
   - Response status is `200 OK` (not 404 or connection error)
   - Response includes file data

## Common Issues & Fixes

### ❌ Still showing connection refused
**Solution:**
- Stop and restart backend (`mvn spring-boot:run`)
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh page (Ctrl+Shift+R)

### ❌ File not found (404)
**Solutions:**
- Check `backend/uploads/attachments/` folder exists
- Verify file was actually uploaded
- Check backend logs for upload errors

### ❌ Attachment link shows `http://localhost/` (no port)
**Solutions:**
- Verify backend server is running ON port 8080
- Check in DevTools that browser is requesting port 8080
- Rebuild backend: `mvn clean package`

### ❌ Backend won't start or has errors
**Solutions:**
- Check Java is installed: `java -version`
- Check Maven is installed: `mvn -version`
- Clear Maven cache: `mvn clean`
- Check logs for error details

## Verification Checklist

- [ ] Backend built successfully (BUILD SUCCESS)
- [ ] Backend running on port 8080
- [ ] Frontend running on port 5173
- [ ] Can upload attachment to a question/reply
- [ ] Attachment file exists in `backend/uploads/attachments/`
- [ ] Can click attachment link without connection error
- [ ] File downloads or opens in browser
- [ ] DevTools Network tab shows requests to `localhost:8080`

## Next Steps

Once this test passes:
1. ✅ Attachment feature is working in local dev
2. Keep backend running for more testing
3. Test creating multiple questions with different file types
4. Test reply attachments
5. When ready to deploy, ensure `SERVER_PORT=8080` is set in production config

## Questions?

Check the detailed fix documentation:
- `ATTACHMENT_URL_PORT_FIX_COMPLETE.md` - Full technical details
- `backend/src/main/java/com/debatearena/util/FileUrlUtil.java` - URL construction logic


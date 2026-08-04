# Hindi Character Encoding Fix - Complete Solution

## Problem
After page refresh, Hindi (Devanagari) text was displayed as URL-encoded junk characters:
```
%e0%a4%87%e0%a4%b8%e0%a4%95%e0%a5%89%e0%a4%a8%e0%a5%8d... 
```
Instead of actual Hindi text like:
```
इस्कॉन_vs_आर्य_समाज
```

## Root Cause
The HTTP responses were not declaring `charset=UTF-8` in their Content-Type headers. When `X-Content-Type-Options: nosniff` is set (for security), browsers won't auto-detect encoding and need it explicitly specified.

This caused the browser to interpret UTF-8-encoded Unicode characters as raw bytes, which then got URL-encoded for display.

## Solutions Applied ✅

### 1. **Frontend: Nginx Configuration** 
**File:** `frontend/nginx.conf`

Added:
```nginx
# UTF-8 character encoding for all responses
charset utf-8;
default_type text/html;

# Explicit UTF-8 in security headers
add_header Content-Type "text/html; charset=utf-8" always;
```

**Impact:** All HTML, CSS, and JavaScript files now explicitly declare UTF-8 encoding.

---

### 2. **Backend: Spring Boot Configuration**
**File:** `backend/src/main/resources/application.yml`

Added:
```yaml
spring:
  http:
    encoding:
      charset: UTF-8
      enabled: true
      force: true
```

**Impact:** Spring Boot will force UTF-8 encoding for all HTTP responses, including JSON APIs.

---

### 3. **Backend: Character Encoding Filter**
**File:** `backend/src/main/java/com/debatearena/config/CharacterEncodingFilter.java` (NEW)

Created a global servlet filter that:
- Sets `UTF-8` for all requests and responses
- Adds `Content-Type: application/json; charset=UTF-8` header
- Applies to every HTTP request automatically

**Impact:** All API responses (JSON data) will be properly encoded.

---

## Testing After Deployment

### Test 1: Direct Page Access
1. Go to `http://localhost:5173/इस्क्वों_vs_आर्य_समाज` (or your debate topic URL)
2. **Before fix:** Text appears as junk/encoded characters
3. **After fix:** Hindi text displays correctly
4. Press F5 (refresh) multiple times
5. Hindi should continue to display correctly ✅

### Test 2: API Response Headers
Check that responses have proper charset:

**Chrome DevTools:**
1. Open DevTools → Network tab
2. Make any API call (e.g., GET /api/v1/topics)
3. Click the request → Response Headers
4. Look for:
   ```
   Content-Type: application/json; charset=UTF-8
   ```
   Should see `charset=UTF-8` ✅

**Command line test:**
```bash
curl -i http://localhost:8080/api/v1/topics
# Look for: Content-Type: application/json;charset=UTF-8
```

### Test 3: Hindi Data Display
1. Refresh the page at a debate topic with Hindi text
2. The left and right labels should show Hindi correctly
3. Questions and answers with Hindi should display properly
4. Try searching or filtering by Hindi text
5. All should work without junk characters ✅

---

## Deployment Steps

### For Development (Local)
```bash
# 1. Rebuild backend (includes new CharacterEncodingFilter.java)
cd backend
mvn clean install

# 2. Rebuild frontend (uses new nginx.conf)
cd frontend
npm run build

# 3. Restart Docker containers
docker-compose down
docker-compose up -d

# 4. Test at http://localhost:5173
```

### For Render/Production

#### Backend Service:
1. Go to Render Dashboard → tarkvtark-backend
2. Click "Clear Build Cache" (Settings tab)
3. Trigger new deployment from main branch
4. Should pick up new `application.yml` and new `CharacterEncodingFilter.java`

#### Frontend Service:
1. Go to Render Dashboard → Frontend service
2. Rebuild will automatically use updated `nginx.conf`
3. Deployment should complete in ~2 minutes

#### Cloudflare/Static Host:
- Frontend rebuild will automatically update with new nginx config
- No additional steps needed

---

## Files Changed Summary

| File | Change | Impact |
|------|--------|--------|
| `frontend/nginx.conf` | Added `charset utf-8` and Content-Type headers | Frontend HTML/CSS/JS responses now UTF-8 |
| `backend/src/main/resources/application.yml` | Added `spring.http.encoding` config | Spring Boot forces UTF-8 for responses |
| `backend/src/main/java/com/debatearena/config/CharacterEncodingFilter.java` | NEW FILE | Global filter ensures all responses have UTF-8 charset |
| `frontend/index.html` | No change (already had `<meta charset="UTF-8" />`) | Already correct |

---

## How This Works (Technical Details)

### Before Fix (Broken)
```
Browser Request
    ↓
Nginx/Spring (no charset specified)
    ↓
Browser receives: `Content-Type: text/html` (no charset!)
    ↓
Browser assumes default (Latin-1/ISO-8859-1)
    ↓
UTF-8 bytes get misinterpreted as Latin-1
    ↓
Result: Junk characters displayed ❌
```

### After Fix (Working)
```
Browser Request
    ↓
Nginx/Spring (charset specified)
    ↓
Browser receives: `Content-Type: text/html; charset=UTF-8`
    ↓
Browser knows to use UTF-8 decoder
    ↓
UTF-8 bytes correctly decoded
    ↓
Result: Hindi text displays perfectly ✅
```

---

## Prevention for Future Issues

✅ Always include `charset=UTF-8` in:
- Nginx Content-Type responses
- Spring Boot application properties
- HTML `<meta charset>` tag (already present)
- Response headers from all services

✅ Test with multi-byte characters (Hindi, Arabic, Chinese, etc.)

✅ In DevTools Network tab, verify `charset=UTF-8` appears in responses

---

## Rollback (If Needed)

If something goes wrong after deployment:

**Revert Nginx config:** Remove lines 7-9, 21 from `nginx.conf`
**Revert Spring config:** Remove lines 8-13 from `application.yml`
**Revert Filter:** Delete `CharacterEncodingFilter.java`

But this shouldn't be necessary — the changes are safe and backward compatible! ✅



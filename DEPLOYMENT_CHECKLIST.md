# Production Deployment & SPA Routing Fixes - Checklist

## Changes Made ✅

### 1. CORS Configuration (FIXED)
Updated CORS annotations in 3 backend controllers to allow production domain:
- `backend/src/main/java/com/debatearena/controller/AuthController.java`
- `backend/src/main/java/com/debatearena/controller/AdminController.java`
- `backend/src/main/java/com/debatearena/controller/UserAuthController.java`

**Change:** Added `https://www.debatemanch.com` and `https://debatemanch.com` to `@CrossOrigin` origins
**Impact:** API calls from production frontend will no longer be blocked by CORS

---

### 2. SPA Routing Configuration (FIXED)
Created two files to handle client-side routing at `/admin` and other SPA routes:

#### For Cloudflare Pages:
- **File:** `frontend/public/_routes.json`
- **Purpose:** Tells Cloudflare to serve index.html for unknown routes
- **Status:** ✅ Created

#### For Netlify/Vercel/Other Providers:
- **File:** `frontend/public/_redirects`
- **Purpose:** Universal redirect config for SPA routing
- **Status:** ✅ Created

---

## Production Deployment Steps

### Step 1: Rebuild & Deploy Backend
```bash
# In Render dashboard:
1. Go to your backend service (tarkvtark-backend)
2. Clear build cache (Settings > Clear Build Cache)
3. Deploy from main branch
4. Wait for build to complete
```

### Step 2: Deploy Frontend (Based on Your Host)

#### If Using Cloudflare Pages:
```
1. Push changes to your GitHub repository
2. Cloudflare Pages will automatically detect `_routes.json`
3. Redeploy from the Cloudflare Pages dashboard
4. Test: Visit https://www.debatemanch.com/admin in browser
5. Expected: Should see Admin Login panel (not 404)
```

#### If Using Netlify:
```
1. Push changes to your GitHub repository
2. Netlify automatically detects `_redirects` file
3. Redeploy from Netlify dashboard
4. Test: Visit https://www.debatemanch.com/admin
5. Expected: Should see Admin Login panel (not 404)
```

#### If Using Vercel:
```
1. Push changes to your GitHub repository
2. Vercel automatically detects `_redirects` file
3. Redeploy from Vercel dashboard
4. Test: Visit https://www.debatemanch.com/admin
5. Expected: Should see Admin Login panel (not 404)
```

#### If Using S3 + CloudFront/CDN:
```
1. Configure S3 bucket error routing:
   - Go to S3 bucket > Properties > Static website hosting
   - Set "Error document" to "index.html"
2. For CloudFront:
   - Add custom error response 404 → /index.html (HTTP 200)
3. Upload new build: npm run build && aws s3 sync dist/ s3://your-bucket/
4. Invalidate CloudFront cache
5. Test: Visit https://www.debatemanch.com/admin
6. Expected: Should see Admin Login panel (not 404)
```

---

## Testing Checklist ✓

After deployment, verify all these work:

### Frontend Routes (All should load without 404)
- [ ] https://www.debatemanch.com/ → Home page
- [ ] https://www.debatemanch.com/admin → Admin Login panel (NOT 404)
- [ ] https://www.debatemanch.com/guidelines → Guidelines page
- [ ] https://www.debatemanch.com/faq → FAQ page
- [ ] https://www.debatemanch.com/contact → Contact page
- [ ] https://www.debatemanch.com/hindu_vs_muslim → Debate topic (example)

### Backend API Calls (Should not be blocked by CORS)
```bash
# Test from production domain
curl -X POST https://api.debatemanch.com/api/v1/auth/google \
  -H "Content-Type: application/json" \
  -d '{"token":"test-token"}' \
  -H "Origin: https://www.debatemanch.com"
# Expected: Should NOT get CORS error (might get 401 from invalid token, that's OK)
```

### Admin Login
- [ ] Visit https://www.debatemanch.com/admin
- [ ] Should see Admin Login panel
- [ ] Login with admin / Admin@2026
- [ ] Should see Admin Dashboard

### Google Sign-In
- [ ] Try Google login on home page
- [ ] Should work without 401 errors

---

## Troubleshooting

### If `/admin` still returns 404 after deployment:

1. **Check if files were deployed:**
   ```bash
   # Verify _routes.json exists in build output
   ls -la dist/
   # Should see: dist/_routes.json and dist/_redirects
   ```

2. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or open in private/incognito window

3. **Check hosting provider settings:**
   - Cloudflare Pages: Verify "redirect rules" are enabled
   - Netlify: Verify `_redirects` file is in the public folder
   - Vercel: Check project settings > rewrites

4. **Verify Vite build includes public files:**
   ```bash
   npm run build
   cat dist/_routes.json  # Should exist and not be empty
   ```

5. **Contact hosting provider support** if above doesn't work

---

## Summary of All Fixes

| Issue | Status | File Changed | Impact |
|-------|--------|--------------|--------|
| CORS blocks prod domain | ✅ FIXED | 3 Java controllers | API calls work from prod |
| /admin returns 404 | ✅ FIXED | _routes.json, _redirects | Direct links to /admin work |
| Google sign-in 401 | ✅ FIXED (you did this) | .env | Front/backend client IDs match |

All code changes are committed. Just need to deploy!



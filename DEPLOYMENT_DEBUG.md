# Deployment Verification & Debugging

## Step 1: Verify Files Are in Git
```bash
# Check if _routes.json exists
ls -la frontend/public/_routes.json
# Should show: -rw-r--r-- ... _routes.json

# Check if _redirects exists  
ls -la frontend/public/_redirects
# Should show: -rw-r--r-- ... _redirects

# Check if vite.config.js is updated
grep "publicDir" frontend/vite.config.js
# Should show: publicDir: 'public'
```

## Step 2: Test Local Build
```bash
cd frontend

# Clean build
rm -rf dist
npm run build

# Check if files made it to dist
ls -la dist/
# Should contain: _routes.json and _redirects at root

# Verify content
cat dist/_routes.json | head -10
# Should show JSON content
```

## Step 3: Check Cloudflare Deployment
Go to: https://dash.cloudflare.com → **Pages** → Project → **Deployments**

Click latest deployment and look for these files:
- `_routes.json` ✅
- `_redirects` ✅ 
- `index.html` ✅

If files are NOT listed:
- [ ] Go to **Settings** → Check build command is: `npm run build`
- [ ] Check build output directory is: `dist`
- [ ] Go to **Deployments** → Click **Retry deployment**
- [ ] Wait 2-3 minutes for new build

## Step 4: Test With curl
```bash
# Test that a non-existent route returns index.html (200, not 404)
curl -I https://debatemanch.com/test-hindi-route

# Expected response:
# HTTP/2 200
# content-type: text/html

# NOT:
# HTTP/2 404
# content-type: text/html
```

## Step 5: Browser Test
1. Open: `https://debatemanch.com/हिंदू_vs_मुस्लिम` (use actual debate URL)
2. Press F5 (refresh)
3. If 404 appears → SPA routing not working yet
4. If debate page shows → ✅ Fixed!

## Step 6: Check Chrome DevTools

**If still seeing 404:**

1. Open DevTools → **Network** tab
2. Refresh page
3. Look at the main document request (should be the row without a file name, or `index.html`)
4. Click it → **Response** tab
5. You should see the HTML content of index.html

If instead you see:
```
404: NOT_FOUND
Code: NOT_FOUND
ID: ...
```

Then Cloudflare Pages is not rewriting the route to index.html.

**Solution:** Configure routing in Cloudflare Pages dashboard (see QUICK_FIX_404.md)

## Debugging: What Each File Does

### _routes.json (Cloudflare Pages native)
- Format: JSON
- Read by: Cloudflare Pages automatically
- Effect: Routes all non-static paths to /index.html with 200 status
- File location: `dist/_routes.json` (after build)

### _redirects (Universal format)
- Format: Plain text
- Read by: Netlify, Vercel, Render, and others
- Effect: Redirects/rewrites rules for SPA routing  
- File location: `dist/_redirects` (after build)

### vite.config.js (Build config)
- Ensures Vite copies public/ files to dist/ root
- Ensures `_routes.json` and `_redirects` are available for deployment

## Quick Checklist

- [ ] Git has `frontend/public/_routes.json` ✅
- [ ] Git has `frontend/public/_redirects` ✅
- [ ] `npm run build` creates these files in `dist/` ✅
- [ ] Cloudflare Pages deployment shows these files ✅
- [ ] Either:
  - [ ] Cloudflare dashboard has routing rules configured, OR
  - [ ] `_routes.json` is being read by Cloudflare Pages
- [ ] Direct page refresh works without 404 ✅

## Still Not Working?

**Most common cause:** Cloudflare Pages dashboard routing not configured

**Solution:** 
1. Go to Cloudflare Pages settings
2. Create routing rule for `/*` → `/index.html` (200)
3. Save
4. Redeploy
5. Test

**Alternative:** Use Netlify (handles `_redirects` automatically)


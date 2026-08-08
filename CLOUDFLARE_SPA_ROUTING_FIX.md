# Cloudflare Pages SPA Routing - Complete Fix Guide

## Problem
When accessing `https://debatemanch.com/इस्कॉन_vs_आर्य_समाज` with page refresh, getting 404: NOT_FOUND error.

This is because Cloudflare Pages doesn't know to serve `index.html` for client-side routes.

---

## Solution: Three Approaches (Choose One)

### ✅ OPTION 1: Manual Cloudflare Pages Dashboard Configuration (RECOMMENDED & FASTEST)

This is the most reliable method:

1. **Go to Cloudflare Dashboard**
   - Open https://dash.cloudflare.com
   - Navigate to: **Pages** → Your Project → **Settings**

2. **Configure Build Settings**
   - Scroll down to **Build command**: `npm run build`
   - Scroll down to **Build output directory**: `dist`
   - Click **Save**

3. **Add Rewrite Route (CRITICAL)**
   - In the same project settings, find **Functions** or **Routes** section
   - Create a new route with these settings:
     ```
     Path Pattern: *.debatemanch.com/*
     Function: (none - we'll use built-in routing)
     ```
   - Or if your project has a **Routes** tab:
     - Click **Routes** → **Add route**
     - Pattern: `/*`
     - Action: **Rewrite** to `/index.html` (Status: 200)

4. **Verify _routes.json is deployed**
   - Go to **Deployments** tab
   - Click on the latest deployment
   - Check if `_routes.json` shows in the file list
   - If it does, Cloudflare should automatically use it

5. **Force Redeploy**
   - In **Deployments**, click **Connect git repository** (if not already connected)
   - Trigger a new deployment from main branch
   - Wait for build to complete

6. **Test**
   - Visit: `https://debatemanch.com/हिंदू_vs_मुस्लिम` (any Hindi debate URL)
   - Refresh page (F5, Ctrl+Shift+R)
   - Should see the debate page, NOT a 404 ✅

---

### OPTION 2: Using Cloudflare Workers (Alternative)

If Option 1 doesn't work, use a Worker:

1. **Create a Cloudflare Worker**
   - Go to **Workers & Pages** → **Overview**
   - Create a new Worker named: `spa-router`
   - Paste this code:
     ```javascript
     export default {
       async fetch(request) {
         const url = new URL(request.url);
         const path = url.pathname;

         // Don't rewrite API calls or static assets
         if (path.startsWith('/api') || 
             /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|xml|txt)$/.test(path)) {
           return fetch(request);
         }

         // For all other routes, fetch index.html and return with 200
         const indexRequest = new Request(new URL('/index.html', url).toString(), {
           method: 'GET',
           headers: request.headers
         });

         const response = await fetch(indexRequest);
         if (response.status === 200) {
           return new Response(response.body, {
             status: 200,
             statusText: 'OK',
             headers: response.headers
           });
         }

         return response;
       }
     };
     ```
   - Deploy the Worker

2. **Connect Worker to Domain**
   - Go to **Websites** → Your Domain → **Workers**
   - Add route: `debatemanch.com/*`
   - Point to the `spa-router` Worker
   - Save

3. **Test** - Same as Option 1 above

---

### OPTION 3: Update _routes.json (Already Deployed)

We've updated the `_routes.json` file to be more compatible:

**File:** `frontend/public/_routes.json`

The file now uses a better regex pattern that matches all routes except:
- Static assets (`.js`, `.css`, `.png`, etc.)
- API endpoints (`/api/*`)
- Config files (`_*`, `.json`, `.txt`)

**To deploy:**
```bash
# 1. Push changes to Git
git add frontend/public/_routes.json
git commit -m "Fix: Update _routes.json for better SPA routing"
git push origin main

# 2. Trigger Cloudflare Pages redeploy
# (Go to Cloudflare Dashboard → Deployments → Retry latest or trigger new build)

# 3. Test immediately - should see fix within 2 minutes
```

---

## Quick Troubleshooting

### 404 Still Shows?

**Check 1: Is _routes.json in the deployment?**
- Cloudflare Deployments → Latest deployment → View files
- Look for `_routes.json` in root

**Check 2: Is Cloudflare Pages detecting it?**
- Some projects need explicit enable
- Check: Pages → Settings → Look for "SPA mode" or routing options
- May need to enable explicitly

**Check 3: Clear cache**
```bash
# Hard refresh in browser
Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

# Or clear Cloudflare cache
# Dashboard → Caching → Purge everything → Purge all
```

**Check 4: Test with curl**
```bash
# Should return index.html content, not 404
curl -v https://debatemanch.com/test-route

# Response should have:
# < HTTP/2 200
# And body should be HTML (index.html content)
```

---

## Why This Happens

**Before fix:**
```
User visits: /हिंदू_vs_मुस्लिम
    ↓
Cloudflare Pages looks for: /हिंदू_vs_मुस्लिम (file)
    ↓
File doesn't exist
    ↓
Return 404: NOT_FOUND ❌
```

**After fix:**
```
User visits: /हिंदू_vs_मुस्लिम
    ↓
Cloudflare Pages checks _routes.json
    ↓
Route doesn't match static assets or API
    ↓
Rewrite to: /index.html (return 200)
    ↓
Browser gets React SPA
    ↓
React Router handles the actual routing ✅
```

---

## Production Deployment Checklist

- [ ] Pushed latest changes to Git
- [ ] Verified `_routes.json` is in `frontend/public/`
- [ ] Triggered new Cloudflare Pages deployment
- [ ] Waited 2-3 minutes for build
- [ ] Hard refreshed browser (Ctrl+Shift+R)
- [ ] Tested direct URL like: `https://debatemanch.com/हिंदू_vs_मुस्लिम`
- [ ] Verified gets SPA (not 404) ✅
- [ ] Tested page refresh works without 404 ✅

---

## Support

If still getting 404 after trying all options:

1. **Run curl test:**
   ```bash
   curl -v https://debatemanch.com/any-path
   # Should return 200 with HTML, not 404
   ```

2. **Check Cloudflare Error Code**
   - The error ID helps Cloudflare support diagnose
   - Share the error ID if contacting Cloudflare support

3. **Contact Cloudflare Support**
   - With: Error ID + steps you tried
   - They can check backend logs and routing rules

4. **Fallback: Use Netlify/Vercel**
   - Both have better automatic SPA support
   - `_redirects` file works out of box on both
   - Can migrate frontend in ~15 minutes


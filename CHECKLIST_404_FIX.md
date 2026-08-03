# 404 FIX CHECKLIST - Print & Bookmark This

## Does Your App Have 404 on Refresh?

```
URL: debatemanch.com/हिंदू_vs_मुस्लिम
Refresh: Press F5
Result: 404: NOT_FOUND ❌
```

If YES → Follow this checklist

---

## THE FIX (Pick ONE)

### ✅ I WILL FIX IN CLOUDFLARE DASHBOARD

- [ ] Open https://dash.cloudflare.com
- [ ] Click Pages → Select project
- [ ] Go to Settings → Look for "Routes" or "Routing Rules"
- [ ] Click Add/Create Route
- [ ] Enter:
  - [ ] Pattern: `/*`
  - [ ] Destination: `/index.html`
  - [ ] Status: `200`
- [ ] Click Save
- [ ] Go to Deployments tab
- [ ] Click Retry on latest deployment
- [ ] Wait 2-3 minutes
- [ ] Test: `debatemanch.com/हिंदू_vs_मुस्लिम` → Refresh
- [ ] ✅ Shows debate page, not 404?

---

### ✅ I WILL USE NETLIFY INSTEAD

- [ ] Go to https://netlify.com
- [ ] Click Add new site → Import from Git
- [ ] Select GitHub repo
- [ ] Build command: `npm run build`
- [ ] Publish directory: `dist`
- [ ] Deploy
- [ ] Wait for build (5-10 min)
- [ ] Update DNS or use Netlify subdomain
- [ ] Test: Same URL refresh
- [ ] ✅ Works?

---

### ❓ I'M NOT SURE - LET ME DEBUG FIRST

**Run these commands:**

```bash
# 1. Check files exist locally
ls frontend/public/_routes.json     # Should exist ✅
ls frontend/public/_redirects       # Should exist ✅

# 2. Test build
cd frontend
npm run build
ls dist/_routes.json                # Should be in dist ✅

# 3. Check Cloudflare deployment  
# Go to: dash.cloudflare.com → Pages → Deployments → Latest
# Look for: _routes.json in file list
# Do you see it? ___
```

**If _routes.json is in dist but not being used:**
→ Go do "I WILL FIX IN CLOUDFLARE DASHBOARD" above

**If _routes.json is NOT in dist:**
→ Run: `npm run build` again and check

---

## VERIFY IT'S FIXED

After making changes:

```
URL you test:     debatemanch.com/test-hindi-route
(or any debate topic URL with Hindi text)

Test 1:
- Visit URL
- Result: Shows debate page ✅ or 404 ❌?

Test 2:
- Press F5 (refresh)
- Result: Still shows page ✅ or shows 404 ❌?

Test 3 (Optional):
- Open DevTools (F12) → Network tab
- Refresh page
- Click main request (top in list)
- Response tab should show: HTML (index.html) ✅
- Not: 404 error message ❌
```

---

## STILL NOT WORKING?

- [ ] Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- [ ] Clear browser cache
- [ ] Incognito/Private window → Test again
- [ ] Wait 5 minutes (Cloudflare caching)
- [ ] Try different browser
- [ ] Check error ID code in 404 and note it
- [ ] If still broken after all above → Try Netlify (Option 2)

---

## FILES WE ALREADY FIXED FOR YOU

✅ `frontend/public/_routes.json` - Cloudflare config
✅ `frontend/public/_redirects` - Netlify/Vercel config  
✅ `frontend/vite.config.js` - Build config
✅ `frontend/nginx.conf` - UTF-8 encoding
✅ `backend/*.java` - CORS configuration

Now waiting for YOU to either:
1. Configure Cloudflare dashboard, OR
2. Deploy to Netlify

---

## DECISION TREE

```
404 Error on Refresh
          ↓
    Do you like Cloudflare?
         ↙               ↘
       YES               NO
        ↓                 ↓
   Dashboard          → Netlify
    Config           (5-10 min setup)
   (5 minutes)        Also works great!
        ↓
    Test & Verify
        ↓
   ✅ Works!
```

---

## MOST IMPORTANT INFO

**Error URL when broken:**
```
https://debatemanch.com/इस्कॉन_vs_आर्य_समाज → 404: NOT_FOUND
ID: bom1::trsjm-1785784513593-cd747a5e4c5d
```

**Error URL when fixed:**
```
https://debatemanch.com/इस्कॉन_vs_आर्य_समाज → Shows Debate Page ✅
```

**The fix:** Tell static host to serve `/index.html` for unknown routes
(This is the "SPA Fallback" or "Rewrite Rule")

---

## QUICK REFERENCE

| Component | Status | Notes |
|-----------|--------|-------|
| Code | ✅ Ready | All files updated |
| Frontend Build | ✅ Ready | Just run `npm run build` |
| Backend | ✅ Ready | Deployed |
| **Hosting Config** | ⏳ Waiting | Configure in dashboard |

---

## QUESTIONS?

- "How do I access Cloudflare dashboard?"
  → Go to https://dash.cloudflare.com (your account)

- "What if I don't see 'Routes' in Settings?"
  → Look for "SPA Mode" or "Custom Routing"
  → Or try Netlify (guaranteed to work)

- "Will this affect my setup?"
  → No, completely safe. Just tells server to route correctly.

- "How long does it take?"
  → Cloudflare: 5 min to configure + 2 min to deploy = 7 min total
  → Netlify: 10 min first time, then instant future deploys

---

## GO FIX IT NOW!

```
1. Pick Cloudflare OR Netlify
2. Follow the steps above
3. Test the URL
4. Celebrate! 🎉
```

**Current time: _____**
**Time you're fixing: Start at _____ End at _____**
**Result: ✅ SUCCESS ⏳ IN PROGRESS ❌ FAILED**

---

Keep this checklist handy! 📌



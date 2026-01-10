# 🚀 Quick Local Test - Copy & Paste

## Test Google OAuth Locally RIGHT NOW (No Google Setup!)

---

## Step 1: Start Services

```bash
# Terminal 1 - Backend
cd backend
mvn clean spring-boot:run

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Wait for:
- Backend: "Started DebateArenaApplication"
- Frontend: "Local: http://localhost:5173/"

---

## Step 2: Open Browser

Visit: **http://localhost:5173**

---

## Step 3: Test as Guest (Works Now)

✅ Click any debate topic  
✅ Read questions and answers  
✅ Try to vote → Login modal appears  
✅ This is expected! Guest users can view but not interact.

---

## Step 4: Mock Login (Copy & Paste This)

1. **Open browser console** (Press F12)
2. **Type `allow pasting` if prompted** and press Enter
3. **Copy this UPDATED script (works better):**

```javascript
// Mock Google Login - Development Mode (No Google Setup Required)
console.log('🔐 Attempting mock login...');

// Create a properly formatted mock JWT token
const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
const payload = btoa(JSON.stringify({
  sub: "mock-user-" + Date.now(),
  email: "testuser@example.com",
  email_verified: true,
  name: "Test User (Local)",
  picture: "https://via.placeholder.com/150",
  given_name: "Test",
  family_name: "User",
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600
}));
const signature = btoa("mock-signature");
const mockGoogleToken = header + "." + payload + "." + signature;

console.log('📤 Sending mock token to backend...');

fetch('http://localhost:8080/api/v1/auth/google', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ token: mockGoogleToken })
})
.then(response => {
  console.log('📨 Response status:', response.status);
  return response.json();
})
.then(data => {
  console.log('📦 Login response:', data);
  
  if (data.success) {
    localStorage.setItem('user_token', data.token);
    console.log('✅ Token saved to localStorage');
    console.log('✅ User:', data.user);
    alert('✅ Logged in as: ' + data.user.name + '\n\nRefreshing page...');
    setTimeout(() => location.reload(), 1000);
  } else {
    console.error('❌ Login failed:', data.message);
    alert('❌ Login failed: ' + data.message + '\n\nSee troubleshooting section below for fixes.');
  }
})
.catch(error => {
  console.error('❌ Network error:', error);
  alert('❌ Error: ' + error.message + '\n\nMake sure backend is running on port 8080');
});
```

4. **Paste into console and press Enter**

---

## Step 4.5: If You Get "Invalid Google token" Error

**This means your backend has GOOGLE_CLIENT_ID configured (production mode).**

### Quick Fix Option 1: Remove Google Client ID (Recommended for Testing)

```bash
# 1. Edit backend/.env file
# 2. Comment out or remove this line:
# GOOGLE_CLIENT_ID=...

# 3. Restart backend
cd backend
# Press Ctrl+C to stop
mvn clean spring-boot:run

# 4. Try the mock login script again
```

### Quick Fix Option 2: Use Real Google OAuth Instead

If you want to use REAL Google authentication:

1. **Keep GOOGLE_CLIENT_ID in backend/.env**
2. **Create frontend/.env:**
   ```bash
   VITE_GOOGLE_CLIENT_ID=same-client-id-as-backend
   ```
3. **Restart frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
4. **Click "Sign in with Google" button** (no console script needed)

**See:** `GOOGLE_OAUTH_SETUP_GUIDE.md` for complete Google setup

---

## Step 5: Verify Login

After page refreshes:

✅ **Top navigation shows:** "Test User (Local)" with logout button  
✅ **Try to vote:** Should work now (no login modal!)  
✅ **Post a reply:** Should work!  
✅ **Create a question:** Should work!

---

## Step 6: Test All Features

### Test Voting
1. Go to any debate
2. Click upvote/downvote on any post
3. ✅ Should work without login modal

### Test Replying
1. Click "Reply" on any post
2. Type your reply
3. Click "Post Reply"
4. ✅ Should post successfully
5. ✅ Shows your name: "Test User (Local)"

### Test Posting Question
1. Scroll to bottom of debate
2. Fill in question form
3. Select a side (left/right)
4. Click "Add Question"
5. ✅ Should post successfully

### Test Creating Topic
1. Go to home (http://localhost:5173)
2. Enter new topic: "Test vs Demo"
3. Click "Add Topic"
4. ✅ Should create successfully

### Test Logout
1. Click "Logout" button in top nav
2. ✅ Profile disappears
3. ✅ Try to vote → Login modal appears again

---

## Step 7: Test Admin (Separate Auth)

Admin authentication is UNCHANGED:

1. Visit: **http://localhost:5173/admin**
2. Login:
   - Username: `admin`
   - Password: `Admin@2026`
3. ✅ Admin dashboard works
4. ✅ No conflicts with user auth

---

## Quick Verification Checklist

### ✅ Guest User
- [ ] Can view all debates
- [ ] Can read all posts
- [ ] Voting shows login modal
- [ ] Replying shows login modal

### ✅ Logged-In User (After Mock Login)
- [ ] Profile shows in top nav
- [ ] Can vote on posts
- [ ] Can reply to posts
- [ ] Can post questions
- [ ] Can create topics
- [ ] Logout works

### ✅ Admin
- [ ] Admin login still works
- [ ] Admin dashboard accessible
- [ ] No interference with user auth

---

## Troubleshooting

### "Failed to fetch" Error

**Problem:** Backend not running  
**Fix:**
```bash
cd backend
mvn clean spring-boot:run
```

### Login Script Does Nothing

**Problem:** Browser console might be blocking  
**Fix:**
1. Make sure you're on http://localhost:5173
2. Open console (F12)
3. Paste script again

### Backend Shows Error

**Check backend console for:**
```
⚠️ WARNING: Google Client ID not configured. Token verification skipped!
```

This is EXPECTED for local testing!

### Profile Doesn't Show After Login

**Fix:**
1. Check localStorage: Press F12 → Application → Local Storage
2. Should see `user_token`
3. If not, run script again
4. Refresh page manually (F5)

---

## Alternative: Real Google OAuth

If you want to test with REAL Google accounts:

1. **Get Google Client ID:** https://console.cloud.google.com
2. **Add to .env files:**
   ```bash
   # backend/.env
   GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
   
   # frontend/.env (create if doesn't exist)
   VITE_GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
   ```
3. **Restart services**
4. **Click "Sign in with Google"** → Use real Google account

See: **GOOGLE_OAUTH_SETUP_GUIDE.md** for detailed steps

---

## Summary

### ✅ You Can Test Locally Right Now!

**What You Need:**
- ✅ Backend running (mvn spring-boot:run)
- ✅ Frontend running (npm run dev)
- ✅ Browser with console (F12)
- ✅ Copy-paste the mock login script above

**What You Get:**
- ✅ Full authentication testing
- ✅ All features working
- ✅ Real user experience
- ✅ No Google setup needed

**Time to Test:** 2 minutes

---

## Next Steps

1. ✅ Run the mock login script above
2. ✅ Test all features
3. ✅ Verify everything works
4. ✅ (Optional) Setup real Google OAuth later

---

**Start Testing Now!** 🎉

Just copy the script from Step 4 and paste into your browser console!

---

**Note:** Mock login is for LOCAL TESTING ONLY. For production, use real Google OAuth.


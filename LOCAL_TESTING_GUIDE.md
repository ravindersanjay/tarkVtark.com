# 🧪 Local Testing Guide - Google OAuth Without Credentials

## Can I Test Locally? YES! ✅

You have **TWO OPTIONS** for local testing:

---

## Option 1: Full Testing with Google OAuth (Recommended)

### Quick Setup (5 minutes)

This gives you the complete Google OAuth experience.

#### Step 1: Get Google Client ID (One-time, 5 min)

1. **Go to:** https://console.cloud.google.com
2. **Create OAuth credentials** (see GOOGLE_OAUTH_SETUP_GUIDE.md for details)
3. **Copy Client ID**

#### Step 2: Configure Environment

**Backend:**
```bash
# Edit backend/.env
echo "GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com" >> backend/.env
```

**Frontend:**
```bash
# Create frontend/.env
echo "VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com" >> frontend/.env
```

#### Step 3: Restart Services

```bash
# Terminal 1 - Backend
cd backend
mvn clean spring-boot:run

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

#### Step 4: Test!

1. Visit http://localhost:5173
2. Try to vote on a post
3. Login modal appears
4. Click "Sign in with Google"
5. Select your Google account
6. ✅ Logged in! Can vote, reply, post

**Result:** Full Google OAuth experience ✅

---

## Option 2: Development Mode (No Google Setup Required)

### Instant Testing (0 setup)

Test authentication flow WITHOUT Google credentials!

### How It Works

The backend has a **development mode** that:
- ✅ Skips Google token verification
- ✅ Accepts mock tokens
- ✅ Creates users from token data
- ⚠️ **ONLY for local testing** (NOT for production)

### Setup (Already Done!)

**No configuration needed!** Just don't set `GOOGLE_CLIENT_ID` in backend/.env

### Test Without Google

You can test the complete flow using the browser console:

#### Step 1: Start Services (No .env needed)

```bash
# Terminal 1 - Backend (without GOOGLE_CLIENT_ID)
cd backend
mvn clean spring-boot:run

# Terminal 2 - Frontend (without GOOGLE_CLIENT_ID)  
cd frontend
npm run dev
```

**Backend will show:**
```
⚠️ WARNING: Google Client ID not configured. Token verification skipped!
⚠️ This is acceptable for development but MUST be configured for production.
```

#### Step 2: Mock Google Login (Browser Console)

Open browser console (F12) and run:

```javascript
// Create a mock Google token
const mockToken = btoa(JSON.stringify({
  header: {alg: "RS256", typ: "JWT"},
  payload: {
    sub: "mock-google-id-123",
    email: "test@example.com",
    name: "Test User",
    picture: "https://via.placeholder.com/150"
  }
}));

// Send to backend
fetch('http://localhost:8080/api/v1/auth/google', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({token: mockToken})
})
.then(r => r.json())
.then(data => {
  console.log('Login response:', data);
  if (data.success) {
    localStorage.setItem('user_token', data.token);
    alert('Logged in as: ' + data.user.name);
    location.reload();
  }
});
```

#### Step 3: Test Features

After running the script above:
- ✅ User profile shows "Test User"
- ✅ Can vote on posts
- ✅ Can reply to posts
- ✅ Can post questions
- ✅ Can create topics

**Result:** Full authentication testing without Google! ✅

---

## Option 3: Test Both Modes

You can switch between modes easily!

### Test Development Mode First

```bash
# 1. Remove Google Client ID (if set)
# backend/.env - comment out or remove GOOGLE_CLIENT_ID
# frontend/.env - comment out or remove VITE_GOOGLE_CLIENT_ID

# 2. Restart services
cd backend && mvn spring-boot:run
cd frontend && npm run dev

# 3. Test with mock token (see Option 2)
```

### Then Test Production Mode

```bash
# 1. Add Google Client ID
# backend/.env - add GOOGLE_CLIENT_ID
# frontend/.env - add VITE_GOOGLE_CLIENT_ID

# 2. Restart services
cd backend && mvn spring-boot:run
cd frontend && npm run dev

# 3. Test with real Google OAuth
```

---

## Complete Local Testing Scenarios

### Scenario 1: Guest User Flow ✅

**No login required:**

```bash
# Start services
cd backend && mvn spring-boot:run
cd frontend && npm run dev

# Test in browser:
1. Visit http://localhost:5173
2. View debate topics ✅
3. Click any debate ✅
4. Read questions/answers ✅
5. Try to vote → Login modal appears ✅
6. Close modal → Continue browsing ✅
```

**Expected:** All viewing works, protected actions show login modal

---

### Scenario 2: Authenticated User Flow (Dev Mode) ✅

**With mock authentication:**

```bash
# 1. Start services (no GOOGLE_CLIENT_ID)
cd backend && mvn spring-boot:run
cd frontend && npm run dev

# 2. In browser console (F12):
const mockToken = btoa(JSON.stringify({
  header: {},
  payload: {
    sub: "123",
    email: "dev@test.com",
    name: "Dev Tester",
    picture: "https://via.placeholder.com/150"
  }
}));

fetch('http://localhost:8080/api/v1/auth/google', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({token: mockToken})
})
.then(r => r.json())
.then(data => {
  localStorage.setItem('user_token', data.token);
  location.reload();
});

# 3. Test features:
- Vote on posts ✅
- Reply to posts ✅
- Post questions ✅
- Create topics ✅
- Profile shows "Dev Tester" ✅
```

---

### Scenario 3: Authenticated User Flow (Production Mode) ✅

**With real Google OAuth:**

```bash
# 1. Setup Google credentials
# Get Client ID from https://console.cloud.google.com
# Add to backend/.env and frontend/.env

# 2. Start services
cd backend && mvn spring-boot:run
cd frontend && npm run dev

# 3. Test in browser:
1. Try to vote
2. Click "Sign in with Google"
3. Select Google account
4. ✅ Logged in with real account
5. Can perform all actions
```

---

### Scenario 4: Admin Flow (Unchanged) ✅

**Test admin features:**

```bash
# Start services (with or without Google OAuth)
cd backend && mvn spring-boot:run
cd frontend && npm run dev

# Test admin:
1. Visit http://localhost:5173/admin
2. Login: admin / Admin@2026
3. ✅ Admin dashboard works
4. ✅ All admin features work
5. ✅ No interference with user auth
```

---

## Testing Checklist

### ✅ Basic Features (No Auth)
- [ ] View home page
- [ ] View debate topics
- [ ] Click into debate
- [ ] Read questions
- [ ] Read answers
- [ ] Navigate pages

### ✅ Protected Features (Shows Login)
- [ ] Try to vote → Login modal
- [ ] Try to reply → Login modal
- [ ] Try to post → Login modal
- [ ] Try to create topic → Login modal

### ✅ Authentication (Dev Mode)
- [ ] Mock login works
- [ ] User profile displays
- [ ] Can vote after login
- [ ] Can reply after login
- [ ] Can post after login
- [ ] Logout works

### ✅ Authentication (Production Mode)
- [ ] Google OAuth button shows
- [ ] Can select Google account
- [ ] Real login works
- [ ] Real profile shows
- [ ] All features work

### ✅ Admin Features
- [ ] Admin login works
- [ ] Admin dashboard accessible
- [ ] All admin CRUD works
- [ ] No conflicts with user auth

---

## Quick Test Commands

### Test Without Google (Dev Mode)

```bash
# 1. Start backend
cd backend
mvn clean spring-boot:run

# 2. Start frontend (new terminal)
cd frontend
npm run dev

# 3. Visit browser
open http://localhost:5173

# 4. Open console (F12) and paste:
fetch('http://localhost:8080/api/v1/auth/google', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    token: btoa(JSON.stringify({
      header: {},
      payload: {
        sub: "test-123",
        email: "test@local.dev",
        name: "Local Tester",
        picture: "https://via.placeholder.com/150"
      }
    }))
  })
})
.then(r => r.json())
.then(data => {
  localStorage.setItem('user_token', data.token);
  alert('Logged in! Refresh page.');
});
```

---

## Troubleshooting Local Testing

### Issue: Backend won't start

**Check:**
```bash
cd backend
mvn clean compile
# Look for errors
```

**Fix:** Usually dependency issues. Run:
```bash
mvn clean install -U
```

### Issue: Frontend won't start

**Check:**
```bash
cd frontend
npm install
npm run dev
```

**Fix:** Clear node_modules:
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Issue: Login modal doesn't show

**Check browser console (F12):**
- Look for errors
- Check if @react-oauth/google loaded

**Fix:**
```bash
cd frontend
npm install @react-oauth/google
npm run dev
```

### Issue: Mock login doesn't work

**Check backend console:**
- Should see: "⚠️ WARNING: Token verification skipped!"

**Fix:** Ensure GOOGLE_CLIENT_ID is NOT set in backend/.env

### Issue: Can't access http://localhost:5173

**Check if frontend is running:**
```bash
# Should show: Local: http://localhost:5173/
```

**Fix:** Port might be in use:
```bash
# Kill process on port 5173
npx kill-port 5173
npm run dev
```

---

## Development vs Production Mode

### Development Mode (No Google Setup)

**Use When:**
- ✅ Quick local testing
- ✅ Testing authentication flow
- ✅ No internet required (after first setup)
- ✅ Don't want to setup Google

**Limitations:**
- ⚠️ Mock tokens only
- ⚠️ Not real Google accounts
- ⚠️ Can't test Google OAuth UI

**Security:**
- ⚠️ NEVER use in production
- ⚠️ Development only

### Production Mode (With Google)

**Use When:**
- ✅ Testing real Google OAuth
- ✅ Testing with real accounts
- ✅ Pre-production testing
- ✅ Full integration testing

**Advantages:**
- ✅ Real Google authentication
- ✅ Production-like behavior
- ✅ Real user profiles

**Requirements:**
- ⚠️ Google Cloud account
- ⚠️ OAuth credentials setup
- ⚠️ Internet connection

---

## Testing Matrix

| Feature | Guest | Mock Auth | Real Auth | Admin |
|---------|-------|-----------|-----------|-------|
| View debates | ✅ | ✅ | ✅ | ✅ |
| Read posts | ✅ | ✅ | ✅ | ✅ |
| Vote | ❌ Login | ✅ | ✅ | N/A |
| Reply | ❌ Login | ✅ | ✅ | N/A |
| Post | ❌ Login | ✅ | ✅ | N/A |
| Create topic | ❌ Login | ✅ | ✅ | N/A |
| Admin dashboard | N/A | N/A | N/A | ✅ |

---

## Best Local Testing Workflow

### Day-to-Day Development

```bash
# Use Dev Mode for speed
1. Start without GOOGLE_CLIENT_ID
2. Use mock tokens for testing
3. Fast iteration
```

### Before Deployment

```bash
# Use Production Mode for validation
1. Setup Google OAuth
2. Test with real accounts
3. Verify everything works
```

---

## Summary

### ✅ You Can Test Locally!

**Two Ways:**

1. **Development Mode** - No Google setup, instant testing
2. **Production Mode** - Real Google OAuth, full experience

**Both work perfectly!**

---

## Quick Start (Choose One)

### Option A: Test Now (No Setup)

```bash
cd backend && mvn spring-boot:run
cd frontend && npm run dev
# Visit http://localhost:5173
# Use mock login script above
```

### Option B: Test with Google (5 min setup)

```bash
# 1. Get Google Client ID
# 2. Add to .env files
# 3. Restart services
# 4. Test with real Google OAuth
```

---

**Ready to test!** 🚀

Choose your testing mode and start testing the Google OAuth implementation locally!


# 🚀 Google OAuth Setup Guide - Quick Start

## Implementation: ✅ COMPLETE

All code is ready. Just need Google OAuth credentials to go live!

---

## Setup Steps (5 minutes)

### Step 1: Google Cloud Console Setup

1. **Go to:** https://console.cloud.google.com

2. **Create Project** (or select existing)
   - Click "Select a project" → "New Project"
   - Name: "TarkVtark Debate Arena"
   - Click "Create"

3. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search "Google+ API"
   - Click "Enable"

4. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - User Type: **External**
   - App name: **TarkVtark Debate Arena**
   - Support email: your-email@gmail.com
   - App domain: Leave blank for now
   - Developer contact: your-email@gmail.com
   - Click "Save and Continue"
   - Scopes: Skip (click "Save and Continue")
   - Test users: Skip (click "Save and Continue")

5. **Create OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: **Web application**
   - Name: **Debate Arena Web Client**
   
   - **Authorized JavaScript origins:**
     ```
     http://localhost:5173
     http://localhost:8080
     ```
   
   - **Authorized redirect URIs:**
     ```
     http://localhost:5173
     http://localhost:5173/auth/callback
     ```
   
   - Click "Create"
   - **COPY the Client ID** (looks like: `123456789-abcdef.apps.googleusercontent.com`)

---

### Step 2: Configure Environment Variables

#### Backend Configuration

**File:** `backend/.env`

Add this line:
```bash
GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID_HERE.apps.googleusercontent.com
```

Replace `YOUR_ACTUAL_CLIENT_ID_HERE` with the Client ID you copied.

#### Frontend Configuration

**Create file:** `frontend/.env`

```bash
VITE_GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID_HERE.apps.googleusercontent.com
```

Use the **same Client ID** as backend.

---

### Step 3: Restart Services

#### Stop Current Services
- Press Ctrl+C in backend terminal
- Press Ctrl+C in frontend terminal

#### Start Backend
```bash
cd backend
mvn clean spring-boot:run
```

Wait for: `Started DebateArenaApplication in X seconds`

#### Start Frontend
```bash
cd frontend
npm run dev
```

Wait for: `Local: http://localhost:5173/`

---

### Step 4: Test Google Login

1. **Open browser:** http://localhost:5173

2. **Try to vote** on any post
   - ✅ Login modal should appear

3. **Click "Sign in with Google"**
   - ✅ Google account selector appears
   - Select your account
   - ✅ Should redirect back with success

4. **After login:**
   - ✅ Your profile shows in top nav
   - ✅ Can vote/reply/post
   - ✅ All actions work

5. **Test logout:**
   - Click "Logout" button
   - ✅ Profile disappears
   - ✅ Protected actions show login modal again

---

## Quick Test Checklist

### ✅ Guest User Tests
- [ ] Can view debates
- [ ] Can read posts
- [ ] Voting shows login modal
- [ ] Replying shows login modal
- [ ] Posting shows login modal
- [ ] Creating topic shows login modal

### ✅ Logged-In User Tests
- [ ] Google login works
- [ ] Profile shows (name + picture)
- [ ] Can vote on posts
- [ ] Can reply to posts
- [ ] Can post questions
- [ ] Can create topics
- [ ] Logout works

### ✅ Admin Tests
- [ ] Admin login still works (username/password)
- [ ] Admin dashboard accessible

---

## Troubleshooting

### Issue: Google button doesn't show

**Cause:** Frontend can't load Google OAuth library

**Fix:**
1. Check browser console for errors
2. Verify `VITE_GOOGLE_CLIENT_ID` is set in `frontend/.env`
3. Restart frontend: `npm run dev`

### Issue: "Failed to verify Google token"

**Cause:** Backend can't validate the token

**Fix:**
1. Check backend console for errors
2. Verify `GOOGLE_CLIENT_ID` is set in `backend/.env`
3. Verify it matches Google Cloud Console
4. Restart backend

### Issue: "Authorized JavaScript origin" error

**Cause:** Google OAuth settings missing localhost

**Fix:**
1. Go to Google Cloud Console → Credentials
2. Edit OAuth 2.0 Client
3. Add to "Authorized JavaScript origins":
   - `http://localhost:5173`
   - `http://localhost:8080`
4. Save and try again

### Issue: 401 Unauthorized after login

**Cause:** Token not being sent with requests

**Fix:**
1. Open browser DevTools (F12)
2. Go to Application → Local Storage
3. Check if `user_token` exists
4. If not, login again

---

## Development Mode (No Google Setup)

**For quick testing without Google credentials:**

Backend will skip token verification if `GOOGLE_CLIENT_ID` is not set.

**⚠️ WARNING:** This is for development ONLY. Never use in production!

**How it works:**
- Backend logs: `⚠️ WARNING: Token verification skipped!`
- Accepts any Google token without validation
- Creates user from token claims

**To enable:**
- Don't set `GOOGLE_CLIENT_ID` in backend/.env
- Restart backend
- Backend will run in dev mode

---

## Environment Variables Summary

### Backend `.env`
```bash
# Existing variables
SPRING_DATASOURCE_URL=...
SPRING_DATASOURCE_USERNAME=...
SPRING_DATASOURCE_PASSWORD=...

# Add this:
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### Frontend `.env` (NEW FILE)
```bash
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

**Note:** Frontend .env is a NEW file. Create it if it doesn't exist.

---

## Production Deployment

### Additional Setup for Production:

1. **Update authorized origins:**
   ```
   https://yourdomain.com
   ```

2. **Update authorized redirect URIs:**
   ```
   https://yourdomain.com
   https://yourdomain.com/auth/callback
   ```

3. **Use HTTPS:**
   - Google OAuth requires HTTPS in production
   - Get SSL certificate

4. **Security Enhancements:**
   - Use httpOnly cookies (not localStorage)
   - Implement refresh tokens
   - Add rate limiting
   - Enable CSRF protection

---

## File Locations

**Backend:**
- `backend/.env` ← Add GOOGLE_CLIENT_ID here

**Frontend:**
- `frontend/.env` ← Create this file, add VITE_GOOGLE_CLIENT_ID

**Restart both after changes!**

---

## Success Indicators

### ✅ Backend Started Successfully
```
2026-01-10 ... Started DebateArenaApplication in 12.345 seconds
2026-01-10 ... Tomcat started on port(s): 8080 (http)
```

### ✅ Frontend Started Successfully
```
VITE v5.x.x  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### ✅ Google Login Works
```
Browser console:
🔐 Logging in with Google...
✅ Login successful: user@gmail.com

Backend console:
📱 POST /auth/google - Google OAuth login attempt
✅ Google token verified for: user@gmail.com
✅ User authenticated successfully: user@gmail.com
```

---

## Support

### Logs to Check

**Backend logs:**
```bash
cd backend
tail -f target/*.log
```

**Frontend console:**
- Press F12 in browser
- Check Console tab for errors

### Common Errors

**"popup_closed_by_user"**
- User closed Google login popup
- Not an error, just user action

**"redirect_uri_mismatch"**
- Redirect URI not configured in Google Console
- Add `http://localhost:5173` to authorized URIs

**"invalid_client"**
- Client ID mismatch
- Verify Client ID is correct in both .env files

---

## Quick Start Commands

```bash
# Step 1: Setup .env files (do this once)
echo "GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com" >> backend/.env
echo "VITE_GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com" >> frontend/.env

# Step 2: Start backend
cd backend
mvn clean spring-boot:run

# Step 3: Start frontend (new terminal)
cd frontend
npm run dev

# Step 4: Test
# Open http://localhost:5173 and try to vote
```

---

## Ready to Go! 🎉

1. ✅ Code implemented
2. ✅ Database ready
3. ⏳ Setup Google OAuth credentials
4. ⏳ Configure .env files
5. ⏳ Restart services
6. ⏳ Test login

**Time to complete:** 5-10 minutes

**Go to:** https://console.cloud.google.com 🚀


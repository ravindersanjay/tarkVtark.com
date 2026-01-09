# Contact Form Error Fix - "Failed to send message"

## Problem
When submitting the contact form, you see error: **"Failed to send message. Please try again later."**

## Root Cause
The backend server needs to be **restarted** to load the new `ContactController` that was just created. The controller handles the contact form API endpoints.

---

## Quick Fix - Restart Backend

### Option 1: Restart Both Services (Recommended)

**Windows:**
```bash
# Stop current services (press Ctrl+C in both windows)
# Then run:
start-all.bat
```

This will:
1. Kill processes on ports 8080 and 5173
2. Start backend (compiles and runs)
3. Start frontend
4. Wait 30-60 seconds for full startup

### Option 2: Restart Only Backend

**Windows:**
```bash
# In the backend window, press Ctrl+C to stop
# Then run:
cd backend
mvn clean spring-boot:run
```

---

## Verify Fix

### Step 1: Check Backend is Running
Open browser and go to:
```
http://localhost:8080/api/v1/contact/messages
```

**Expected Result:**
- Should return `[]` (empty array) or list of messages
- Should **NOT** show 404 error

**Current Issue:**
- Returns: `{"timestamp":"...","status":404,"error":"Not Found","path":"/api/v1/contact/messages"}`
- This means ContactController is not loaded

### Step 2: Test Contact Form
1. Go to `http://localhost:5173/contact`
2. Fill in the form:
   - Name: Test User
   - Email: test@example.com
   - Subject: Test (optional)
   - Message: Test message
3. Click **Send**

**Expected Result:**
- ✅ Success message: "Thank you for contacting us! Your message has been received."
- ✅ Form is cleared
- ✅ No errors

### Step 3: Check Admin Dashboard
1. Go to `http://localhost:5173/admin`
2. Login
3. Click **Messages** tab

**Expected Result:**
- ✅ Your test message appears
- ✅ Shows red "UNREAD" indicator

---

## Troubleshooting

### If backend won't start:

**Check for compilation errors:**
```bash
cd backend
mvn clean compile
```

Look for any errors in the output.

### If port 8080 is busy:

**Kill process on port 8080:**
```bash
# Windows
backend\kill-backend-port.bat
```

Or manually:
```bash
netstat -ano | findstr :8080
taskkill /F /PID [PID_NUMBER]
```

### Check Backend Logs

Look at the backend terminal window for errors. You should see:
```
📧 POST /contact - Submitting message from: test@example.com
✅ Message saved with ID: [UUID]
```

### Frontend Console Errors

Open browser DevTools (F12) → Console tab:
- Should NOT see any red errors
- Should see: `📧 contactAPI.send() - Sending message from: test@example.com`

---

## What the Restart Does

When you restart the backend, Spring Boot will:

1. ✅ Load the new `ContactController.java`
2. ✅ Register these endpoints:
   - POST `/api/v1/contact`
   - GET `/api/v1/contact/messages`
   - GET `/api/v1/contact/messages/unread`
   - PUT `/api/v1/contact/messages/{id}/read`
   - DELETE `/api/v1/contact/messages/{id}`

3. ✅ Connect to PostgreSQL database
4. ✅ Use existing `contact_messages` table

---

## Test API Directly (Optional)

### Test with cURL:

**Submit a message:**
```bash
curl -X POST http://localhost:8080/api/v1/contact \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test\",\"email\":\"test@test.com\",\"subject\":\"Test\",\"message\":\"Test message\"}"
```

**Expected Response:**
```json
{
  "id": "uuid-here",
  "name": "Test",
  "email": "test@test.com",
  "subject": "Test",
  "message": "Test message",
  "isRead": false,
  "createdAt": "2026-01-10T..."
}
```

**Get all messages:**
```bash
curl http://localhost:8080/api/v1/contact/messages
```

---

## Files Created (Already Done)

These files were created in the previous fix:
- ✅ `backend/src/main/java/com/debatearena/controller/ContactController.java`
- ✅ `backend/src/main/java/com/debatearena/dto/ContactRequest.java`
- ✅ `backend/src/main/java/com/debatearena/dto/ContactMessageDTO.java`

**No code changes needed** - just restart backend!

---

## Summary

1. **Stop backend** (Ctrl+C)
2. **Run:** `start-all.bat` OR `cd backend && mvn clean spring-boot:run`
3. **Wait** 30-60 seconds
4. **Test** contact form at http://localhost:5173/contact
5. **Verify** message in admin dashboard

---

## Expected Timeline

- 🕐 Stop services: 5 seconds
- 🕐 Backend compilation: 20-40 seconds
- 🕐 Backend startup: 10-20 seconds
- 🕐 Frontend startup: 5-10 seconds
- **Total: ~1-2 minutes**

---

**After restart, the contact form will work correctly!** ✅

The error "Failed to send message" is happening because the backend doesn't have the ContactController loaded yet. A simple restart will fix it.


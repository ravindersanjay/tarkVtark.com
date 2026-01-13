# Testing Guidelines Admin Visibility Fix

## Quick Test Steps

### Prerequisites
Make sure both backend and frontend are running:
```bash
# Check if services are running
.\healthcheck.bat
```

### Test 1: View Existing Guidelines in Admin
1. Navigate to `http://localhost:5173/admin`
2. Login to admin dashboard
3. Click on **Guidelines** tab
4. **Expected**: You should see all guidelines from the database
5. **Expected**: Any inactive guidelines should show "(Inactive)" label in red

### Test 2: Add New Guideline
1. In Admin Dashboard → Guidelines tab
2. Enter a new guideline in the text input (e.g., "Test guideline - Please delete")
3. Click **Add Guideline** button
4. **Expected**: Success alert appears
5. **Expected**: New guideline appears immediately in the list below
6. **Expected**: Page does NOT need to be refreshed

### Test 3: Verify User Can See New Guideline
1. Open a new browser tab (or use incognito)
2. Navigate to `http://localhost:5173`
3. Click **Guidelines** in the navigation
4. **Expected**: Your new test guideline appears in the list
5. **Expected**: All active guidelines are visible

### Test 4: Edit Guideline
1. Go back to Admin Dashboard → Guidelines tab
2. Click **Edit** button on your test guideline
3. Change the text to "Updated test guideline"
4. Click **Save**
5. **Expected**: Success alert appears
6. **Expected**: Updated text appears immediately
7. Go to user Guidelines page (`http://localhost:5173/guidelines`)
8. **Expected**: Updated text is visible there too

### Test 5: Delete Guideline
1. In Admin Dashboard → Guidelines tab
2. Click **Delete** button on your test guideline
3. Confirm the deletion
4. **Expected**: Success alert appears
5. **Expected**: Guideline is removed from the list
6. Go to user Guidelines page
7. **Expected**: Deleted guideline is no longer visible

### Test 6: Persistence Check
1. In Admin Dashboard → Guidelines tab
2. Add a new guideline "Persistence test"
3. Close the browser completely
4. Reopen browser and login to admin
5. Go to Guidelines tab
6. **Expected**: Your "Persistence test" guideline is still there
7. **This confirms data is saved in PostgreSQL, not localStorage**

### Test 7: Data Source Verification
Open browser DevTools (F12) and check the Network tab:

1. In Admin Dashboard → Guidelines tab
2. Reload the page
3. Check Network tab for API calls
4. **Expected**: You should see `GET /api/v1/admin/guidelines/all`
5. Click on that request
6. **Expected**: Response shows JSON array of guideline objects with `id`, `text`, `isActive`, etc.

## What Was Fixed

### Before Fix ❌
- Admin Dashboard loaded guidelines from localStorage
- User page loaded from backend API
- New guidelines saved to backend but admin couldn't see them (because admin was reading from localStorage)

### After Fix ✅
- **Both** admin and user pages load from backend API
- Single source of truth: PostgreSQL database
- All CRUD operations work correctly
- Data persists across browser sessions

## Troubleshooting

### If guidelines don't appear in admin dashboard:
1. Open browser console (F12)
2. Check for errors in Console tab
3. Check Network tab for failed API calls
4. Verify backend is running: `http://localhost:8080/api/v1/admin/guidelines/all`

### If you see "Cannot edit/delete: Guideline ID not found":
- This means the guideline object doesn't have an `id` property
- Old guidelines from localStorage won't work
- Solution: Refresh the page to load fresh data from backend

### Clear old localStorage data (if needed):
```javascript
// Open browser console (F12) and run:
localStorage.removeItem('admin_guidelines');
location.reload();
```

## API Endpoints Reference

### Admin Endpoints
- `GET /api/v1/admin/guidelines/all` - Get all guidelines (including inactive)
- `POST /api/v1/admin/guidelines` - Create new guideline
- `PUT /api/v1/admin/guidelines/{id}` - Update guideline
- `DELETE /api/v1/admin/guidelines/{id}` - Delete guideline

### User Endpoints
- `GET /api/v1/admin/guidelines` - Get active guidelines only

## Success Criteria

✅ All tests pass without errors
✅ Guidelines persist after browser restart
✅ Admin can create, read, update, delete guidelines
✅ Users see active guidelines immediately
✅ No console errors
✅ API calls visible in Network tab

---

**If all tests pass, the fix is working correctly!** 🎉


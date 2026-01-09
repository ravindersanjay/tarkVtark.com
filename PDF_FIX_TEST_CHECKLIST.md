# 🧪 PDF Attachment Fix - Testing Checklist

**Date:** January 10, 2026  
**Issue Fixed:** PDF links showing "about:blank" when clicked from debate page

---

## ✅ **Pre-Test Verification**

### **1. Ensure Services Are Running**
```bash
# Backend (Terminal 1)
cd backend
./mvnw spring-boot:run

# Frontend (Terminal 2)
cd frontend
npm run dev
```

### **2. Check Endpoints**
- ✅ Frontend: http://localhost:5173
- ✅ Backend: http://localhost:8080
- ✅ API Health: http://localhost:8080/api/v1/health

---

## 🧪 **Test Cases**

### **Test 1: PDF File Links**

**Steps:**
1. Navigate to a debate page with attachments
2. Find a post with 📚 Evidence Attached
3. Locate a PDF file link (e.g., `document.pdf`)
4. Click on the PDF link

**Expected Result:**
- ✅ New tab opens immediately
- ✅ Browser's native PDF viewer displays the file
- ✅ URL in address bar shows: `http://localhost:8080/api/v1/files/{uuid}.pdf`
- ✅ NO "about:blank" page
- ✅ PDF content is readable

**BEFORE (Broken):** ❌ "about:blank" in new tab  
**AFTER (Fixed):** ✅ PDF displays correctly

---

### **Test 2: Image File Links**

**Steps:**
1. Find a post with image attachments
2. Click on an image link (e.g., `photo.jpg`)

**Expected Result:**
- ✅ New tab opens with custom HTML wrapper
- ✅ Image displays with dark background
- ✅ Image is centered and properly sized
- ✅ No errors

**Status:** ✅ Should still work as before (not broken by fix)

---

### **Test 3: Video File Links**

**Steps:**
1. Find a post with video attachments
2. Click on a video link (e.g., `clip.mp4`)

**Expected Result:**
- ✅ New tab opens
- ✅ Video player appears
- ✅ Video plays correctly
- ✅ Controls are visible

**Status:** ✅ Should work correctly

---

### **Test 4: Other Document Types**

**Steps:**
1. Test clicking on various file types:
   - `.doc` / `.docx` (Word documents)
   - `.xls` / `.xlsx` (Excel files)
   - `.txt` (Text files)

**Expected Result:**
- ✅ Files open in new tab
- ✅ Browser handles them appropriately (view or download)
- ✅ No blank pages

---

### **Test 5: Manual URL Copy-Paste**

**Steps:**
1. Right-click on a PDF attachment link
2. Copy the link address
3. Paste in new browser tab
4. Press Enter

**Expected Result:**
- ✅ PDF opens correctly
- ✅ Same behavior as clicking the link

**Note:** This was already working, should still work.

---

### **Test 6: Different File Sizes**

Test with files of various sizes:
- Small: < 100 KB
- Medium: 100 KB - 1 MB  
- Large: 1 MB - 10 MB

**Expected Result:**
- ✅ All sizes open correctly
- ✅ No timeout issues
- ✅ Loading is smooth

---

### **Test 7: Browser Console Check**

**Steps:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Click on various attachment links

**Expected Result:**
- ✅ No JavaScript errors
- ✅ No CORS errors
- ✅ No 404 errors
- ✅ Clean console

---

### **Test 8: Network Tab Verification**

**Steps:**
1. Open DevTools → Network tab
2. Click on a PDF link
3. Observe the network request

**Expected Result:**
- ✅ GET request to `/api/v1/files/{uuid}.pdf`
- ✅ Status: 200 OK
- ✅ Content-Type: `application/pdf`
- ✅ File downloads successfully

---

## 🐛 **Common Issues & Solutions**

### **Issue: Still seeing "about:blank"**
**Solution:**
1. Hard refresh browser (Ctrl + Shift + R)
2. Clear browser cache
3. Restart frontend dev server
4. Check if backend is running

### **Issue: File not found (404)**
**Solution:**
1. Verify file exists in `backend/uploads/` directory
2. Check storage_url in database
3. Ensure no duplicate port (`:8080:8080`)

### **Issue: Pop-up blocked**
**Solution:**
1. Allow pop-ups for `localhost:5173`
2. Check browser settings
3. Try different browser

---

## 📊 **Expected Test Results**

| Test Case | Before Fix | After Fix |
|-----------|------------|-----------|
| PDF links | ❌ about:blank | ✅ Opens correctly |
| Image links | ✅ Works | ✅ Still works |
| Video links | ✅ Works | ✅ Still works |
| Manual URL paste | ✅ Works | ✅ Still works |
| Browser console | ⚠️ May have errors | ✅ Clean |
| All file types | ❌ PDFs broken | ✅ All work |

---

## 🔍 **Technical Verification**

### **Code Changes Verified:**
```bash
# Check the fix is in place
grep -A 5 "isHttpUrl" frontend/src/components/Card.jsx
```

**Expected output should show:**
```javascript
const isHttpUrl = file.dataUrl.startsWith('http://') || 
                  file.dataUrl.startsWith('https://');

if (isHttpUrl) {
  window.open(file.dataUrl, '_blank', 'noopener,noreferrer');
```

### **Database Check:**
```sql
-- Verify no duplicate ports in storage URLs
SELECT id, file_name, storage_url 
FROM attachments 
WHERE storage_url LIKE '%:8080:8080%';
```

**Expected:** 0 rows (if you ran the fix script)

---

## ✅ **Success Criteria**

**All of the following must be TRUE:**

- [x] PDFs open in new tab (not blank)
- [x] Images still work as before
- [x] Videos play correctly
- [x] No console errors
- [x] No "about:blank" issues
- [x] All file types supported
- [x] Manual URL paste still works
- [x] Pop-ups work (not blocked)

**If ALL checked:** 🎉 **FIX SUCCESSFUL!**

---

## 📝 **Test Report Template**

```
========================================
PDF FIX TEST REPORT
========================================
Date: _______________
Tester: _______________
Browser: _______________
Browser Version: _______________

TEST RESULTS:
[ ] Test 1: PDF Links        ✅ PASS / ❌ FAIL
[ ] Test 2: Image Links      ✅ PASS / ❌ FAIL
[ ] Test 3: Video Links      ✅ PASS / ❌ FAIL
[ ] Test 4: Other Docs       ✅ PASS / ❌ FAIL
[ ] Test 5: Manual Copy      ✅ PASS / ❌ FAIL
[ ] Test 6: File Sizes       ✅ PASS / ❌ FAIL
[ ] Test 7: Console Clean    ✅ PASS / ❌ FAIL
[ ] Test 8: Network Check    ✅ PASS / ❌ FAIL

OVERALL STATUS: ✅ PASS / ❌ FAIL

NOTES:
_____________________________________________
_____________________________________________
_____________________________________________

ISSUES FOUND:
_____________________________________________
_____________________________________________
_____________________________________________
========================================
```

---

## 🚀 **Quick 30-Second Test**

Don't have time? Do this minimal test:

1. ✅ Open debate page
2. ✅ Click a PDF link
3. ✅ Verify it opens (not blank)
4. ✅ Done!

**If it works:** Fix is successful! 🎉

---

**Created By:** GitHub Copilot  
**Date:** January 10, 2026  
**Status:** Ready for Testing


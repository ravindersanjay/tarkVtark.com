# localStorage Quick Reference - Current State

## CRITICAL ISSUE: Attachments Stored as Base64 in localStorage

### Current localStorage Keys in Use

| Key | Location | Data Type | Size Risk | Migration Priority |
|-----|----------|-----------|-----------|-------------------|
| `evidence_${topicId}` | App.jsx:220 | Object with base64 files | **HIGH** | **P0 - CRITICAL** |
| `contact_messages` | ContactUs.jsx:14 | Array of messages | Low | P1 |
| `reported_posts` | Card.jsx:300 | Array of reports | Medium | P1 |
| `admin_faq_items` | AdminDashboard.jsx:78 | Array of FAQ | Low | P2 |
| `admin_guidelines` | AdminDashboard.jsx:88 | Array of strings | Low | P3 |
| `admin_logged_in` | AdminLogin.jsx:18 | String "true" | None | **Keep client-side** |

---

## Evidence Storage - THE PROBLEM

### Current Implementation (BROKEN for large files):

```javascript
// App.jsx line 220
const saveEvidenceToLocalStorage = (topicId, postId, evidence) => {
  const evidenceKey = `evidence_${topicId}`;
  const storedEvidence = localStorage.getItem(evidenceKey);
  const evidenceMap = storedEvidence ? JSON.parse(storedEvidence) : {};
  evidenceMap[postId] = evidence;
  localStorage.setItem(evidenceKey, JSON.stringify(evidenceMap));
};
```

### Evidence Data Structure:
```javascript
{
  "question-123-456": {
    files: [
      {
        name: "evidence.pdf",
        size: 154829,
        type: "application/pdf",
        dataUrl: "data:application/pdf;base64,JVBERi0xLjQKJeLjz9MK..." // HUGE STRING
      }
    ],
    urls: [
      "https://youtube.com/watch?v=abc123"
    ]
  },
  "reply-789-101": {
    files: [...],
    urls: [...]
  }
}
```

### Why This is BROKEN:
1. **localStorage has 5-10MB limit** → Users can't upload large files
2. **Base64 encoding increases size by 33%** → 7.5MB file = 10MB encoded
3. **Performance issues** → JSON parsing huge base64 strings freezes UI
4. **No persistence** → Clear browser cache = lose all files
5. **No sharing** → Can't share evidence across devices

---

## Files That Need Changes

### Priority 0 - CRITICAL (Evidence/Attachments)

**Backend:**
1. Create `database-attachments-schema.sql`
2. Create `Attachment.java` entity
3. Create `EvidenceUrl.java` entity
4. Create `AttachmentRepository.java`
5. Create `EvidenceUrlRepository.java`
6. Create `FileStorageService.java`
7. Create `FileUploadController.java`
8. Update `QuestionDTO.java` - add attachments/evidenceUrls fields
9. Update `ReplyDTO.java` - add attachments/evidenceUrls fields
10. Add to `application.yml` - file storage config

**Frontend:**
1. Update `frontend/src/services/apiService.js` - add filesAPI
2. Update `frontend/src/App.jsx` - replace saveEvidenceToLocalStorage
3. Update `frontend/src/App.jsx` - update addNewQuestion()
4. Update `frontend/src/App.jsx` - update postReply()
5. Update `frontend/src/App.jsx` - update useEffect (data loading)
6. Create `frontend/src/utils/evidenceMigration.js` - migration script
7. Update `frontend/src/components/AdminDashboard.jsx` - add migration button

### Priority 1 (Contact Messages & Reports)

**Backend:**
1. Create `database-reports-schema.sql`
2. Create `ReportedPost.java` entity
3. Create `ReportedPostRepository.java`
4. Create `ReportedPostController.java`
5. Update `ContactMessageController.java` (if not exists)

**Frontend:**
1. Update `frontend/src/components/ContactUs.jsx` - remove localStorage
2. Update `frontend/src/components/Card.jsx` - Report button to API
3. Update `frontend/src/components/AdminDashboard.jsx` - load from API

### Priority 2 (FAQ)

**Backend:**
1. Create `database-faq-schema.sql`
2. Create `FaqItem.java` entity
3. Create `FaqItemRepository.java`
4. Create `FaqController.java`

**Frontend:**
1. Update `frontend/src/components/FAQ.jsx` - load from API
2. Update `frontend/src/components/AdminDashboard.jsx` - FAQ CRUD via API

### Priority 3 (Guidelines - Already Partially Done)

**Backend:**
- ✅ Table exists: `guidelines`
- ✅ Entity exists: `Guideline.java`
- ✅ Repository exists: `GuidelineRepository.java`
- ✅ Controller exists: `AdminController.java`

**Frontend:**
1. Update `frontend/src/components/AdminDashboard.jsx` - remove localStorage, use API only
2. Update `frontend/src/components/Guidelines.jsx` - verify loading from API

---

## Immediate Action Items

### Step 1: Verify Current localStorage Usage
Run in browser console:
```javascript
// Check what's actually in localStorage right now
Object.keys(localStorage).forEach(key => {
  const value = localStorage.getItem(key);
  const size = new Blob([value]).size;
  console.log(`${key}: ${(size/1024).toFixed(2)} KB`);
  
  if (key.startsWith('evidence_')) {
    const data = JSON.parse(value);
    console.log(`  - ${Object.keys(data).length} posts with evidence`);
    Object.values(data).forEach(ev => {
      console.log(`    - ${ev.files?.length || 0} files, ${ev.urls?.length || 0} URLs`);
    });
  }
});

// Calculate total localStorage usage
const totalSize = Object.keys(localStorage).reduce((acc, key) => {
  return acc + new Blob([localStorage.getItem(key)]).size;
}, 0);
console.log(`Total localStorage: ${(totalSize/1024).toFixed(2)} KB / ${(totalSize/1024/1024).toFixed(2)} MB`);
```

### Step 2: Export localStorage Backup
Run in browser console:
```javascript
const backup = {};
Object.keys(localStorage).forEach(key => {
  backup[key] = localStorage.getItem(key);
});
const dataStr = JSON.stringify(backup, null, 2);
const dataBlob = new Blob([dataStr], {type: 'application/json'});
const url = URL.createObjectURL(dataBlob);
const link = document.createElement('a');
link.href = url;
link.download = `localStorage_backup_${new Date().toISOString()}.json`;
link.click();
```

### Step 3: Choose File Storage Option

**For Development:**
```yaml
# application.yml
file:
  storage:
    type: local
    local:
      upload-dir: ./uploads
```

**For Production:**
```yaml
# application.yml
file:
  storage:
    type: s3
    s3:
      bucket-name: debate-arena-files
      region: us-east-1
```

---

## Testing Checklist

Before starting migration:
- [ ] Backup current database
- [ ] Export localStorage to JSON
- [ ] Test file upload on backend (PostMan)
- [ ] Test file upload on frontend (dev environment)
- [ ] Verify files are accessible (open in browser)
- [ ] Test cascade delete (delete question → files deleted)

After migration:
- [ ] All evidence files accessible
- [ ] All evidence URLs working
- [ ] Old localStorage evidence still works (fallback)
- [ ] Performance improved (page load time)
- [ ] Can add new evidence (new flow works)

---

## Quick Migration Commands

### Database Setup:
```bash
# Run in WSL
cd /mnt/d/temp/tarkVtark.com

# Create new tables (after creating SQL files)
psql "postgresql://neondb_owner:npg_TfMWjGuX81EY@ep-curly-queen-a1tu44g3-pooler.ap-southeast-1.aws.neon.tech:5432/neondb?sslmode=require" -f database-attachments-schema.sql
```

### Backend Build:
```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

### Frontend Build:
```bash
cd frontend
npm install
npm run dev
```

---

## Rollback Plan (If Something Breaks)

### Immediate Rollback:
```bash
# Stop servers
# Restore database from backup
psql "..." -f backup_before_migration.sql

# Restore localStorage in browser console
fetch('/backup/localStorage_backup.json')
  .then(r => r.json())
  .then(data => {
    Object.entries(data).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
  });
```

### Gradual Rollback (Keep New Features):
- Keep database changes
- Revert frontend to use localStorage
- Keep dual-write enabled
- Investigate and fix issues
- Re-enable dual-read

---

## Success Criteria

✅ **Migration Complete When:**
1. No `localStorage.setItem` calls for evidence/attachments
2. All files uploaded to external storage (S3/local)
3. All file URLs stored in database
4. All evidence displays correctly in UI
5. Performance improved (faster page loads)
6. localStorage size < 1MB
7. Can handle files > 5MB
8. All tests pass

---

**Last Updated:** January 4, 2026  
**Status:** Analysis Complete - Ready to Start Implementation


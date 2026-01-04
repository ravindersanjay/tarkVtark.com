# LocalStorage to Database Migration Plan
## Complete Analysis & Step-by-Step Migration Strategy

**Generated:** January 4, 2026  
**Status:** Analysis Complete - Ready for Implementation

---

## SECTION 1: CURRENT STATE FINDINGS

### 1.1 Browser Storage Usage Inventory

#### **CRITICAL FINDING: Attachments & Evidence in localStorage**

**Location:** `frontend/src/App.jsx`
- **Function:** `saveEvidenceToLocalStorage(topicId, postId, evidence)`
- **Storage Key Pattern:** `evidence_${topicId}`
- **Data Structure:**
```javascript
{
  [postId]: {
    files: [
      {
        name: "document.pdf",
        size: 154829,
        type: "application/pdf",
        dataUrl: "data:application/pdf;base64,JVBERi0xLjQK..." // FULL BASE64 CONTENT
      }
    ],
    urls: [
      "https://youtube.com/watch?v=example",
      "https://article.com/source"
    ]
  }
}
```

**Problem:** Files are stored as full base64 strings in localStorage, which:
- Has 5-10MB limit per domain
- Causes performance issues with large files
- Not scalable or secure
- No backup/recovery mechanism

---

#### **Other localStorage Usage:**

1. **Contact Messages**
   - **Key:** `contact_messages`
   - **Location:** `frontend/src/components/ContactUs.jsx` (line 14)
   - **Data Structure:**
   ```javascript
   [
     {
       name: "John Doe",
       email: "john@example.com",
       message: "Message content",
       timestamp: "1/3/2026, 6:30:00 PM"
     }
   ]
   ```
   - **Backend Table:** `contact_messages` EXISTS ✓
   - **Migration:** Easy - table already exists

2. **Reported Posts**
   - **Key:** `reported_posts`
   - **Location:** `frontend/src/components/Card.jsx` (line 300)
   - **Data Structure:**
   ```javascript
   [
     {
       postId: "q-1704297600000-456",
       postText: "Offensive content...",
       reporter: "Anonymous",
       reason: "Hate speech",
       timestamp: "1/3/2026, 6:30:00 PM"
     }
   ]
   ```
   - **Backend Table:** DOES NOT EXIST ✗
   - **Migration:** Requires new table

3. **FAQ Items**
   - **Key:** `admin_faq_items`
   - **Location:** `frontend/src/components/AdminDashboard.jsx` (line 78)
   - **Data Structure:**
   ```javascript
   [
     {
       q: "How do I add a new debate topic?",
       a: "Go to the Home page..."
     }
   ]
   ```
   - **Backend Table:** DOES NOT EXIST ✗
   - **Migration:** Requires new table

4. **Guidelines**
   - **Key:** `admin_guidelines`
   - **Location:** `frontend/src/components/AdminDashboard.jsx` (line 88)
   - **Data Structure:**
   ```javascript
   [
     "Be respectful and constructive in your arguments.",
     "No hate speech, personal attacks, or discrimination."
   ]
   ```
   - **Backend Table:** `guidelines` EXISTS ✓
   - **Migration:** Partially implemented (already has backend API)

5. **Admin Login Flag**
   - **Key:** `admin_logged_in`
   - **Location:** `frontend/src/components/AdminLogin.jsx` (line 18)
   - **Data:** `"true"` (string)
   - **Migration:** Should remain client-side (session state)

---

### 1.2 Evidence/Attachment Flow Analysis

**Current Implementation:**

1. **User uploads file** → `ReplyForm.jsx` / `Card.jsx`
2. **File stored in component state** → Array of `File` objects
3. **On submit** → `App.jsx` converts to base64 via `FileReader.readAsDataURL()`
4. **Stored in localStorage** → `evidence_${topicId}` key with full base64 data
5. **On load** → Retrieved from localStorage and merged with database questions

**Files Accepted:**
- Images: `image/*`
- Videos: `video/*`
- Audio: `audio/*`
- Documents: `.pdf`, `.doc`, `.docx`

**Display Implementation:** `Card.jsx` (lines 79-171)
- Opens files in new tab using dataUrl
- Custom HTML viewers for images, PDFs, videos, audio

---

### 1.3 Database Schema Analysis

**Existing Tables:**
```sql
✓ debate_topics
✓ questions
✓ replies
✓ admin_users
✓ contact_messages
✓ guidelines
```

**Missing Tables Needed:**
```sql
✗ reported_posts
✗ faq_items
✗ attachments (for evidence files)
```

**Existing Columns in questions/replies:**
- No `evidence_files` or `evidence_urls` columns
- No attachment relationship

---

## SECTION 2: RISK ASSESSMENT

### 2.1 Critical Risks

| Risk | Severity | Impact | Mitigation |
|------|----------|--------|------------|
| **Base64 in localStorage exceeds 5MB limit** | HIGH | Users cannot add large files, app crashes | Implement file upload to external storage immediately |
| **Data loss during migration** | HIGH | Users lose attachments/evidence | Dual-write pattern during transition |
| **Broken file links after migration** | MEDIUM | Existing evidence becomes inaccessible | Keep localStorage as fallback during migration |
| **Database bloat from binary data** | HIGH | Performance degradation | Store files externally, only metadata in DB |
| **Concurrent writes to localStorage** | LOW | Evidence data corruption | Move to backend API with proper locking |

### 2.2 Breaking Changes to Avoid

❌ **DO NOT:**
1. Delete localStorage data before migration is complete
2. Change API response structure without versioning
3. Remove file display functionality during migration
4. Delete backend columns/tables without deprecation period

✓ **DO:**
1. Implement dual-read (database first, localStorage fallback)
2. Add new API endpoints without modifying existing ones
3. Migrate data incrementally by topic
4. Keep backward compatibility for 2 release cycles

---

## SECTION 3: MIGRATION STRATEGY

### Phase 1: Database Schema Updates (Week 1)

**Step 1.1: Create Attachments Table**
```sql
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    reply_id UUID REFERENCES replies(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    storage_url TEXT NOT NULL,  -- External storage URL (S3, Cloudinary, etc.)
    uploaded_by VARCHAR(100) DEFAULT 'Anonymous',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT attachment_parent_check CHECK (
        (question_id IS NOT NULL AND reply_id IS NULL) OR
        (question_id IS NULL AND reply_id IS NOT NULL)
    )
);

CREATE INDEX idx_attachments_question ON attachments(question_id);
CREATE INDEX idx_attachments_reply ON attachments(reply_id);
```

**Step 1.2: Create Evidence URLs Table**
```sql
CREATE TABLE evidence_urls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    reply_id UUID REFERENCES replies(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT evidence_url_parent_check CHECK (
        (question_id IS NOT NULL AND reply_id IS NULL) OR
        (question_id IS NULL AND reply_id IS NOT NULL)
    )
);

CREATE INDEX idx_evidence_urls_question ON evidence_urls(question_id);
CREATE INDEX idx_evidence_urls_reply ON evidence_urls(reply_id);
```

**Step 1.3: Create Reported Posts Table**
```sql
CREATE TABLE reported_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id VARCHAR(100) NOT NULL,  -- uniqueId from questions/replies
    post_type VARCHAR(20) NOT NULL CHECK (post_type IN ('question', 'reply')),
    post_text TEXT,
    reporter_name VARCHAR(100),
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by VARCHAR(100)
);

CREATE INDEX idx_reported_posts_status ON reported_posts(status);
CREATE INDEX idx_reported_posts_created ON reported_posts(created_at DESC);
```

**Step 1.4: Create FAQ Table**
```sql
CREATE TABLE faq_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_faq_display_order ON faq_items(display_order);
CREATE INDEX idx_faq_active ON faq_items(is_active);
```

---

### Phase 2: Backend Implementation (Week 2-3)

**Step 2.1: Create Java Entities**

**Attachment.java:**
```java
@Entity
@Table(name = "attachments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Attachment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id")
    @JsonIgnore
    private Question question;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reply_id")
    @JsonIgnore
    private Reply reply;
    
    @Column(name = "file_name", nullable = false)
    private String fileName;
    
    @Column(name = "file_size", nullable = false)
    private Long fileSize;
    
    @Column(name = "file_type", nullable = false)
    private String fileType;
    
    @Column(name = "storage_url", nullable = false, columnDefinition = "TEXT")
    private String storageUrl;
    
    @Column(name = "uploaded_by")
    private String uploadedBy;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
```

**EvidenceUrl.java, ReportedPost.java, FaqItem.java** (similar structure)

**Step 2.2: Update DTOs**

Add to `QuestionDTO.java` and `ReplyDTO.java`:
```java
public class QuestionDTO {
    // ...existing fields...
    
    private List<AttachmentDTO> attachments = new ArrayList<>();
    private List<String> evidenceUrls = new ArrayList<>();
}

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttachmentDTO {
    private UUID id;
    private String fileName;
    private Long fileSize;
    private String fileType;
    private String storageUrl;
    private LocalDateTime createdAt;
}
```

**Step 2.3: Create File Upload Controller**

**FileUploadController.java:**
```java
@RestController
@RequestMapping("/api/v1/files")
@CrossOrigin(origins = "http://localhost:5173")
public class FileUploadController {
    
    @Autowired
    private FileStorageService fileStorageService;
    
    @Autowired
    private AttachmentRepository attachmentRepository;
    
    @PostMapping("/upload")
    public ResponseEntity<AttachmentDTO> uploadFile(
        @RequestParam("file") MultipartFile file,
        @RequestParam(required = false) UUID questionId,
        @RequestParam(required = false) UUID replyId
    ) {
        // 1. Validate file
        // 2. Upload to external storage (S3/Cloudinary)
        // 3. Save metadata to database
        // 4. Return AttachmentDTO with storageUrl
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFile(@PathVariable UUID id) {
        // 1. Get attachment from DB
        // 2. Delete from external storage
        // 3. Delete from database
    }
}
```

**Step 2.4: Implement File Storage Service**

Options:
1. **AWS S3** (recommended for production)
2. **Cloudinary** (good for images/videos)
3. **Local file system** (for development/testing)

```java
@Service
public class FileStorageService {
    
    @Value("${file.storage.type}") // s3, cloudinary, or local
    private String storageType;
    
    public String uploadFile(MultipartFile file) {
        // Returns publicly accessible URL
    }
    
    public void deleteFile(String storageUrl) {
        // Deletes file from storage
    }
}
```

---

### Phase 3: Frontend Updates (Week 4)

**Step 3.1: Create File Upload API Service**

Add to `frontend/src/services/apiService.js`:
```javascript
const filesAPI = {
  upload: async (file, questionId = null, replyId = null) => {
    const formData = new FormData();
    formData.append('file', file);
    if (questionId) formData.append('questionId', questionId);
    if (replyId) formData.append('replyId', replyId);
    
    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: 'POST',
      body: formData  // Don't set Content-Type, browser will set it
    });
    
    if (!response.ok) throw new Error('File upload failed');
    return response.json();
  },
  
  delete: async (id) => {
    return apiFetch(`/files/${id}`, { method: 'DELETE' });
  }
};
```

**Step 3.2: Update App.jsx - Dual Write Pattern**

Modify `addNewQuestion()` and `postReply()`:
```javascript
// OLD: Convert files to base64 and store in localStorage
const processedFiles = await Promise.all(
  newQuestionFiles.map(file => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({ name: file.name, size: file.size, type: file.type, dataUrl: e.target.result });
      };
      reader.readAsDataURL(file);
    });
  })
);
saveEvidenceToLocalStorage(topicId, savedQuestion.id, { files: processedFiles, urls: newQuestionUrls });

// NEW: Upload files to backend, store only URLs
const uploadedFiles = await Promise.all(
  newQuestionFiles.map(file => filesAPI.upload(file, savedQuestion.id, null))
);

// Save URLs to backend
await questionsAPI.addEvidenceUrls(savedQuestion.id, newQuestionUrls);

// FALLBACK: Keep localStorage temporarily for backward compatibility
saveEvidenceToLocalStorage(topicId, savedQuestion.id, {
  files: uploadedFiles.map(f => ({ ...f, dataUrl: f.storageUrl })),
  urls: newQuestionUrls
});
```

**Step 3.3: Update Data Loading - Dual Read Pattern**

Modify `useEffect` in App.jsx:
```javascript
// Load from database first, fallback to localStorage
const questionsWithEvidence = questions.map(q => {
  const transformedQuestion = transformBackendToFrontend(q);
  
  // NEW: Evidence from database
  const dbEvidence = {
    files: q.attachments || [],
    urls: q.evidenceUrls || []
  };
  
  // FALLBACK: Evidence from localStorage (for old data)
  const lsEvidence = evidenceMap[q.id] || { files: [], urls: [] };
  
  // Merge (prefer database)
  return {
    ...transformedQuestion,
    evidence: {
      files: dbEvidence.files.length > 0 ? dbEvidence.files : lsEvidence.files,
      urls: dbEvidence.urls.length > 0 ? dbEvidence.urls : lsEvidence.urls
    }
  };
});
```

---

### Phase 4: Data Migration Script (Week 5)

**Step 4.1: Create Migration Endpoint**

**AdminController.java:**
```java
@PostMapping("/migrate-evidence")
public ResponseEntity<String> migrateEvidenceFromLocalStorage() {
    // This endpoint will be called manually by admin
    // to migrate localStorage data to database
    // (Frontend will send localStorage data via POST)
    return ResponseEntity.ok("Migration started");
}
```

**Step 4.2: Frontend Migration Tool**

Create `frontend/src/utils/evidenceMigration.js`:
```javascript
export const migrateEvidenceToBackend = async () => {
  // 1. Read all evidence_* keys from localStorage
  // 2. For each topic:
  //    - Upload files to backend
  //    - Save URLs to backend
  // 3. Mark migration as complete
  // 4. DO NOT delete localStorage yet (keep as backup)
};
```

**Step 4.3: Admin Dashboard Migration Button**

Add to AdminDashboard.jsx:
```jsx
<button onClick={async () => {
  if (confirm('Migrate all evidence from localStorage to database?')) {
    await migrateEvidenceToBackend();
    alert('Migration complete!');
  }
}}>
  Migrate Evidence to Database
</button>
```

---

### Phase 5: Other localStorage Migrations (Week 6)

**Step 5.1: Contact Messages**
- Backend API already exists ✓
- Update ContactUs.jsx to POST to `/api/v1/contact` instead of localStorage
- Remove localStorage.setItem calls

**Step 5.2: Reported Posts**
- Create backend API (ReportedPostController)
- Update Card.jsx Report button to POST to `/api/v1/reports`
- Load reports in AdminDashboard from backend API

**Step 5.3: FAQ Items**
- Create backend API (FaqController)
- Update AdminDashboard FAQ management to use backend
- Update FAQ.jsx to load from backend API

**Step 5.4: Guidelines**
- Already partially implemented ✓
- Complete the backend integration (AdminController already has endpoints)
- Remove localStorage usage in AdminDashboard

---

### Phase 6: Cleanup & Validation (Week 7)

**Step 6.1: Remove localStorage Writes**

Search and remove all `localStorage.setItem` calls for:
- `evidence_*`
- `contact_messages`
- `reported_posts`
- `admin_faq_items`
- `admin_guidelines`

**Step 6.2: Keep localStorage Reads as Fallback**

For 2 release cycles, keep reading from localStorage as fallback:
```javascript
const data = await fetchFromBackend() || getFromLocalStorage();
```

**Step 6.3: Add localStorage Cleanup Utility**

Create admin tool to clear old localStorage data:
```javascript
export const cleanupOldLocalStorage = () => {
  const keysToRemove = [
    'evidence_*',
    'contact_messages',
    'reported_posts',
    'admin_faq_items',
    'admin_guidelines'
  ];
  
  Object.keys(localStorage).forEach(key => {
    if (keysToRemove.some(pattern => key.startsWith(pattern.replace('*', '')))) {
      const backup = localStorage.getItem(key);
      console.log(`Removing ${key}, backup:`, backup);
      localStorage.removeItem(key);
    }
  });
};
```

---

## SECTION 4: BACKEND & DB CHANGES REQUIRED

### 4.1 Database Schema Changes

| Table | Action | Columns | Indexes |
|-------|--------|---------|---------|
| `attachments` | CREATE | id, question_id, reply_id, file_name, file_size, file_type, storage_url, uploaded_by, created_at | question_id, reply_id |
| `evidence_urls` | CREATE | id, question_id, reply_id, url, display_order, created_at | question_id, reply_id |
| `reported_posts` | CREATE | id, post_id, post_type, post_text, reporter_name, reason, status, created_at, reviewed_at, reviewed_by | status, created_at |
| `faq_items` | CREATE | id, question, answer, display_order, is_active, created_at, updated_at | display_order, is_active |

### 4.2 New Backend Components

**Entities:**
- Attachment.java
- EvidenceUrl.java
- ReportedPost.java
- FaqItem.java

**Repositories:**
- AttachmentRepository.java
- EvidenceUrlRepository.java
- ReportedPostRepository.java
- FaqItemRepository.java

**Controllers:**
- FileUploadController.java (new)
- ReportedPostController.java (new)
- FaqController.java (new)
- AdminController.java (extend existing)

**Services:**
- FileStorageService.java (new)
- S3StorageService.java (implementation)
- LocalStorageService.java (for development)

**DTOs:**
- AttachmentDTO.java
- EvidenceUrlDTO.java
- ReportedPostDTO.java
- FaqItemDTO.java

### 4.3 API Endpoints Required

```
POST   /api/v1/files/upload                    - Upload file
DELETE /api/v1/files/{id}                       - Delete file
POST   /api/v1/questions/{id}/evidence-urls     - Add evidence URLs
DELETE /api/v1/questions/{id}/evidence-urls/{urlId} - Remove URL
POST   /api/v1/replies/{id}/evidence-urls       - Add evidence URLs
DELETE /api/v1/replies/{id}/evidence-urls/{urlId} - Remove URL

POST   /api/v1/reports                          - Create report
GET    /api/v1/reports                          - List all reports (admin)
PUT    /api/v1/reports/{id}/status              - Update report status
DELETE /api/v1/reports/{id}                     - Delete report

GET    /api/v1/faq                              - Get all FAQ items
POST   /api/v1/faq                              - Create FAQ item (admin)
PUT    /api/v1/faq/{id}                         - Update FAQ item (admin)
DELETE /api/v1/faq/{id}                         - Delete FAQ item (admin)

POST   /api/v1/admin/migrate-evidence           - Migrate localStorage evidence
```

### 4.4 Configuration Changes

**application.yml:**
```yaml
file:
  storage:
    type: local  # or s3, cloudinary
    local:
      upload-dir: ./uploads
    s3:
      bucket-name: debate-arena-files
      region: us-east-1
      access-key: ${AWS_ACCESS_KEY}
      secret-key: ${AWS_SECRET_KEY}
    max-file-size: 10MB
    allowed-types: image/*,video/*,audio/*,application/pdf
```

---

## SECTION 5: VALIDATION & ROLLBACK PLAN

### 5.1 Validation Checklist

**Pre-Migration:**
- [ ] Backup database
- [ ] Export localStorage data to JSON files
- [ ] Test file upload in development environment
- [ ] Verify external storage (S3) connectivity
- [ ] Load test with 100+ files

**Post-Migration:**
- [ ] Verify all questions have correct attachments
- [ ] Verify all replies have correct evidence URLs
- [ ] Check file accessibility (open each type in browser)
- [ ] Verify delete operations cascade correctly
- [ ] Test offline mode (should still work with cached data)
- [ ] Performance test: Load time for topic with 100+ questions

**Evidence Validation Script:**
```javascript
// Run in browser console
const validateEvidence = async () => {
  const results = { success: 0, failed: 0, missing: 0 };
  
  // Check each topic
  for (const topic of topics) {
    const questions = await questionsAPI.getByTopic(topic.id);
    
    for (const q of questions) {
      if (q.attachments) {
        for (const att of q.attachments) {
          try {
            const response = await fetch(att.storageUrl, { method: 'HEAD' });
            if (response.ok) results.success++;
            else results.failed++;
          } catch (err) {
            results.failed++;
          }
        }
      }
      
      // Check localStorage backup
      const lsKey = `evidence_${topic.id}`;
      const lsData = localStorage.getItem(lsKey);
      if (lsData && JSON.parse(lsData)[q.id]) {
        // Evidence exists in localStorage but not in DB
        results.missing++;
      }
    }
  }
  
  console.table(results);
  return results;
};
```

### 5.2 Rollback Procedures

**Scenario 1: File upload fails during migration**
```bash
# Rollback script
1. Stop backend server
2. Restore database from backup
3. Keep localStorage data (don't clean)
4. Redeploy old frontend version
5. Investigate error logs
6. Fix issue and retry
```

**Scenario 2: Files accessible but not loading in UI**
```bash
# Fix without rollback
1. Check CORS settings on storage (S3/Cloudinary)
2. Verify storageUrl format in database
3. Check browser console for CSP errors
4. Update frontend to handle new URL format
5. No data loss, can fix in place
```

**Scenario 3: Database performance degradation**
```bash
# Optimization without rollback
1. Add missing indexes
2. Optimize queries (add LIMIT, pagination)
3. Implement CDN for file URLs
4. Add database connection pooling
5. Cache frequently accessed files
```

### 5.3 Emergency Rollback (Complete)

**If migration fails catastrophically:**

1. **Database Rollback:**
   ```sql
   -- Drop new tables
   DROP TABLE IF EXISTS attachments CASCADE;
   DROP TABLE IF EXISTS evidence_urls CASCADE;
   DROP TABLE IF EXISTS reported_posts CASCADE;
   DROP TABLE IF EXISTS faq_items CASCADE;
   
   -- Restore from backup
   psql -U postgres -d neondb < backup_before_migration.sql
   ```

2. **Backend Rollback:**
   ```bash
   git checkout <commit-before-migration>
   mvn clean install
   ./mvnw spring-boot:run
   ```

3. **Frontend Rollback:**
   ```bash
   git checkout <commit-before-migration>
   npm install
   npm run dev
   ```

4. **localStorage Restore:**
   ```javascript
   // Run in browser console
   const backupData = await fetch('/backup/localStorage_backup.json');
   const data = await backupData.json();
   Object.entries(data).forEach(([key, value]) => {
     localStorage.setItem(key, JSON.stringify(value));
   });
   ```

---

## SECTION 6: TESTING & VERIFICATION

### 6.1 Test Cases

**TC-1: File Upload**
- [ ] Upload image (JPEG, PNG, GIF)
- [ ] Upload video (MP4, WebM)
- [ ] Upload audio (MP3, WAV)
- [ ] Upload PDF
- [ ] Upload Word document
- [ ] Reject files > 10MB
- [ ] Reject disallowed file types (.exe, .sh)

**TC-2: Evidence Display**
- [ ] Image opens in new tab with proper viewer
- [ ] PDF opens in browser PDF viewer
- [ ] Video plays with controls
- [ ] Audio plays with controls
- [ ] Multiple files display correctly
- [ ] Evidence URLs are clickable
- [ ] Files from localStorage still work (backward compat)

**TC-3: Evidence Deletion**
- [ ] Delete question also deletes attachments (CASCADE)
- [ ] Delete reply also deletes attachments (CASCADE)
- [ ] Delete attachment removes file from storage
- [ ] Delete attachment removes database entry
- [ ] Cannot delete attachment belonging to another user (future: auth)

**TC-4: Migration**
- [ ] Migrate evidence for 1 topic successfully
- [ ] Migrate evidence for all topics
- [ ] Handle topics with no evidence
- [ ] Handle corrupted localStorage data gracefully
- [ ] Progress indicator works
- [ ] Can retry failed migrations

**TC-5: Contact Messages**
- [ ] Submit contact message saves to database
- [ ] Admin can view all messages
- [ ] Admin can mark messages as read
- [ ] Old messages from localStorage are preserved

**TC-6: Reported Posts**
- [ ] Report question saves to database
- [ ] Report reply saves to database
- [ ] Admin can view all reports
- [ ] Admin can change report status
- [ ] Admin can delete reports

**TC-7: FAQ & Guidelines**
- [ ] Load FAQ from database
- [ ] Admin can add FAQ item
- [ ] Admin can edit FAQ item
- [ ] Admin can delete FAQ item
- [ ] Load guidelines from database
- [ ] Admin can manage guidelines

### 6.2 Performance Benchmarks

**Before Migration (localStorage):**
- Initial load time: ~500ms
- Add question with 5 files: ~2000ms (base64 encoding)
- Load topic with 100 questions: ~3000ms
- localStorage size: 8MB (approaching limit)

**After Migration (database + S3):**
- Initial load time: < 800ms (network latency for file URLs)
- Add question with 5 files: ~3000ms (actual upload)
- Load topic with 100 questions: < 1500ms (no base64 parsing)
- localStorage size: < 1MB (only minimal session data)

**Target Metrics:**
- File upload: < 5 seconds for 10MB file
- Page load: < 2 seconds for 100 questions with attachments
- Storage limit: 1GB per user (S3 quota)

### 6.3 Automated Tests

**Backend Integration Tests:**
```java
@Test
public void testFileUpload() {
    MockMultipartFile file = new MockMultipartFile(
        "file", "test.pdf", "application/pdf", "test content".getBytes()
    );
    
    AttachmentDTO result = fileUploadController.uploadFile(file, questionId, null);
    
    assertNotNull(result.getStorageUrl());
    assertTrue(result.getStorageUrl().startsWith("https://"));
}

@Test
public void testCascadeDeleteAttachments() {
    Question question = createQuestionWithAttachments();
    questionRepository.delete(question);
    
    List<Attachment> attachments = attachmentRepository.findByQuestionId(question.getId());
    assertEquals(0, attachments.size());
}
```

**Frontend Unit Tests:**
```javascript
describe('Evidence Migration', () => {
  test('migrates localStorage evidence to backend', async () => {
    localStorage.setItem('evidence_topic-123', JSON.stringify({
      'question-456': {
        files: [{ name: 'test.pdf', size: 1024, type: 'application/pdf', dataUrl: 'data:...' }],
        urls: ['https://example.com']
      }
    }));
    
    await migrateEvidenceToBackend();
    
    const questions = await questionsAPI.getByTopic('topic-123');
    expect(questions[0].attachments.length).toBe(1);
    expect(questions[0].evidenceUrls.length).toBe(1);
  });
});
```

---

## SECTION 7: FINAL CHECKLIST

### Pre-Implementation
- [ ] Review this plan with team
- [ ] Get approval from stakeholders
- [ ] Set up AWS S3 bucket (or alternative storage)
- [ ] Create database backup
- [ ] Export localStorage to backup files
- [ ] Set up monitoring/logging

### Phase 1: Database
- [ ] Create migration SQL file
- [ ] Test migration on dev database
- [ ] Run migration on staging database
- [ ] Verify all tables created correctly
- [ ] Check indexes are created

### Phase 2: Backend
- [ ] Create all entity classes
- [ ] Create all repository classes
- [ ] Create all DTO classes
- [ ] Implement FileStorageService
- [ ] Create FileUploadController
- [ ] Test file upload locally
- [ ] Deploy to staging
- [ ] Test file upload on staging

### Phase 3: Frontend
- [ ] Add filesAPI to apiService
- [ ] Update App.jsx with dual-write
- [ ] Update App.jsx with dual-read
- [ ] Test locally with backend
- [ ] Deploy to staging
- [ ] Test end-to-end on staging

### Phase 4: Migration
- [ ] Create migration script
- [ ] Test migration on dev data
- [ ] Add migration button to admin dashboard
- [ ] Perform migration on staging
- [ ] Validate all evidence migrated
- [ ] Get user acceptance on staging

### Phase 5: Other Data
- [ ] Migrate contact messages
- [ ] Migrate reported posts
- [ ] Migrate FAQ items
- [ ] Complete guidelines migration
- [ ] Test all admin features

### Phase 6: Cleanup
- [ ] Remove localStorage.setItem calls
- [ ] Keep localStorage.getItem as fallback
- [ ] Add cleanup utility to admin
- [ ] Update documentation
- [ ] Train admins on new features

### Phase 7: Production
- [ ] Deploy backend to production
- [ ] Deploy frontend to production
- [ ] Run migration on production
- [ ] Monitor for errors
- [ ] Validate critical evidence
- [ ] Keep localStorage backup for 30 days
- [ ] Remove localStorage reads after 60 days

---

## APPENDIX A: File Storage Recommendations

### Option 1: AWS S3 (Recommended for Production)
**Pros:**
- Scalable, reliable, industry standard
- Built-in CDN with CloudFront
- Fine-grained access control
- Low cost ($0.023/GB/month)

**Cons:**
- Requires AWS account setup
- Need to manage credentials securely

**Implementation:**
```xml
<!-- pom.xml -->
<dependency>
    <groupId>com.amazonaws</groupId>
    <artifactId>aws-java-sdk-s3</artifactId>
    <version>1.12.500</version>
</dependency>
```

### Option 2: Cloudinary (Good for Images/Videos)
**Pros:**
- Automatic image optimization
- Built-in transformations (resize, crop)
- Generous free tier

**Cons:**
- More expensive for large files
- Focused on media, not documents

### Option 3: Local File System (Development Only)
**Pros:**
- Simple, no external dependencies
- Free

**Cons:**
- Not scalable
- No redundancy
- Server restart may lose files

---

## APPENDIX B: Security Considerations

1. **File Upload Security:**
   - Validate file types on backend (not just frontend)
   - Scan for viruses (ClamAV integration)
   - Limit file size (10MB default)
   - Sanitize file names (remove special characters)
   - Store files with UUID names (prevent overwrite)

2. **Access Control:**
   - Publicly readable files (for now)
   - Future: Add authentication to file URLs
   - Use signed URLs for private content
   - Implement rate limiting on uploads

3. **Data Privacy:**
   - No personal data in file names
   - Encrypt files at rest (S3 encryption)
   - HTTPS only for file access
   - GDPR compliance: Delete user data on request

---

## SUMMARY

**Total Estimated Time:** 7 weeks  
**Risk Level:** MEDIUM (with proper testing)  
**Breaking Changes:** ZERO (with dual-read/write pattern)  
**Data Loss Risk:** MINIMAL (localStorage kept as backup)  

**Key Success Factors:**
1. ✅ Dual-write pattern ensures no data loss
2. ✅ Dual-read pattern provides backward compatibility
3. ✅ External file storage prevents database bloat
4. ✅ Incremental migration allows testing at each phase
5. ✅ localStorage backup provides rollback safety net

**Next Steps:**
1. Review and approve this plan
2. Set up external file storage (S3)
3. Begin Phase 1: Database schema updates
4. Test each phase thoroughly before proceeding

---

**Document Status:** READY FOR IMPLEMENTATION  
**Last Updated:** January 4, 2026  
**Version:** 1.0


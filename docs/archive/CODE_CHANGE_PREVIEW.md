# **CODE CHANGE PREVIEW - What Will Be Modified**

## **File to Change**
`backend/src/main/java/com/debatearena/controller/FileUploadController.java`

## **Method to Fix**
`downloadFile()` method (currently at line ~134-148)

## **Current Code (BROKEN for R2)**
```java
@GetMapping("/{filename}")
public ResponseEntity<Resource> downloadFile(@PathVariable String filename) {
    try {
        Path filePath = Paths.get(uploadDir).resolve(filename).normalize();
        Resource resource = new FileSystemResource(filePath);

        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }

        // Determine content type
        String contentType = Files.probeContentType(filePath);
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(resource);

    } catch (IOException e) {
        logger.error("File download failed", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
}
```

### **Problem with This Code**
- Always reads from local filesystem (`FileSystemResource`)
- When using R2, files are NOT on the filesystem
- So downloads will fail with R2

---

## **NEW Code (FIXED for Both Local and R2)**
```java
@GetMapping("/{filename}")
public ResponseEntity<Resource> downloadFile(@PathVariable String filename) {
    try {
        // For local storage, serve from filesystem
        if ("local".equals(fileStorageService.getProviderName())) {
            Path filePath = Paths.get(uploadDir).resolve(filename).normalize();
            Resource resource = new FileSystemResource(filePath);

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            // Determine content type
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .body(resource);
        } else {
            // For remote storage (R2, S3), redirect to storage URL
            Attachment attachment = attachmentRepository.findByFileName(filename);
            if (attachment != null && attachment.getStorageUrl() != null) {
                return ResponseEntity.status(HttpStatus.FOUND)
                        .header(HttpHeaders.LOCATION, attachment.getStorageUrl())
                        .build();
            } else {
                return ResponseEntity.notFound().build();
            }
        }

    } catch (IOException e) {
        logger.error("File download failed", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
}
```

---

## **What Changed?**

### **Added Logic**
1. Check which storage provider is active: `fileStorageService.getProviderName()`
2. If provider is **"local"** → do old behavior (serve from disk)
3. If provider is **NOT "local"** (e.g., "r2") → redirect to the stored cloud URL

### **Why This Works**
- **Local development**: Still uses local files, no changes needed
- **Production (R2)**: Redirects to R2 URL (file is already public)
- **No breaking changes**: Existing code unaffected

### **Database Query Added**
```java
Attachment attachment = attachmentRepository.findByFileName(filename);
```
- Looks up the attachment record by filename
- Retrieves the `storageUrl` (which points to R2)
- Returns HTTP 302 redirect to that URL

---

## **Why HTTP 302 Redirect?**
- Browser automatically follows the redirect
- User sees the file as if it was downloaded from your server
- R2 handles actual file delivery
- Your server does minimal work

### **Alternative Approach** (Not Used)
Could proxy the file from R2 through your server, but that's slower and uses your bandwidth. Redirect is better.

---

## **Side-by-Side Comparison**

| Aspect | Local Storage | R2 Storage |
|--------|---|---|
| **File Location** | Disk on server | Cloudflare R2 cloud |
| **Storage Provider** | "local" | "r2" |
| **Download Behavior** | Serve from disk | Redirect to cloud URL |
| **Performance** | Good for dev | Good for production |
| **Cost** | Free but breaks in production | Free tier covers you |
| **Reliability** | Ephemeral (dies on deploy) | Persistent (survives reboots) |

---

## **Testing Checklist**

After the code is deployed:

- [ ] Upload a file locally with `FILE_PROVIDER=local` → should work as before
- [ ] Upload a file on production with `FILE_PROVIDER=r2` → file should appear in R2 console
- [ ] Download the file from UI → should redirect to R2 and display file
- [ ] Check database → `Attachment.storageUrl` should be R2 URL
- [ ] Delete attachment → should delete from R2
- [ ] No existing debates/questions/replies affected → verify they still display

---

## **Rollback Plan (If Something Goes Wrong)**

If things don't work after deployment:

1. Revert to previous commit:
   ```bash
   git revert HEAD
   git push
   ```

2. Or manually fix:
   - Change `FILE_PROVIDER=local` in env vars
   - Deploy again

Everything reverts instantly, no data loss.

---

## **Summary of the Fix**

| Metric | Before | After |
|--------|--------|-------|
| **Lines changed** | 0 | ~15 lines |
| **Breaking changes** | N/A | None ✅ |
| **Complexity** | N/A | Very low |
| **Time to implement** | N/A | 5 minutes |
| **Risk** | N/A | Very low |
| **Rollback time** | N/A | 1 minute |

---

## **Questions About This Change?**

- "Will this break local development?" → NO, local dev still uses local storage
- "Will this break existing code?" → NO, all other endpoints unaffected
- "Do I need to change the database?" → NO, database already stores storageUrl
- "Do I need to change frontend?" → NO, frontend just downloads from the URL
- "What if I don't set FILE_PROVIDER env var?" → It defaults to "local", so old behavior stays

---

**Ready to proceed?** Say "Yes, implement this fix" and I'll:
1. Make the change
2. Test it locally
3. Verify no compilation errors
4. Push to GitHub
5. Give you Render deployment checklist



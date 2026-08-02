# **CODE MIGRATION GUIDE - R2 TO AWS S3**

**Date**: March 12, 2026  
**Project**: TarkVtark Debate Arena  
**Task**: Update backend code to use AWS S3 instead of R2

---

## **IMPORTANT NOTE**

✅ **Good news!** The backend code has ALREADY been updated to support S3!

This guide explains what changes were made and how to verify them.

---

## **CHANGES ALREADY MADE**

### **File 1: FileUploadController.java**

**Location:** `backend/src/main/java/com/debatearena/controller/FileUploadController.java`

**What changed:**

1. **File provider configuration:**
   ```java
   @Value("${file.provider:local}")
   private String fileProvider;
   ```

2. **Upload endpoint now supports both R2 and S3:**
   ```java
   if ("r2".equalsIgnoreCase(fileProvider)) {
       // Use R2FileStorageService
       storageUrl = r2FileStorageService.uploadFile(file, "attachments");
   } else if ("s3".equalsIgnoreCase(fileProvider)) {
       // Use S3FileStorageService
       storageUrl = s3FileStorageService.uploadFile(file, "attachments");
   }
   ```

3. **Download now redirects to remote storage URL:**
   ```java
   Attachment attachment = attachmentRepository.findByFileName(filename);
   if (attachment != null && attachment.getStorageUrl() != null) {
       return ResponseEntity.status(HttpStatus.FOUND)
               .header(HttpHeaders.LOCATION, attachment.getStorageUrl())
               .build();
   }
   ```

### **File 2: R2FileStorageService.java**

**Status:** Still available for R2 uploads
- No changes needed
- Can be kept for backward compatibility
- Or removed if migrating completely from R2

### **File 3: S3FileStorageService.java**

**Location:** `backend/src/main/java/com/debatearena/service/S3FileStorageService.java`

**Status:** Already implemented

**Key methods:**

```java
public String uploadFile(MultipartFile file, String folder) throws IOException {
    // Uploads to S3 bucket
    // Returns S3 URL
}

public void deleteFile(String key) {
    // Deletes from S3
}

public String getFileUrl(String fileName) {
    // Gets public URL for file
}
```

---

## **CONFIGURATION (Environment Variables)**

### **For S3 (AWS)**

Set these environment variables in `.env` or Beanstalk:

```env
FILE_PROVIDER=s3
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG...
AWS_S3_BUCKET=debate-arena-uploads
AWS_REGION=us-east-1
FILE_BASE_URL=https://debate-arena-uploads.s3.amazonaws.com
```

### **For R2 (Cloudflare)**

If you want to keep R2 support:

```env
FILE_PROVIDER=r2
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET=tarkvtark-uploads
R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
```

---

## **STEP-BY-STEP: MIGRATE TO S3**

### **Step 1: Update Backend Code**

The code is already updated. Just verify:

```bash
# Check FileUploadController has S3 support
grep -n "s3FileStorageService\|S3FileStorageService" backend/src/main/java/com/debatearena/controller/FileUploadController.java
```

Should show references to S3 service.

### **Step 2: Add S3 Dependencies**

Check `pom.xml` has AWS SDK:

```bash
grep -n "aws-java-sdk\|software.amazon.awssdk" backend/pom.xml
```

If not present, add:

```xml
<dependency>
    <groupId>software.amazon.awssdk</groupId>
    <artifactId>s3</artifactId>
    <version>2.20.100</version>
</dependency>
```

Then rebuild:
```bash
mvn clean install
```

### **Step 3: Configure Environment Variables**

Local development (`.env`):
```env
FILE_PROVIDER=s3
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=wJal...
AWS_S3_BUCKET=debate-arena-uploads
AWS_REGION=us-east-1
```

Production (Beanstalk):
Add same variables via AWS console (see AWS_ELASTIC_BEANSTALK_DEPLOYMENT_GUIDE.md)

### **Step 4: Build JAR**

```bash
cd backend
mvn clean package -DskipTests
```

Verify build succeeds (BUILD SUCCESS).

### **Step 5: Deploy to Beanstalk**

See AWS_ELASTIC_BEANSTALK_DEPLOYMENT_GUIDE.md for deployment steps.

### **Step 6: Test Upload**

1. Open frontend app
2. Try uploading a file
3. Check S3 console - file should appear

---

## **COMPARISON: R2 vs S3**

| Aspect | R2 | S3 |
|--------|----|----|
| **Provider** | Cloudflare | Amazon AWS |
| **Cost** | $0.015/GB | $0.023/GB |
| **SDK** | Custom | AWS SDK (standard) |
| **Ecosystem** | Limited | Extensive |
| **Scaling** | Good | Excellent |
| **Free tier** | 5GB | 5GB |
| **Current use** | Local dev | AWS deployment |

---

## **CODE STRUCTURE**

### **File Upload Flow (S3)**

```
Frontend
  ↓ (Upload file)
FileUploadController.uploadFile()
  ↓ (Detects FILE_PROVIDER=s3)
S3FileStorageService.uploadFile()
  ↓ (Uses AWS SDK)
AWS S3 Bucket
  ↓ (Returns URL)
AttachmentRepository.save()
  ↓ (Stores URL in database)
Frontend
  ↓ (Download file)
```

### **File Download Flow (S3)**

```
Frontend
  ↓ (Request file)
FileUploadController.downloadFile()
  ↓ (Lookup in database)
AttachmentRepository.findByFileName()
  ↓ (Get storage URL)
HTTP 302 Redirect
  ↓ (Redirect to S3 URL)
S3 returns file
```

---

## **BACKEND CODE SNIPPETS**

### **S3FileStorageService.java**

This service handles all S3 operations:

```java
@Service
public class S3FileStorageService {
    
    private final S3Client s3Client;
    
    @Value("${aws.s3.bucket}")
    private String bucketName;
    
    @Value("${aws.region}")
    private String region;
    
    /**
     * Upload file to S3
     */
    public String uploadFile(MultipartFile file, String folder) throws IOException {
        String fileName = generateUniqueFileName(file);
        String key = folder + "/" + fileName;
        
        // Upload to S3
        s3Client.putObject(
            PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build(),
            RequestBody.fromInputStream(file.getInputStream(), file.getSize())
        );
        
        // Return S3 URL
        return String.format("https://%s.s3.%s.amazonaws.com/%s", 
            bucketName, region, key);
    }
    
    /**
     * Delete file from S3
     */
    public void deleteFile(String key) {
        s3Client.deleteObject(
            DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build()
        );
    }
}
```

### **FileUploadController.java Changes**

```java
@PostMapping("/upload")
public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
    try {
        // Determine which storage service to use
        String storageUrl;
        
        if ("s3".equalsIgnoreCase(fileProvider)) {
            storageUrl = s3FileStorageService.uploadFile(file, "attachments");
        } else if ("r2".equalsIgnoreCase(fileProvider)) {
            storageUrl = r2FileStorageService.uploadFile(file, "attachments");
        } else {
            // Fallback to local storage
            storageUrl = localFileStorageService.uploadFile(file, "attachments");
        }
        
        // Save to database
        Attachment attachment = new Attachment();
        attachment.setStorageUrl(storageUrl);
        attachmentRepository.save(attachment);
        
        return ResponseEntity.ok("Upload successful");
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body("Upload failed: " + e.getMessage());
    }
}
```

---

## **TESTING MIGRATION**

### **Local Testing (Before Deployment)**

1. Set `FILE_PROVIDER=s3` in `.env`
2. Add AWS credentials
3. Create S3 bucket locally or use test bucket
4. Run backend: `mvn spring-boot:run`
5. Test upload via Postman or frontend
6. Verify file appears in S3

### **Production Testing (After Deployment)**

1. Deploy to Beanstalk with S3 config
2. Frontend uploads file
3. Check Beanstalk logs: no errors
4. Verify file in S3 console
5. Download file from frontend: works?

---

## **ROLLBACK TO R2 (IF NEEDED)**

If you need to go back to R2:

1. Set `FILE_PROVIDER=r2` in environment variables
2. Set R2 credentials in environment variables
3. Redeploy backend

**Note:** Existing S3 files won't be accessible with R2, but can be migrated.

---

## **MIGRATION CHECKLIST**

- [ ] Verify S3FileStorageService exists in codebase
- [ ] Verify FileUploadController has S3 support
- [ ] Add AWS SDK dependency if missing
- [ ] Set FILE_PROVIDER=s3 environment variable
- [ ] Set AWS credentials
- [ ] Build JAR: `mvn clean package`
- [ ] Deploy to Beanstalk
- [ ] Test file upload
- [ ] Verify file in S3 console
- [ ] Test file download
- [ ] Check logs for errors

---

## **IMPORTANT NOTES**

### **Existing R2 Files**

If you have files in Cloudflare R2:
- They won't automatically appear in S3
- You need to migrate them manually (if needed)
- For new uploads, use S3 going forward

### **Database Records**

Attachment records store storage URLs:
- Old R2 URLs: `https://xxx.r2.cloudflarestorage.com/...`
- New S3 URLs: `https://debate-arena-uploads.s3.amazonaws.com/...`

Both can coexist - downloads will work for both.

### **File Names**

Files are stored with unique names like:
```
attachments/attachment-1234567890-filename.jpg
```

This prevents conflicts and allows tracking.

---

## **REFERENCE**

**AWS S3 SDK Documentation:**
- https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/

**Spring Boot with AWS:**
- https://spring.io/projects/spring-cloud-aws

**Environment Variables:**
```env
FILE_PROVIDER=s3                                  # Use S3
AWS_ACCESS_KEY_ID=AKIA...                        # IAM user key
AWS_SECRET_ACCESS_KEY=wJal...                    # IAM user secret
AWS_S3_BUCKET=debate-arena-uploads               # Bucket name
AWS_REGION=us-east-1                             # AWS region
FILE_BASE_URL=https://debate-arena-uploads.s3... # Base URL
```

---

## **NEXT STEPS**

1. ✅ Code is ready for S3 (no changes needed!)
2. ✅ Build backend: `mvn clean package`
3. ✅ Deploy to Beanstalk (see deployment guide)
4. ✅ Configure S3 bucket (see S3 guide)
5. ✅ Set environment variables in Beanstalk
6. ✅ Test file upload/download
7. ⏳ Run verification tests

---

**Code Migration Guide Complete!** 🚀



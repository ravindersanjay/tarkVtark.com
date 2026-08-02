# Implementation Guide: Three-Environment Tech Stack Setup

**Document:** Step-by-step implementation of recommended architecture  
**Time Estimate:** 2-3 weeks  
**Difficulty:** Medium  
**Prerequisites:** Supabase account (free), Docker installed, basic Git knowledge

---

## Phase 1: Infrastructure Setup (Days 1-3)

### Step 1.1: Create Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. **Project Name:** debate-arena-prod
4. **Region:** Asia Pacific (Singapore) - *same as your current NeonDB*
5. **Database Password:** Generate strong password (save to password manager)
6. Click "Create New Project"
7. Wait 10-15 minutes for project to be ready
8. Once ready, go to **Settings → Database → Connection String**
9. **Copy the connection string details:**
   - Host: `db.XXXXXXXX.supabase.co`
   - Port: 5432
   - Database: postgres
   - Username: postgres
   - Password: (what you set above)

10. **Build JDBC connection string:**
    ```
    jdbc:postgresql://db.XXXXXXXX.supabase.co:5432/postgres?sslmode=require
    ```

11. **Save this information** - you'll need it later

### Step 1.2: Export Database from NeonDB

1. **Connect to NeonDB from your machine:**
   ```bash
   # Install PostgreSQL tools (if not already installed)
   # Windows: Download PostgreSQL installer, select "command line tools" only
   # macOS: brew install postgresql
   # Linux: apt-get install postgresql-client
   ```

2. **Export schema:**
   ```bash
   pg_dump -h ep-curly-queen-a1tu44g3-pooler.ap-southeast-1.aws.neon.tech \
           -U neondb_owner \
           -d neondb \
           -s \
           --no-password > schema_export.sql
   ```
   When prompted for password, use: `npg_TfMWjGuX81EY` (from .env.dev)

3. **Export data:**
   ```bash
   pg_dump -h ep-curly-queen-a1tu44g3-pooler.ap-southeast-1.aws.neon.tech \
           -U neondb_owner \
           -d neondb \
           -a \
           --no-password > data_export.sql
   ```

4. **Verify files were created:**
   ```bash
   ls -la schema_export.sql data_export.sql
   ```

### Step 1.3: Import Database to Supabase

1. **Connect to Supabase and import schema:**
   ```bash
   # Build connection string from Supabase info
   psql -h db.XXXXXXXX.supabase.co \
        -U postgres \
        -d postgres \
        -c "SELECT version();"
   ```
   When prompted, enter Supabase database password.

2. **Import schema:**
   ```bash
   psql -h db.XXXXXXXX.supabase.co \
        -U postgres \
        -d postgres \
        -f schema_export.sql
   ```

3. **Import data:**
   ```bash
   psql -h db.XXXXXXXX.supabase.co \
        -U postgres \
        -d postgres \
        -f data_export.sql
   ```

4. **Verify import was successful:**
   ```bash
   psql -h db.XXXXXXXX.supabase.co \
        -U postgres \
        -d postgres \
        -c "SELECT COUNT(*) FROM attachments;"
   ```

### Step 1.4: Create .env.test File

**Create file:** `backend/.env.test`

```properties
### Backend testing environment (.env.test)
# For integration tests with ephemeral PostgreSQL

# Database Configuration (Test PostgreSQL)
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/test_debate_arena_db
SPRING_DATASOURCE_USERNAME=testuser
SPRING_DATASOURCE_PASSWORD=testpass
SPRING_JPA_HIBERNATE_DDL_AUTO=create-drop
SPRING_JPA_DATABASE_PLATFORM=org.hibernate.dialect.PostgreSQLDialect
SPRING_PROFILES_ACTIVE=test

# Security / JWT Configuration
JWT_SECRET=TarkVtark2026SecureJWTSecretKeyForDebateArenaApplicationMinimum32Characters
JWT_EXPIRATION_MS=3600000

# Admin User Configuration
ADMIN_USERNAME=testadmin
ADMIN_PASSWORD=testpass123
ADMIN_EMAIL=test@debate.local
ADMIN_FULL_NAME=Test Administrator

# File Upload Configuration - Mock for testing
FILE_PROVIDER=local
FILE_UPLOAD_DIR=./test-uploads
FILE_MAX_SIZE=10485760

# No real credentials needed for testing
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_REGION=us-east-1

GOOGLE_CLIENT_ID=
```

### Step 1.5: Update .env.prod File

**Edit file:** `backend/.env.prod`

Replace entire contents with:
```properties
### Backend production environment (.env.prod)
# IMPORTANT: Never commit real secrets to git
# All values below MUST be overridden in deployment platform

# Database Configuration (Supabase PostgreSQL)
SPRING_DATASOURCE_URL=jdbc:postgresql://db.YOUR_PROJECT.supabase.co:5432/postgres?sslmode=require
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=REPLACE_WITH_SUPABASE_PASSWORD_AT_DEPLOYMENT
SPRING_JPA_HIBERNATE_DDL_AUTO=validate
SPRING_JPA_DATABASE_PLATFORM=org.hibernate.dialect.PostgreSQLDialect
SPRING_PROFILES_ACTIVE=prod

# Security / JWT Configuration
JWT_SECRET=REPLACE_WITH_SECURE_VALUE_AT_DEPLOYMENT
JWT_EXPIRATION_MS=86400000
BCRYPT_STRENGTH=12

# Admin User Configuration
ADMIN_USERNAME=REPLACE_WITH_SECURE_VALUE
ADMIN_PASSWORD=REPLACE_WITH_SECURE_VALUE
ADMIN_EMAIL=admin@tarkVtark.com
ADMIN_FULL_NAME=System Administrator

# File Upload Configuration - Supabase Storage
FILE_PROVIDER=supabase
FILE_BASE_URL=https://YOUR_PROJECT.supabase.co

# Supabase Configuration
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=REPLACE_WITH_SUPABASE_SERVICE_ROLE_KEY
SUPABASE_STORAGE_BUCKET=debate-arena-uploads

# These should be empty in production (using Supabase)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# Google OAuth
GOOGLE_CLIENT_ID=310921464230-tmc47j716puuupbol9fvoev1l03238pd.apps.googleusercontent.com
```

### Step 1.6: Create Spring Profile Configuration Files

**Create file:** `backend/src/main/resources/application-dev.yml`

```yaml
# Development Profile Configuration
spring:
  profiles:
    active: dev
  
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        jdbc:
          batch_size: 20
        order_inserts: true
        order_updates: true
  
  servlet:
    multipart:
      enabled: true
      max-file-size: 10MB
      max-request-size: 10MB

server:
  port: 8080
  servlet:
    context-path: /api/v1

file:
  provider: local
  upload-dir: ./uploads
  base-url: http://localhost
  max-size: 10485760

logging:
  level:
    com.debatearena: DEBUG
    org.springframework.web: DEBUG
    org.hibernate.SQL: DEBUG
```

**Create file:** `backend/src/main/resources/application-test.yml`

```yaml
# Test Profile Configuration
spring:
  profiles:
    active: test
  
  jpa:
    hibernate:
      ddl-auto: create-drop  # Fresh schema each test
    show-sql: false  # Don't log in tests (too verbose)
    properties:
      hibernate:
        format_sql: false
        jdbc:
          batch_size: 10
        order_inserts: false
        order_updates: false
  
  servlet:
    multipart:
      enabled: true
      max-file-size: 10MB
      max-request-size: 10MB

server:
  port: 8080
  servlet:
    context-path: /api/v1

file:
  provider: local  # Could be mock in future
  upload-dir: ./test-uploads
  base-url: http://localhost
  max-size: 10485760

logging:
  level:
    com.debatearena: INFO
    org.springframework.web: WARN
    org.hibernate.SQL: WARN
```

**Create file:** `backend/src/main/resources/application-prod.yml`

```yaml
# Production Profile Configuration
spring:
  profiles:
    active: prod
  
  jpa:
    hibernate:
      ddl-auto: validate  # Never modify production schema automatically
    show-sql: false  # No logging in production
    properties:
      hibernate:
        format_sql: false
        jdbc:
          batch_size: 50
        order_inserts: true
        order_updates: true
  
  servlet:
    multipart:
      enabled: true
      max-file-size: 10MB
      max-request-size: 10MB

server:
  port: 8080
  servlet:
    context-path: /api/v1

file:
  provider: supabase  # MUST be supabase in production
  max-size: 10485760

logging:
  level:
    com.debatearena: INFO
    org.springframework.web: WARN
    org.hibernate.SQL: WARN

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      show-details: when-authorized
```

---

## Phase 2: Code Updates (Days 4-7)

### Step 2.1: Create Mock FileStorageService for Testing

**Create file:** `backend/src/main/java/com/debatearena/service/MockFileStorageService.java`

```java
package com.debatearena.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * =====================================================================
 * Mock File Storage Service
 * =====================================================================
 *
 * In-memory implementation of FileStorageService for testing.
 * No actual files are stored - just metadata tracking.
 *
 * Used for: Unit tests, integration tests without real storage
 *
 * @author TarkVtark Team
 */
@Service
@ConditionalOnProperty(name = "file.provider", havingValue = "mock")
public class MockFileStorageService implements FileStorageService {

    private static final Logger logger = LoggerFactory.getLogger(MockFileStorageService.class);
    
    // In-memory file tracking for testing
    private final Map<String, byte[]> fileStore = new HashMap<>();

    @Override
    public String uploadFile(MultipartFile file, String folder) {
        try {
            String fileName = UUID.randomUUID().toString();
            String storageKey = (folder != null && !folder.isEmpty()) 
                ? folder + "/" + fileName 
                : fileName;

            // Store file in memory for test verification
            fileStore.put(storageKey, file.getBytes());

            logger.info("Mock: File uploaded - {}", storageKey);
            
            // Return storage key (same as local)
            return storageKey;
        } catch (Exception e) {
            logger.error("Mock: File upload failed", e);
            throw new RuntimeException("Mock file upload failed", e);
        }
    }

    @Override
    public void deleteFile(String fileUrl) {
        fileStore.remove(fileUrl);
        logger.info("Mock: File deleted - {}", fileUrl);
    }

    @Override
    public String getProviderName() {
        return "mock";
    }

    /**
     * Test helper: Check if file was "stored"
     */
    public boolean fileExists(String storageKey) {
        return fileStore.containsKey(storageKey);
    }

    /**
     * Test helper: Get stored file data
     */
    public byte[] getFileData(String storageKey) {
        return fileStore.get(storageKey);
    }

    /**
     * Test helper: Clear all stored files
     */
    public void clear() {
        fileStore.clear();
    }

    /**
     * Test helper: Get file count
     */
    public int getFileCount() {
        return fileStore.size();
    }
}
```

### Step 2.2: Create Storage Configuration Validator

**Create file:** `backend/src/main/java/com/debatearena/util/StorageConfigValidator.java`

```java
package com.debatearena.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

/**
 * =====================================================================
 * Storage Configuration Validator
 * =====================================================================
 *
 * Validates storage configuration on application startup.
 * Fails fast if required configuration is missing.
 *
 * @author TarkVtark Team
 */
@Component
public class StorageConfigValidator {

    private static final Logger logger = LoggerFactory.getLogger(StorageConfigValidator.class);

    @Value("${file.provider:local}")
    private String fileProvider;

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    @Value("${supabase.url:}")
    private String supabaseUrl;

    @Value("${supabase.service-role-key:}")
    private String supabaseServiceRoleKey;

    @Value("${aws.s3.bucket:}")
    private String s3Bucket;

    @Value("${aws.access-key-id:}")
    private String awsAccessKeyId;

    @PostConstruct
    public void validateStorageConfiguration() {
        logger.info("Validating storage configuration: FILE_PROVIDER={}", fileProvider);

        switch (fileProvider) {
            case "supabase":
                validateSupabaseConfig();
                break;
            case "s3":
                validateS3Config();
                break;
            case "local":
                validateLocalConfig();
                break;
            case "mock":
                logger.info("Mock storage configured - suitable for testing only");
                break;
            default:
                throw new IllegalStateException("Unknown file provider: " + fileProvider);
        }

        logger.info("✅ Storage configuration valid");
    }

    private void validateSupabaseConfig() {
        if (supabaseUrl == null || supabaseUrl.isEmpty()) {
            throw new IllegalStateException(
                "❌ SUPABASE_URL environment variable not configured. " +
                "Set: SUPABASE_URL=https://project.supabase.co"
            );
        }
        if (supabaseServiceRoleKey == null || supabaseServiceRoleKey.isEmpty()) {
            throw new IllegalStateException(
                "❌ SUPABASE_SERVICE_ROLE_KEY environment variable not configured. " +
                "Get from: Project Settings → API → Service Role (anon_key)"
            );
        }
        logger.info("✅ Supabase storage configured");
    }

    private void validateS3Config() {
        if (s3Bucket == null || s3Bucket.isEmpty()) {
            throw new IllegalStateException(
                "❌ AWS_S3_BUCKET environment variable not configured. " +
                "Set: AWS_S3_BUCKET=your-bucket-name"
            );
        }
        if (awsAccessKeyId == null || awsAccessKeyId.isEmpty()) {
            throw new IllegalStateException(
                "❌ AWS_ACCESS_KEY_ID environment variable not configured"
            );
        }
        logger.info("✅ S3 storage configured");
    }

    private void validateLocalConfig() {
        if (uploadDir == null || uploadDir.isEmpty()) {
            throw new IllegalStateException(
                "❌ FILE_UPLOAD_DIR is empty. Set: FILE_UPLOAD_DIR=./uploads"
            );
        }
        logger.info("✅ Local storage configured: {}", uploadDir);
    }
}
```

### Step 2.3: Create Storage Health Check Endpoint

**Create file:** `backend/src/main/java/com/debatearena/controller/StorageHealthController.java`

```java
package com.debatearena.controller;

import com.debatearena.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

/**
 * =====================================================================
 * Storage Health Check Controller
 * =====================================================================
 *
 * Endpoint to check storage configuration and health.
 * Useful for monitoring and debugging storage issues.
 *
 * @author TarkV tark Team
 */
@RestController
@RequestMapping("/files/health")
public class StorageHealthController {

    private static final Logger logger = LoggerFactory.getLogger(StorageHealthController.class);

    @Autowired
    private FileStorageService fileStorageService;

    /**
     * GET /api/v1/files/health
     * Check storage health and configuration
     */
    @GetMapping
    public ResponseEntity<?> checkStorageHealth() {
        try {
            String provider = fileStorageService.getProviderName();

            Map<String, Object> response = new HashMap<>();
            response.put("status", "UP");
            response.put("provider", provider);

            logger.info("Storage health check - provider: {}", provider);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Storage health check failed", e);

            Map<String, Object> error = new HashMap<>();
            error.put("status", "DOWN");
            error.put("error", e.getMessage());

            return ResponseEntity.status(503).body(error);
        }
    }
}
```

### Step 2.4: Build Backend with New Code

```bash
cd D:\temp\tarkVtark.com\backend

# Clean and compile
mvn clean compile

# If successful, run tests
mvn clean test

# Build package
mvn -DskipTests clean package
```

**Expected Output:**
```
[INFO] BUILD SUCCESS
```

---

## Phase 3: Testing & Validation (Days 8-11)

### Step 3.1: Test Local Development Setup

```bash
# 1. Start Docker Compose
cd D:\temp\tarkVtark.com
docker-compose up -d

# 2. Wait for services to be healthy
docker-compose ps
# All services should show "healthy" or "running"

# 3. Access backend
curl http://localhost:8080/api/v1/topics
# Should return JSON response

# 4. Access frontend
# Open browser: http://localhost

# 5. Test attachment upload
# Create question → upload file → verify file in ./uploads/attachments/

# 6. Stop services
docker-compose down
```

### Step 3.2: Test Supabase Configuration

1. **Create a test environment variable setup:**
   ```bash
   # Create a temporary script to test Supabase connection
   # File: test-supabase-connection.sh
   
   #!/bin/bash
   
   SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
   SUPABASE_DB_PASSWORD="your_password"
   
   # Test connection
   psql -h db.YOUR_PROJECT.supabase.co \
        -U postgres \
        -d postgres \
        -c "SELECT COUNT(*) as attachment_count FROM attachments;" \
        -W
   ```

2. **Verify Supabase connection works:**
   ```bash
   bash test-supabase-connection.sh
   ```

### Step 3.3: Update docker-compose.yml

**Edit file:** `docker-compose.yml`

Find these lines and update them:

```yaml
# Before:
environment:
  FILE_BASE_URL: http://localhost:8080

# After:
environment:
  FILE_BASE_URL: ${FILE_BASE_URL:-http://localhost:8080}
```

This allows environment variable override for testing.

---

## Phase 4: Migration to Production (Days 12-14)

### Step 4.1: Prepare Production Deployment Platform

Choose your platform and set environment variables:

#### Option A: Render.com (Recommended)

1. Go to https://dashboard.render.com
2. Create new "Web Service"
3. Connect your GitHub repository
4. Go to **Settings → Environment Variables**
5. Add these variables:

```
SPRING_DATASOURCE_URL=jdbc:postgresql://db.YOUR_PROJECT.supabase.co:5432/postgres?sslmode=require
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=YOUR_SUPABASE_PASSWORD
SPRING_PROFILES_ACTIVE=prod
FILE_PROVIDER=supabase
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
SUPABASE_STORAGE_BUCKET=debate-arena-uploads
JWT_SECRET=YOUR_SECURE_JWT_SECRET
ADMIN_PASSWORD=YOUR_SECURE_ADMIN_PASSWORD
```

6. Click **Deploy**

#### Option B: Vercel (if backend also there)

1. Go to Project → Settings → Environment Variables
2. Add same variables as above
3. Redeploy

### Step 4.2: Verify Production Deployment

```bash
# 1. Check Vercel/Render deployment logs
# Should see: "✅ Storage configuration valid"

# 2. Test production API
curl https://your-production-url/api/v1/topics

# 3. Test file upload
# Create question → upload file → check Supabase Storage bucket

# 4. Monitor for errors
# Check error logs in deployment platform dashboard
```

### Step 4.3: Data Validation

1. **Compare row counts:**
   ```bash
   # Count in NeonDB
   psql -h ep-curly-queen-a1tu44g3... \
        -U neondb_owner \
        -d neondb \
        -c "SELECT COUNT(*) as total_questions FROM questions;"
   
   # Count in Supabase
   psql -h db.YOUR_PROJECT.supabase.co \
        -U postgres \
        -d postgres \
        -c "SELECT COUNT(*) as total_questions FROM questions;"
   ```

2. **Verify attachments URLs:**
   - Check that storageUrl column values are correct
   - For old data: might still have "attachments/uuid.jpg" format
   - For new uploads: should be full Supabase URLs

3. **Test file access:**
   - Upload new file in production
   - Click download link
   - File should serve from Supabase CDN

### Step 4.4: Cleanup

```bash
# After 1-2 weeks of successful production operation:

# 1. Cancel NeonDB subscription
#    Go to https://console.neon.tech
#    Project settings → Delete project

# 2. Archive database exports
#    Save to secure backup location (encrypted)

# 3. Document final architecture
#    Update README with new setup

# 4. Notify team
#    New connection details (if team has direct DB access)
#    Backup location for exports
#    Disaster recovery runbook
```

---

## Deployment Platform Guides

### Render.com Deployment

**Use this render.yaml:**

```yaml
services:
  - type: web
    name: debate-arena-backend
    env: docker
    repo: https://github.com/YOUR_REPO
    autoDeploy: true
    dockerfile: backend/Dockerfile
    envVars:
      - key: SPRING_DATASOURCE_URL
        scope: run
        value: jdbc:postgresql://db.YOUR_PROJECT.supabase.co:5432/postgres?sslmode=require
      - key: SPRING_PROFILES_ACTIVE
        value: prod
      - key: FILE_PROVIDER
        value: supabase
    # Add more env vars as needed

healthCheckPath: /api/v1/topics
healthCheckInterval: 30
```

### Vercel Deployment

1. Connect project
2. Framework: Other (Spring Boot)
3. Build command: `cd backend && mvn clean package`
4. Publish directory: `backend/target/debate-backend-1.0.0.jar`
5. Install command: (leave empty)
6. Add environment variables in project settings
7. Deploy

---

## Troubleshooting

### Issue: "Connection refused" to Supabase

**Solution:**
1. Verify SPRING_DATASOURCE_URL is correct
2. Verify Supabase IP is whitelisted (Supabase: Settings → Database → Add IP)
3. Test locally: `psql -h db.YOUR_PROJECT.supabase.co -U postgres`

### Issue: "Storage configuration invalid"

**Solution:**
1. Check environment variables are set correctly
2. For Supabase: Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
3. Check logs for exact error message

### Issue: Files uploading but not found

**Solution:**
1. Verify FILE_PROVIDER is set to "supabase" in production
2. Check Supabase Storage bucket exists
3. Verify service role key has upload permissions

### Issue: Slow database queries

**Solution:**
1. This is normal when migrating from NeonDB (different hardware)
2. Supabase has good defaults
3. If still slow, check Supabase Query Performance dashboard

---

## Validation Checklist

Before considering migration complete:

```
Development Environment:
├─ [ ] Local PostgreSQL starts via docker-compose
├─ [ ] Backend connects to local PostgreSQL
├─ [ ] Can upload files to ./uploads/attachments/
├─ [ ] Can download files via http://localhost:8080/api/v1/files/...
├─ [ ] Test profile works: mvn -Dspring.profiles.active=test test
└─ [ ] All dependencies resolved without errors

Testing Environment:
├─ [ ] .env.test created with correct values
├─ [ ] application-test.yml created
├─ [ ] MockFileStorageService compiles
├─ [ ] StorageConfigValidator compiles
├─ [ ] Integration tests run without production data
└─ [ ] Test database is ephemeral (fresh each run)

Production Setup:
├─ [ ] Supabase project created
├─ [ ] Database imported from NeonDB
├─ [ ] Data row counts match between NeonDB and Supabase
├─ [ ] .env.prod has placeholder values
├─ [ ] Environment variables set in deployment platform
├─ [ ] Backend deployed and running
├─ [ ] Attachment upload works in production
├─ [ ] Files served from Supabase CDN
├─ [ ] Monitoring shows stable performance
└─ [ ] Team trained on new setup

Final Cleanup:
├─ [ ] NeonDB data exported and archived
├─ [ ] NeonDB subscription cancelled
├─ [ ] Documentation updated with new architecture
├─ [ ] Disaster recovery runbook created
├─ [ ] Team contacts updated
└─ [ ] One final full backup taken
```

---

## Support & Resources

### Documentation Links
- https://supabase.com/docs/guides/database
- https://supabase.com/docs/guides/storage
- https://spring.io/projects/spring-boot

### Getting Help
1. Check TECH_STACK_COMPREHENSIVE_ANALYSIS.md for architecture overview
2. Check Supabase documentation for storage API
3. Check Spring Boot profiles documentation

### Rollback Plan (If Issues)

If something goes wrong:

1. **Keep production running on NeonDB temporarily**
2. **Identify the issue** (check logs)
3. **Fix in local environment first**
4. **Re-test everything locally**
5. **Deploy once confident**

---

**Document Version:** 1.0  
**Last Updated:** July 4, 2026  
**Status:** Ready for Implementation


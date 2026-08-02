# Tech Stack Analysis: Development, Testing & Production

**Date:** July 4, 2026  
**Project:** TarkVtark Debate Arena  
**Status:** Comprehensive Architecture Review

---

## Executive Summary

✅ **Good News:** Your project already has a well-designed abstraction layer for file storage (FileStorageService), which is a best practice.

⚠️ **Current Situation:**
- **Development:** NeonDB (cloud-hosted) + Local filesystem for attachments
- **Testing:** Unclear/undocumented
- **Production:** Undefined strategy (placeholder configs)

🎯 **Recommendation:** Implement a three-tier strategy with Supabase for production, keep NeonDB for dev (but consider local PostgreSQL), and use standardized environments for testing.

---

## Part 1: Current Tech Stack Analysis

### 1.1 Database Architecture

#### Development Environment
```
Current Setup:
├── NeonDB (Cloud PostgreSQL)
│   ├── URL: ep-curly-queen-a1tu44g3-pooler.ap-southeast-1.aws.neon.tech:5432
│   ├── Database: neondb
│   ├── Schema Management: Hibernate (ddl-auto: validate)
│   └── Location: AWS Singapore Region
│
└── Issues:
    ├── ❌ Cloud dependency for local development
    ├── ❌ Network latency for local testing
    ├── ❌ Credentials exposed in .env.dev (SECURITY ISSUE!)
    ├── ❌ Difficult to reset schema during development
    └── ❌ Cannot work offline
```

**Problems Identified:**
1. **Credentials in dev .env:** Your database credentials are hardcoded in `.env.dev` (visible in repo)
2. **Cloud dependency:** Can't develop without internet
3. **Schema management:** Hibernate `validate` mode means schema changes require manual DB updates
4. **No test isolation:** Each test run affects the same cloud database

#### Testing Environment
```
Current Setup: ❌ NOT CONFIGURED
- No separate test database defined
- No test configuration in docker-compose.yml
- No .env.test with isolated database
- Integration tests likely fail or use dev database
```

#### Production Environment
```
Current Setup: ❌ INCOMPLETE
- File provider: Still set to "local" (placeholder)
- Database: NeonDB (same as dev - NOT RECOMMENDED)
- S3 credentials: Empty placeholders
- No Supabase configuration

Issues:
├── ❌ Production sharing dev database
├── ❌ File storage undefined (local disk not scalable)
├── ❌ No S3/Supabase credentials configured
└── ❌ No backup/disaster recovery plan
```

### 1.2 File Storage Architecture

#### Storage Service Abstraction (✅ EXCELLENT)
```
Already Implemented:
┌─ FileStorageService Interface ◄─── Clean abstraction!
│
├─ LocalFileStorageService (Development)
│   ├── Files: ./uploads/attachments/
│   ├── Access: http://localhost:8080/api/v1/files/key/...
│   └── Database: Stores storageUrl as relative path
│
├─ S3FileStorageService (Production option)
│   ├── Bucket: debate-arena-uploads
│   ├── Region: us-east-1
│   └── Access: Full S3 URLs stored in DB
│
├─ R2FileStorageService (Production option)
│   ├── Provider: Cloudflare R2
│   └── Access: Full R2 URLs stored in DB
│
└─ SupabaseFileStorageService (Your planned production)
    ├── Provider: Supabase Storage
    ├── Auth: Service role key (server-side only)
    └── Access: Full public URLs or signed URLs
```

#### Current File Storage Locations

```
Development:
├── Local filesystem: ./uploads/attachments/
├── Metadata database: NeonDB (Attachment table)
│   └── Column: storageUrl = relative path "attachments/uuid.jpg"
└── Access URL:
    ├── Built via: FileUrlUtil component
    ├── Format: http://localhost:8080/api/v1/files/key/attachments/uuid.jpg
    └── Served by: FileUploadController
        └── Serves actual file from ./uploads/attachments/

Testing:
├── ❌ Configuration: MISSING
├── Likely: Reuses development setup
└── Problem: No test data isolation

Production (Planned with Supabase):
├── Supabase Storage bucket
├── Metadata database: Supabase PostgreSQL
│   └── Column: storageUrl = full public URL from Supabase
└── Access URL:
    ├── Format: https://<project>.supabase.co/storage/v1/object/public/bucket/path...
    └── Served by: Supabase CDN (direct, no backend)
```

#### Docker Compose Setup (Current)

```yaml
database service:
  - Uses local PostgreSQL 15-alpine
  - NOT NeonDB (only for local development override)
  - Volume: postgres_data (persistent)
  - Network: tarkvtark-network

backend service:
  - DATABASE_URL points to local "database" service
  - FILE_BASE_URL: http://localhost:8080
  - FILE_PROVIDER: defaults to local
  - Volumes: backend_uploads (persistent)

frontend service:
  - Builds with VITE_API_BASE_URL
  - Serves from localhost (port 80)

Issue: docker-compose.yml uses LOCAL PostgreSQL, not NeonDB!
This means dev environment has TWO different DB setups:
  1. Manual dev: Uses NeonDB from .env.dev
  2. Docker dev: Uses PostgreSQL in docker-compose.yml
```

---

## Part 2: Recommended Architecture

### 2.1 Three-Environment Strategy

#### DEVELOPMENT Environment
```
Recommendation: Local PostgreSQL + Local File Storage

Database:
├── Docker PostgreSQL (docker-compose.yml) ✅
├── Container: postgres:15-alpine
├── Location: localhost:5432
├── Volume: postgres_data (persistent across restarts)
├── Init scripts: Auto-import from database/schema.sql
└── Benefits:
    ├── No cloud dependency
    ├── Fast (local network)
    ├── Can work offline
    ├── Easy to reset
    └── Matches production schema closely

File Storage:
├── ./uploads/attachments/ (local filesystem) ✅
├── Access: FileUploadController serves files
├── Metadata: Stored in local PostgreSQL
└── Benefits:
    ├── Fast development cycle
    ├── No credentials management
    └── Easy to test file handling

Environment & Credentials:
├── .env.dev (local development):
│   ├── SPRING_DATASOURCE_URL: jdbc:postgresql://localhost:5432/debate_arena_db
│   ├── POSTGRES_USER: postgres
│   ├── POSTGRES_PASSWORD: postgres
│   ├── FILE_PROVIDER: local
│   └── SERVER_PORT: 8080
│
└── Git: ✅ Checked in (.env.dev allows defaults, no real credentials)

Configuration Structure:
development/
├── database/
│   ├── schema.sql (exported from prod schema)
│   └── initial-data.sql
├── docker-compose-dev.yml (new - uses local PostgreSQL)
├── .env.dev (no secrets, defaults only)
└── backend config:
    └── application-dev.yml
        └── spring.profiles.active: dev
            └── File provider: local
```

#### TESTING Environment
```
Recommendation: Ephemeral PostgreSQL + Mock/Test Storage

Database:
├── Test-specific PostgreSQL container
├── Volume: ephemeral (not persistent - fresh for each test run)
├── Init scripts: Fresh schema + test data
├── Testcontainers library: For integration tests
└── Cleanup: Container removed after tests

File Storage:
├── Mock in-memory storage OR embedded filesystem
├── OR local ./test-uploads/ (ephemeral)
├── NO cloud dependencies
└── Benefits:
    ├── Fast test execution
    ├── Complete isolation
    ├── Deterministic results
    └── Can run parallel tests

Environment & Credentials:
├── .env.test (test environment):
│   ├── SPRING_DATASOURCE_URL: jdbc:postgresql://testdb:5432/test_debate_arena
│   ├── POSTGRES_USER: testuser
│   ├── POSTGRES_PASSWORD: testpass
│   ├── FILE_PROVIDER: mock (OR local with ephemeral storage)
│   └── SPRING_PROFILES_ACTIVE: test
│
└── Git: ✅ Checked in (safe defaults, can use docker image)

Testing Strategy:
├── Unit tests: Mock FileStorageService
├── Integration tests: Testcontainers PostgreSQL + ephemeral storage
├── End-to-end tests: Docker Compose override with test services
└── Test Coverage:
    ├── Database: Schema validation, relationships
    ├── File Upload: Flow without actual S3/Supabase
    └── Error scenarios: Network failures, permission errors

Spring Test Profile:
application-test.yml:
  spring:
    datasource:
      url: jdbc:postgresql://localhost:5432/test_debate_arena
    jpa:
      hibernate:
        ddl-auto: create-drop  # Fresh schema each test
  file:
    provider: mock
    upload-dir: ./test-uploads
```

#### PRODUCTION Environment
```
Recommendation: Supabase PostgreSQL + Supabase Storage

Database:
├── Supabase PostgreSQL (Managed)
├── Region: See your use-case (currently: AWS Singapore?)
├── Auto backups: Supabase default (7-day retention)
├── PostgREST API: Available for direct DB queries if needed
├── Advantages:
│   ├── Managed service (no admin overhead)
│   ├── Built-in backups, replication
│   ├── Row-level security (RLS) opportunity
│   ├── Vector search ready (pgvector extension)
│   └── Easy scaling
│
└── Credentials:
    ├── SPRING_DATASOURCE_URL: jdbc:postgresql://db.<project>.supabase.co:5432/postgres?sslmode=require
    ├── SPRING_DATASOURCE_USERNAME: postgres
    ├── SPRING_DATASOURCE_PASSWORD: <strong-password-from-supabase>
    ├── Git: ❌ NEVER in repository
    └── Deployment: Set via CI/CD secrets (GitHub, GitLab, Vercel, Render, etc.)

File Storage:
├── Supabase Storage (Managed)
├── Bucket: debate-arena-uploads (public)
├── Auth:
│   ├── Server-side: Use SUPABASE_SERVICE_ROLE_KEY
│   ├── uploads: POST /storage/v1/object/{bucket}
│   ├── downloads: Signed URLs (optional for private access)
│   └── deletes: DELETE with service role
│
├── Advantages:
│   ├── Same provider as database (single vendor)
│   ├── CDN-backed (global distribution)
│   ├── RLS-compatible (control who can access files)
│   ├── Automatic cleanup policies
│   └── Integrated with database (can link file refs)
│
└── Stored in Attachment table:
    ├── storageUrl: Full URL "https://<project>.supabase.co/storage/v1/object/public/..."
    ├── storageProvider: "supabase"
    └── No local server file serving (direct to CDN)

Environment & Credentials:
├── GitHub Secrets / GitLab CI Variables / Render Env Vars:
│   ├── SPRING_DATASOURCE_URL: jdbc:postgresql://...
│   ├── SPRING_DATASOURCE_USERNAME: postgres
│   ├── SPRING_DATASOURCE_PASSWORD: <secret>
│   ├── SUPABASE_URL: https://<project>.supabase.co
│   ├── SUPABASE_SERVICE_ROLE_KEY: <secret>
│   ├── SUPABASE_STORAGE_BUCKET: debate-arena-uploads
│   └── FILE_PROVIDER: supabase
│
└── Git: ❌ NEVER checked in

Production Deployment:
├── Container: Backend (Spring Boot)
├── Orchestration: Vercel, Render, AWS ECS, GCP Cloud Run, etc.
├── Database: Supabase (external, no container)
├── Storage: Supabase (external, no container)
├── Frontend: Vercel (you mentioned already deployed)
└── No local "uploads" volume needed! (Files in Supabase CDN)

Scaling Considerations:
├── Database: Supabase handles scaling
├── Files: Stored in S3 behind Supabase (scales automatically)
├── API: Your backend container can scale horizontally
│   └── No shared "uploads/" volume between instances!
│   └── All file ops go to Supabase (stateless design)
│
└── High Availability:
    ├── Multiple backend replicas (load balanced)
    ├── Supabase database replicas (optional paid tier)
    └── All state external (database + storage)
```

---

## Part 3: Database Migration Strategy

### 3.1 Question: Should You Migrate NeonDB → Supabase?

#### Answer: YES, with this strategy:

**Step 1: Keep NeonDB for Now (Transition Phase)**
```
Current state:
├── Development: Use local PostgreSQL (recommended above)
├── Production: Set up empty Supabase database
└── NeonDB: Keep as backup until migration complete

Reason:
├── Zero downtime migration
├── Can test Supabase before cutover
├── Easy rollback if issues
└── Gradual data validation
```

**Step 2: Export from NeonDB → Supabase (One-Time)**
```
Process:
1. Export schema from NeonDB:
   pg_dump -s -U neondb_owner -h ep-curly-queen... > schema.sql

2. Export data from NeonDB:
   pg_dump -a -U neondb_owner -h ep-curly-queen... > data.sql

3. Import to Supabase:
   psql -U postgres -h db.<project>.supabase.co < schema.sql
   psql -U postgres -h db.<project>.supabase.co < data.sql

4. Validate data integrity in Supabase

5. Switch backend connection:
   Update environment variables
   Redeploy backend
   Monitor for errors

6. Keep NeonDB as backup for 2 weeks

7. Cancel NeonDB subscription
```

**Cost Comparison:**
```
NeonDB:
├── Cost: ~$14/month (free tier often sufficient)
├── Problem: Costs even when not in use

Supabase:
├── Cost: Free tier (good for starting)
│   ├── Database: 500MB
│   ├── Storage: 1GB
│   ├── Auth: 50,000 monthly users
│   └── Perfect for debate arena use case!
│
├── Paid tier: $25/month (when you grow)
│   ├── Database: 8GB
│   ├── Storage: 100GB
│   └── More features
│
└── Advantage: Pay-as-you-go (unlike NeonDB)
```

### 3.2 Schema Compatibility

```
Good news: PostgreSQL is PostgreSQL!

Your current schema works on:
├── NeonDB ✅
├── Supabase ✅
├── Local PostgreSQL ✅
├── AWS RDS PostgreSQL ✅

No code changes needed!

Just change:
├── SPRING_DATASOURCE_URL (connection string)
├── SPRING_DATASOURCE_USERNAME
├── SPRING_DATASOURCE_PASSWORD
└── Everything else: identical

Hibernate will validate schema matches on startup.
If mismatch: ddl-auto: validate will throw error (good for catching issues).
```

---

## Part 4: Storage Service Layer Architecture

### 4.1 Current Status: Already Implemented! ✅

Your code structure:
```
✅ FileStorageService (interface)
   ├─ Abstraction: Controllers never know which storage is used
   ├─ @Autowired FileStorageService → Spring auto-selects implementation
   ├─ Configured via: file.provider = {local|s3|r2|supabase}
   └─ Perfect!

Implementations:
├─ ✅ LocalFileStorageService (@ConditionalOnProperty: local)
├─ ✅ S3FileStorageService (@ConditionalOnProperty: s3)
├─ ✅ R2FileStorageService (@ConditionalOnProperty: r2)
└─ ✅ SupabaseFileStorageService (@ConditionalOnProperty: supabase)

Controllers:
├─ FileUploadController uses FileStorageService
├─ Never hardcodes storage type
├─ Works seamlessly across all providers
└─ ✅ This is an excellent design!
```

### 4.2 Recommended Enhancements to Storage Layer

#### Enhancement 1: Add Configuration Validation Component

```java
// NEW: backend/src/main/java/com/debatearena/util/FileStorageConfigValidator.java

@Component
public class FileStorageConfigValidator {
    
    @PostConstruct
    public void validateConfig() {
        String provider = fileProvider; // injected
        
        switch(provider) {
            case "supabase":
                validateSupabaseConfig();
                break;
            case "s3":
                validateS3Config();
                break;
            case "r2":
                validateR2Config();
                break;
            case "local":
                validateLocalConfig();
                break;
        }
    }
    
    private void validateSupabaseConfig() {
        if (supabaseUrl == null || supabaseUrl.isEmpty()) {
            throw new IllegalStateException("SUPABASE_URL not configured");
        }
        if (supabaseServiceRoleKey == null || supabaseServiceRoleKey.isEmpty()) {
            throw new IllegalStateException("SUPABASE_SERVICE_ROLE_KEY not configured");
        }
        // Test connection
    }
    
    // Similar for S3, R2, local...
}
```

**Benefit:** Application fails to start if storage is misconfigured (catch issues early).

#### Enhancement 2: Add Storage Health Check

```java
// NEW: Storage Health Check Endpoint

@RestController
@RequestMapping("/api/v1/health")
public class HealthCheckController {
    
    @Autowired
    private FileStorageService storageService;
    
    @GetMapping("/storage")
    public ResponseEntity<?> checkStorage() {
        try {
            // Try to list files or test connection
            String result = storageService.getProviderName();
            return ResponseEntity.ok(Map.of(
                "status", "UP",
                "provider", result
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "status", "DOWN",
                "error", e.getMessage()
            ));
        }
    }
}
```

#### Enhancement 3: Add File Statistics Service

```java
// NEW: File Statistics Service

@Component
public class FileStatisticsService {
    
    @Autowired
    private AttachmentRepository attachmentRepository;
    
    public FileStorageStats getStats() {
        long totalSize = attachmentRepository.sumFileSizes();
        long totalFiles = attachmentRepository.count();
        Map<String, Long> byProvider = 
            attachmentRepository.groupByProvider();
        
        return new FileStorageStats(totalSize, totalFiles, byProvider);
    }
}
```

**Benefit:** Monitor storage usage by provider, plan capacity.

---

## Part 5: Environment Configuration Strategy

### 5.1 Environment Configuration Files

#### Development (.env.dev)
```properties
# Change NeonDB → Local PostgreSQL
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/debate_arena_db
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres
SPRING_PROFILES_ACTIVE=dev

# File Storage: Local
FILE_PROVIDER=local
FILE_UPLOAD_DIR=./uploads
FILE_BASE_URL=http://localhost
SERVER_PORT=8080

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=123001

# JWT
JWT_SECRET=TarkVtark2026SecureJWTSecretKeyForDebateArenaApplicationMinimum32Characters
JWT_EXPIRATION_MS=86400000

# Optional: Feature flags for dev
VITE_ENABLE_DEBUG_LOGS=true
```

#### Testing (.env.test) - New File
```properties
# Test Database: Local PostgreSQL
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/test_debate_arena_db
SPRING_DATASOURCE_USERNAME=testuser
SPRING_DATASOURCE_PASSWORD=testpass
SPRING_PROFILES_ACTIVE=test

# File Storage: Mock (no actual files)
FILE_PROVIDER=mock
FILE_UPLOAD_DIR=./test-uploads-ephemeral

# Admin for tests
ADMIN_USERNAME=testadmin
ADMIN_PASSWORD=testpass123

# JWT - shorter expiration for tests
JWT_SECRET=TarkVtark2026SecureJWTSecretKeyForDebateArenaApplicationMinimum32Characters
JWT_EXPIRATION_MS=3600000  # 1 hour
```

#### Production (.env.prod) - Updated
```properties
# Production Database: Supabase
SPRING_DATASOURCE_URL=jdbc:postgresql://db.PROJECT.supabase.co:5432/postgres?sslmode=require
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=REPLACED_AT_DEPLOYMENT_TIME
SPRING_PROFILES_ACTIVE=prod

# File Storage: Supabase
FILE_PROVIDER=supabase
SUPABASE_URL=https://PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=REPLACED_AT_DEPLOYMENT_TIME
SUPABASE_STORAGE_BUCKET=debate-arena-uploads
FILE_BASE_URL=https://PROJECT.supabase.co

# Admin - use secure values in deployment
ADMIN_USERNAME=REPLACED_AT_DEPLOYMENT_TIME
ADMIN_PASSWORD=REPLACED_AT_DEPLOYMENT_TIME

# JWT - secure secret from deployment
JWT_SECRET=REPLACED_AT_DEPLOYMENT_TIME
JWT_EXPIRATION_MS=86400000

# No local uploads directory for production!
# Files served from Supabase CDN
```

### 5.2 Spring Profiles Configuration

Create three profile-specific config files:

#### application-dev.yml (new)
```yaml
spring:
  profiles:
    active: dev
  jpa:
    hibernate:
      ddl-auto: validate  # assume schema exists
    show-sql: true  # show queries for debugging
  
file:
  provider: local
  upload-dir: ./uploads
  base-url: http://localhost
```

#### application-test.yml (new)
```yaml
spring:
  profiles:
    active: test
  jpa:
    hibernate:
      ddl-auto: create-drop  # fresh schema each test
    show-sql: false  # don't log in tests
  
file:
  provider: mock  # or local with ephemeral
  upload-dir: ./test-uploads
```

#### application-prod.yml (new)
```yaml
spring:
  profiles:
    active: prod
  jpa:
    hibernate:
      ddl-auto: validate  # never modify prod schema
    show-sql: false  # don't log in prod
  
file:
  provider: supabase  # must be supabase in prod
  base-url: https://PROJECT.supabase.co
```

---

## Part 6: Docker Compose Update Strategy

### 6.1 Current docker-compose.yml Issues

✅ **Good points:**
- Uses local PostgreSQL (better than cloud for docker dev)
- Has volume persistence
- Proper healthchecks
- Network isolation

❌ **Problems:**
- Backend FILE_BASE_URL hardcoded to http://localhost:8080
- No environment override option
- No test configuration

### 6.2 Updated docker-compose.yml

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  database:
    image: postgres:15-alpine
    container_name: tarkvtark-db-dev
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-debate_arena_db}
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
    ports:
      - "${DB_PORT:-5432}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - tarkvtark-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend (Spring Boot)
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: tarkvtark-backend
    restart: unless-stopped
    depends_on:
      database:
        condition: service_healthy
    environment:
      SPRING_DATASOURCE_URL: ${SPRING_DATASOURCE_URL:-jdbc:postgresql://database:5432/debate_arena_db}
      SPRING_DATASOURCE_USERNAME: ${SPRING_DATASOURCE_USERNAME:-postgres}
      SPRING_DATASOURCE_PASSWORD: ${SPRING_DATASOURCE_PASSWORD:-postgres}
      SPRING_PROFILES_ACTIVE: ${SPRING_PROFILES_ACTIVE:-dev}
      JWT_SECRET: ${JWT_SECRET:-TarkVtark2026SecureJWTSecretKeyForDebateArenaApplicationMinimum32Characters}
      JWT_EXPIRATION_MS: ${JWT_EXPIRATION_MS:-86400000}
      ADMIN_USERNAME: ${ADMIN_USERNAME:-admin}
      ADMIN_PASSWORD: ${ADMIN_PASSWORD:-Admin@2026}
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID:-}
      SERVER_PORT: 8080
      FILE_BASE_URL: ${FILE_BASE_URL:-http://localhost:8080}
      FILE_PROVIDER: ${FILE_PROVIDER:-local}
      FILE_UPLOAD_DIR: ${FILE_UPLOAD_DIR:-/app/uploads}
    ports:
      - "8080:8080"
    volumes:
      - backend_uploads:/app/uploads
    networks:
      - tarkvtark-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8080/api/v1/topics"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Frontend (React + Nginx)
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        VITE_API_BASE_URL: ${VITE_API_BASE_URL:-http://localhost:8080/api/v1}
        VITE_GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID:-}
    container_name: tarkvtark-frontend
    restart: unless-stopped
    depends_on:
      - backend
    ports:
      - "${FRONTEND_PORT:-80}:80"
    networks:
      - tarkvtark-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 3s
      retries: 3

networks:
  tarkvtark-network:
    driver: bridge

volumes:
  postgres_data:
    driver: local
  backend_uploads:
    driver: local
```

**Usage:**
```bash
# Development (local PostgreSQL, local files)
docker-compose up -d

# Testing (if you add test service)
docker-compose -f docker-compose.test.yml up -d

# Simulation of Supabase config (for testing Supabase code locally)
FILE_PROVIDER=supabase \
SUPABASE_URL=https://... \
SUPABASE_SERVICE_ROLE_KEY=... \
docker-compose up -d
```

---

## Part 7: Implementation Roadmap

### Phase 1: Setup (Week 1)
```
Week 1: Prepare infrastructure
├─ [ ] Create Supabase project (free tier)
├─ [ ] Export NeonDB schema
├─ [ ] Import to Supabase
├─ [ ] Create .env.test and application-test.yml
├─ [ ] Create FileStorageConfigValidator component
├─ [ ] Create application-dev.yml and application-prod.yml
└─ [ ] Update docker-compose.yml with environment variables
```

### Phase 2: Code Updates (Week 2)
```
Week 2: Update backend code
├─ [ ] Add mock FileStorageService for testing
├─ [ ] Add storage health check endpoint
├─ [ ] Add file statistics service
├─ [ ] Configure Spring profiles per environment
├─ [ ] Update .env files with final values
├─ [ ] Test all configurations locally
└─ [ ] Document environment-specific configuration
```

### Phase 3: Testing (Week 3)
```
Week 3: Validate all environments
├─ [ ] Local dev: Test with local PostgreSQL + local files
├─ [ ] Local dev: Test with docker-compose
├─ [ ] Test: Run integration tests with test database
├─ [ ] Staging sim: Test Supabase config locally
├─ [ ] Production: Migrate real data from NeonDB → Supabase
└─ [ ] Production: Deploy backend with Supabase config
```

### Phase 4: Migration (Week 4)
```
Week 4: Go live with Supabase
├─ [ ] Final data validation in Supabase
├─ [ ] Switch backend to Supabase connection string
├─ [ ] Monitor production for 1 week
├─ [ ] Cancel NeonDB subscription (keep for 1 more week as backup)
├─ [ ] Archive NeonDB export for records
└─ [ ] Document final architecture
```

---

## Part 8: Security Considerations

### 8.1 Credentials Management

❌ **Current Issues:**
1. Database credentials in .env.dev (visible in git if tracked)
2. No secret rotation plan
3. Single admin password for all environments

✅ **Recommended Approach:**

```
Development (.env.dev):
├─ Safe to commit: Uses localhost + default credentials
├─ No sensitive data
├─ Anyone can run locally

Testing (.env.test):
├─ Safe to commit: Uses test credentials
├─ No real data
├─ Ephemeral resources

Production (.env.prod):
├─ ❌ NEVER commit to git
├─ Use deployment platform secrets:
│   ├─ GitHub: Settings → Secrets → Actions
│   ├─ GitLab: CI/CD → Variables
│   ├─ Render: Dashboard → Environment
│   ├─ Vercel: Project → Settings → Environment Variables
│   └─ Docker: Use secret management service
│
├─ Rotation schedule:
│   ├─ Database passwords: Every 90 days
│   ├─ JWT secret: Every 180 days
│   ├─ Service role keys: Every 30 days after issue
│   └─ Admin password: After each personnel change
```

### 8.2 Access Control

**Database:**
```
Development: 
└─ Anyone on team can access (local machine)

Production Supabase:
├─ Database password: Only DevOps/Admin
├─ Service role key: Only backend (never in frontend)
├─ Anon key: Only frontend (read-only where possible)
└─ Row-level security: Consider for multi-tenant data
```

**File Storage:**
```
Development:
└─ Local filesystem (owner read+write)

Production Supabase:
├─ Service role: Backend uploads/deletes
├─ Public bucket: Frontend reads (via CDN)
├─ Optional: Signed URLs for private files
└─ Automatic cleanup: Delete old files after 90 days
```

---

## Part 9: Cost Analysis

### 9.1 Annual Costs Comparison

#### Option A: Current (NeonDB + Local Files)
```
NeonDB: $168/year (or ~free tier if small enough)
Local Storage: $0 (but costs scaling)
Total: ~$168-300/year

Issues:
├─ Not scalable (single server uploads)
├─ No backup service
├─ No CDN
└─ Manual disaster recovery
```

#### Option B: Recommended (Supabase + Supabase Storage)
```
Supabase Free Tier (first 1-2 years):
├─ Database: 500MB (usually sufficient)
├─ Storage: 1GB (good for attachments)
├─ Auth: 50K users
└─ Total: $0/year

When you outgrow (estimated year 3):
├─ Supabase Pro: $25/month = $300/year
├─ Database: 8GB
├─ Storage: 100GB
└─ Total: $300/year (scales linearly with size)

Full breakdown:
├─ Database: $0-25/month (managed, no admin cost)
├─ Storage: Included
├─ CDN: Included (Supabase uses Cloudflare)
├─ Backups: Included (7-day retention, daily)
├─ SSL/TLS: Included
├─ API: Included (PostgREST if needed)
└─ Total: $0-300/year (vs. building yourself = $5000+)

Advantages:
├─ No DevOps overhead
├─ Automatic scaling
├─ Built-in backups
├─ Global CDN
├─ Zero cold-start migration (PostgreSQL compatible)
└─ Perfect for debate arena scale
```

#### Option C: Alternative (AWS RDS + S3)
```
AWS RDS PostgreSQL:
├─ db.t3.small: $60/month = $720/year
├─ Multi-AZ: +100%
├─ Backups: +$30/month
└─ Total: ~$1,020/year (plus you manage it)

AWS S3:
├─ Storage: $0.023/GB/month = ~$11/month = $132/year (1GB)
├─ Requests: +$0.0004 per PUT (uploads)
├─ Bandwidth: +$0.09/GB out (downloads)
└─ Total: ~$200/year

Combined: $1,200+/year with significant DevOps overhead

Why not recommended:
├─ Much more expensive
├─ Requires DevOps expertise
├─ Complexity (must manage VPC, security groups, etc.)
└─ For debate arena scale: Supabase is better
```

### 9.2 Recommendation
**Use Supabase:** Best value, managed service, perfect scale-up path.

---

## Part 10: Final Strategy Summary

### 10.1 Quick Reference Table

| Aspect | Development | Testing | Production |
|--------|-------------|---------|-----------|
| **Database** | Local PostgreSQL | Local PostgreSQL (ephemeral) | Supabase PostgreSQL |
| **File Storage** | Local filesystem | Mock/ephemeral | Supabase Storage |
| **Configuration** | .env.dev | .env.test | CI/CD Secrets |
| **Spring Profile** | dev | test | prod |
| **Upload Dir** | ./uploads | ./test-uploads | N/A (Supabase) |
| **File Provider** | local | mock | supabase |
| **Cost** | $0 | $0 | $0-25/month |
| **Scalability** | N/A | N/A | Auto-scales |
| **Backup** | Manual | N/A | Automatic |
| **Access** | localhost | localhost | https://subdomain.supabase.co |

### 10.2 What Goes Where (Attachment Storage)

```
Development:
┌─ Create question/reply
│  └─ Upload attachment
│     ├─ File saved: ./uploads/attachments/uuid.jpg
│     ├─ Metadata: NeonDB → NO! Should be local PostgreSQL
│     ├─ storageUrl: relative path "attachments/uuid.jpg"
│     └─ Access: http://localhost:8080/api/v1/files/key/attachments/uuid.jpg
│

Testing:
├─ Mock: No files (in-memory)
└─ Or ephemeral: ./test-uploads/attachments/uuid.jpg (deleted after test)
│

Production:
├─ File uploaded
│  ├─ Sent to: Supabase Storage
│  ├─ Stored in: debate-arena-uploads bucket
│  ├─ Path: attachments/uuid.jpg
│  ├─ Metadata: Supabase PostgreSQL
│  ├─ storageUrl: https://project.supabase.co/storage/v1/object/public/debate-arena-uploads/attachments/uuid.jpg
│  └─ Access: Direct from CDN (no slower backend hop)
```

### 10.3 Migration Checklist

Before you switch from NeonDB to Supabase:

```
Pre-Migration:
├─ [ ] Supabase project created (free tier)
├─ [ ] PostgreSQL version verified (same as NeonDB: 15.x)
├─ [ ] Schema exported from NeonDB
├─ [ ] Test schema import to Supabase
├─ [ ] Validate all tables exist
├─ [ ] Validate all indexes exist
├─ [ ] Validate constraints

Migration Day:
├─ [ ] Export all data from NeonDB
├─ [ ] Backup Supabase (automated but good to know)
├─ [ ] Import data to Supabase
├─ [ ] Run data validation queries
├─ [ ] Test all API endpoints locally against Supabase
├─ [ ] Deploy backend with new connection string
├─ [ ] Monitor production logs
├─ [ ] Keep NeonDB backup for 1-2 weeks

Post-Migration:
├─ [ ] No issues? Cancel NeonDB
├─ [ ] Verify file storage not affected (files stay same)
├─ [ ] Document Supabase access for team
├─ [ ] Backup Supabase credentials securely
└─ [ ] Update disaster recovery runbook
```

---

## Part 11: Appendix - Quick Setup Commands

### Local Development Setup
```bash
# 1. Start PostgreSQL + Backend + Frontend
cd /d D:\temp\tarkVtark.com
docker-compose up -d

# 2. Wait for services to be healthy
docker-compose ps

# 3. Backend: http://localhost:8080/api/v1/swagger-ui.html
# 4. Frontend: http://localhost

# 5. To stop
docker-compose down

# 6. To reset database
docker-compose down -v  # removes volumes
docker-compose up -d    # creates fresh schema
```

### Supabase Setup
```bash
# 1. Go to https://app.supabase.com
# 2. Create new project (free tier)
# 3. Wait for project to be created
# 4. Go to Settings → Database → Connection string
# 5. Copy JDBC connection string
# 6. Update .env.prod with JDBC URL and password
# 7. Update GitHub/Render/Vercel secrets
# 8. Redeploy backend
```

### Export/Import Database
```bash
# Export from NeonDB
pg_dump -h ep-curly-queen-a1tu44g3-pooler.ap-southeast-1.aws.neon.tech \
        -U neondb_owner \
        -d neondb \
        --no-password > neondb_export.sql

# Import to Supabase
psql -h db.project.supabase.co \
     -U postgres \
     -d postgres \
     -f neondb_export.sql
```

---

## Part 12: Answers to Your Specific Questions

### Q1: Where are attachments stored locally in dev?
**A:** Currently in `./uploads/attachments/` folder, but metadata is incorrectly stored in NeonDB cloud. 

**Recommended:** Store metadata in local PostgreSQL instead (via docker-compose).

### Q2: Can I migrate NeonDB to Supabase easily?
**A:** Yes! One-time export/import process. PostgreSQL is PostgreSQL. No code changes needed, just connection string change.

**Recommendation:** Do it during Phase 1 of roadmap.

### Q3: Should I keep local database or use Supabase for development?
**A:** Keep local PostgreSQL for dev (via docker-compose). Use Supabase only for production.

**Reason:** Offline capability, faster, easier to reset, no credentials.

### Q4: Do I need a dedicated Storage Service layer?
**A:** ✅ You already have it! FileStorageService interface is perfect.

**Enhancements:** Add validation, health checks, and statistics services (see Part 4.2).

### Q5: What's the best overall strategy?
**A:** Three-tier approach:
- **Dev:** Local PostgreSQL + Local Files (docker-compose)
- **Test:** Ephemeral PostgreSQL + Mock Files
- **Prod:** Supabase Database + Supabase Storage

**Benefits:** Consistency, scalability, cost-efficient, manageable.

---

## Conclusion

Your project has a **solid foundation** with the FileStorageService abstraction. The recommendations focus on:

1. ✅ **Separating concerns:** Use local DB for dev, Supabase for prod
2. ✅ **Environment consistency:** Three distinct configurations
3. ✅ **Scalability:** Supabase handles growth automatically
4. ✅ **Security:** Proper credential management per environment
5. ✅ **Cost efficiency:** Free tier → paid tier as you grow

**Next Steps:** Follow the Phase 1-4 roadmap above. Estimated effort: 2-3 weeks to complete migration.

---

**Document Version:** 1.0  
**Created:** July 4, 2026  
**Status:** Ready for Implementation


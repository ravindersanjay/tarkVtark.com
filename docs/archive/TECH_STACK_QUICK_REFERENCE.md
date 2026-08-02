# Quick Reference: Tech Stack Three-Environment Setup

**One-page summary of your tech stack recommendations**  
**For detailed info:** See TECH_STACK_COMPREHENSIVE_ANALYSIS.md  
**For implementation:** See TECH_STACK_IMPLEMENTATION_GUIDE.md

---

## Your Current Situation

| Component | Current | Issue |
|-----------|---------|-------|
| **Dev DB** | NeonDB (cloud) | Requires internet, hard to reset |
| **Dev Files** | ./uploads/ | Good, but metadata in cloud DB |
| **Test DB** | ❌ None | Using dev database (bad) |
| **Test Files** | ❌ None | No test isolation |
| **Prod DB** | NeonDB (same as dev) | Sharing database |
| **Prod Files** | Undefined | Still set to local |

---

## Recommended Three-Environment Setup

### Development
```
├─ Database: Local PostgreSQL (via docker-compose)
├─ Files: ./uploads/attachments/ (local filesystem)
├─ Access: http://localhost:8080
├─ Config: .env.dev (no secrets, safe to commit)
└─ Profile: application-dev.yml
```

### Testing
```
├─ Database: Ephemeral PostgreSQL (fresh each test)
├─ Files: Mock (in-memory, no real files)
├─ Access: In-process only
├─ Config: .env.test (test defaults, safe to commit)
└─ Profile: application-test.yml
```

### Production
```
├─ Database: Supabase PostgreSQL (managed)
├─ Files: Supabase Storage (CDN-backed)
├─ Access: https://project.supabase.co/storage/...
├─ Config: CI/CD Secrets (GitHub/GitLab/Render)
└─ Profile: application-prod.yml
```

---

## What You Already Have ✅

1. **FileStorageService Abstraction** - Perfect! Controllers don't care about storage type
2. **Multiple Storage Implementations** - Local, S3, R2, Supabase
3. **Environment Configuration** - Using Spring profiles
4. **Attachment Model** - Stores metadata + URL

---

## What You Need to Add

1. ✅ **Done:** Spring profiles (application-dev/test/prod.yml)
2. ✅ **Done:** .env.dev/.env.test/.env.prod files
3. **TODO:** Deploy configuration (Render/Vercel settings)
4. **TODO:** Migrate data from NeonDB → Supabase
5. **TODO:** Test everything end-to-end

---

## Quick Decision Tree

```
Q: Should I migrate NeonDB to Supabase?
A: YES (easy, one-time process, backward compatible)

Q: Should I keep local DB for development?
A: YES (better than cloud for dev work)

Q: Do I need a separate test database?
A: YES (isolation, can reset, faster, parallel testing)

Q: Do I need a dedicated Storage Service layer?
A: Already have it! Your FileStorageService is perfect.

Q: Where should files be stored in production?
A: Supabase Storage (scalable, CDN-backed, same vendor as DB)

Q: What about cost?
A: Supabase free tier is perfect (~$0 for debate arena)
   Render is ~$7/month for backend
   Vercel is free (frontend already there)
```

---

## Key File Locations

| Purpose | File | Status |
|---------|------|--------|
| Dev env | `backend/.env.dev` | ✅ Update |
| Test env | `backend/.env.test` | ✅ Create new |
| Prod env | `backend/.env.prod` | ✅ Update |
| Dev profile | `backend/src/main/resources/application-dev.yml` | ✅ Create new |
| Test profile | `backend/src/main/resources/application-test.yml` | ✅ Create new |
| Prod profile | `backend/src/main/resources/application-prod.yml` | ✅ Create new |
| Storage validator | `backend/src/main/java/.../StorageConfigValidator.java` | ✅ Create new |
| Health check | `backend/src/main/java/.../StorageHealthController.java` | ✅ Create new |
| Mock storage | `backend/src/main/java/.../MockFileStorageService.java` | ✅ Create new |

---

## Attachment Storage Paths

### Development: `./uploads/attachments/`
```
Local filesystem
├─ Created automatically on first upload
├─ Persisted between restarts (docker volume)
└─ Accessed via: http://localhost:8080/api/v1/files/key/attachments/uuid.jpg
```

### Testing: In-memory or ephemeral
```
Mock storage
├─ Nothing on disk
├─ Tracked in memory for test assertions
└─ Automatically cleared between tests
```

### Production: Supabase Storage bucket
```
S3-based cloud storage
├─ Files in: debate-arena-uploads bucket
├─ Path: /attachments/uuid.jpg
├─ Served via: Supabase CDN
└─ URL format: https://project.supabase.co/storage/v1/object/public/debate-arena-uploads/attachments/uuid.jpg
```

---

## Migration Checklist

### Week 1: Setup
- [ ] Create Supabase project
- [ ] Export NeonDB data
- [ ] Import to Supabase
- [ ] Create .env.test, .env.prod, Spring profiles

### Week 2: Code
- [ ] Add MockFileStorageService
- [ ] Add StorageConfigValidator
- [ ] Add StorageHealthController
- [ ] Build and test locally

### Week 3: Testing
- [ ] Test local dev setup (docker-compose)
- [ ] Test database migration validated
- [ ] Test attachment upload/download in all environments

### Week 4: Production
- [ ] Set environment variables in deployment platform
- [ ] Deploy backend pointing to Supabase
- [ ] Monitor for 1 week
- [ ] Cancel NeonDB subscription

---

## Environment Variables

### For Development (.env.dev)
```
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/debate_arena_db
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres
FILE_PROVIDER=local
SPRING_PROFILES_ACTIVE=dev
```

### For Testing (.env.test)
```
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/test_debate_arena_db
SPRING_DATASOURCE_USERNAME=testuser
SPRING_DATASOURCE_PASSWORD=testpass
FILE_PROVIDER=mock
SPRING_PROFILES_ACTIVE=test
```

### For Production (CI/CD Secrets)
```
SPRING_DATASOURCE_URL=jdbc:postgresql://db.PROJECT.supabase.co:5432/postgres?sslmode=require
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=<SECRET>
FILE_PROVIDER=supabase
SUPABASE_URL=https://PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<SECRET>
SUPABASE_STORAGE_BUCKET=debate-arena-uploads
SPRING_PROFILES_ACTIVE=prod
```

---

## Cost Analysis (Annual)

| Service | Dev | Test | Prod | Total |
|---------|-----|------|------|-------|
| Database | $0 | $0 | $0-25 | $0-25 |
| Storage | $0 | $0 | Included | Included |
| Backend | $0 | $0 | $84 (Render) | $84 |
| **Total** | **$0** | **$0** | **$84-109** | **$84-109** |

*Supabase free tier perfect for starting. Scale to $300/year when you grow.*

---

## Spring Profiles Explained

```
# Default: application.yml (shared config)
# Overrides:
#   application-dev.yml   (mvn -Dspring.profiles.active=dev)
#   application-test.yml  (mvn -Dspring.profiles.active=test)
#   application-prod.yml  (mvn -Dspring.profiles.active=prod)

# Settings override by:
# 1. Command-line: -Dspring.profiles.active=test
# 2. Environment: SPRING_PROFILES_ACTIVE=test
# 3. .env files: SPRING_PROFILES_ACTIVE=test
# 4. Docker: environment: SPRING_PROFILES_ACTIVE=test
```

---

## File Storage Service Pattern

```
Controller (FileUploadController)
    └─ @Autowired FileStorageService
        ├─ LocalFileStorageService (file.provider=local)
        ├─ S3FileStorageService (file.provider=s3)
        ├─ R2FileStorageService (file.provider=r2)
        ├─ SupabaseFileStorageService (file.provider=supabase)
        └─ MockFileStorageService (file.provider=mock)

Spring chooses implementation based on file.provider property!
Controller code never changes.
```

---

## Docker Compose (Updated)

Current docker-compose.yml uses local PostgreSQL (good!).  
Just needs environment variable overrides added.

```bash
# Default (dev)
docker-compose up -d

# Override for testing
FILE_PROVIDER=mock docker-compose up -d

# Override for Supabase simulation
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... docker-compose up -d
```

---

## Success Criteria (When Complete)

✅ Can develop locally without internet  
✅ Local database resets easily between test runs  
✅ Tests run in isolation (separate database)  
✅ File uploads work in all environments  
✅ Production uses Supabase (scalable, managed)  
✅ No code changes needed to switch environments  
✅ Credentials never committed to git  
✅ Cost optimized for current scale  

---

## Common Questions

**Q: Do I need to change my code?**  
A: No! FileStorageService abstraction already handles it. Just add configs.

**Q: What about existing data in NeonDB?**  
A: Export/import once. Everything works after that. PostgreSQL is PostgreSQL.

**Q: Can I run Supabase locally for testing?**  
A: Yes, but not necessary. Use local PostgreSQL + MockFileStorageService instead.

**Q: What if production needs to scale?**  
A: Supabase auto-scales. Backend can run multiple replicas (stateless design).

**Q: How do I backup Supabase?**  
A: Supabase handles it automatically. Manual backups available in pro tier.

**Q: Can I migrate back if needed?**  
A: Yes! PostgreSQL exports/imports to any other PostgreSQL (RDS, GCP, etc.).

---

## Next Step

1. **Read:** TECH_STACK_COMPREHENSIVE_ANALYSIS.md (full details)
2. **Follow:** TECH_STACK_IMPLEMENTATION_GUIDE.md (step-by-step)
3. **Build:** Spring profiles + env files
4. **Test:** Locally with docker-compose
5. **Deploy:** To production with Supabase

---

## Estimated Effort

| Task | Time |
|------|------|
| Setup Supabase project | 30 min |
| Export/import database | 1 hour |
| Create config files | 1 hour |
| Create new Java components | 2 hours |
| Build & test locally | 1 hour |
| Deploy to production | 1-2 hours |
| Monitor & cleanup | 1 hour |
| **Total** | **7-8 hours** |

*Spread across 2-3 weeks for safe migration.*

---

**Version:** 1.0  
**Date:** July 4, 2026  
**Status:** Ready to implement  
**Support:** See TECH_STACK_COMPREHENSIVE_ANALYSIS.md for details


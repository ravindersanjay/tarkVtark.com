# 🚀 FRESH START CHECKLIST
## From Commit d2e30e37 to Working Application

---

## ⚠️ **READ THIS FIRST:**

**THIS IS YOUR PRIMARY ACTION GUIDE - FOLLOW THIS DOCUMENT STEP-BY-STEP**

**Other documents are for reference only:**
- `DEVELOPMENT_PLAN.md` - Read AFTER this checklist (for future planning)
- `PROJECT_BEST_PRACTICES.md` - Reference when needed (utilities guide)
- `AI_COPILOT_PROMPTING_GUIDE.md` - Use in future AI sessions
- `NEW_SESSION_CONTEXT_TEMPLATE.md` - Copy-paste in new AI chats
- `conversations/*.md` - Past conversation logs

**Start below at "PRE-START VERIFICATION" and work through each phase.**

---

## ✅ PRE-START VERIFICATION (15 minutes)

### System Requirements Check
```bash
# Run diagnostic
diagnose-backend.bat
diagnose-postgres.bat

# Expected output:
✓ Java 17+ installed
✓ Maven 3.8+ installed
✓ PostgreSQL 14+ installed
✓ Node.js 18+ installed
✓ Port 8080 free
✓ Port 5432 free (PostgreSQL)
✓ Port 5175 free (Vite)
```

### Git Repository Status
```bash
cd D:\debate-app\debate-frontend

# Verify current state
git status
# Should show: On branch [current branch]

# View commit history
git log --oneline -5
# Should show: d2e30e3 attachment upload working

# Create new branch from d2e30e37
git checkout d2e30e37
git checkout -b feature/production-ready-v2

# Verify
git log -1
# Should show: commit d2e30e3724e3296f09f363b91a56facb84d379ee
```

---

## 📦 PHASE 1: CLEAN ENVIRONMENT (30 minutes)

### Step 1.1: Clean Old Build Artifacts
```bash
# Backend cleanup
cd backend-java
del /s /q target
cd ..

# Frontend cleanup
del /s /q node_modules
del /s /q dist

# Database cleanup (will recreate in next phase)
psql -U postgres -c "DROP DATABASE IF EXISTS debate_db;"
```

### Step 1.2: Verify File Structure
```bash
# Check critical files exist
dir api-contract.yaml
dir database-schema.sql
dir backend-java\pom.xml
dir package.json

# If any missing, restore from git
git checkout d2e30e37 -- [missing-file]
```

**CHECKPOINT 1:** All artifacts cleaned, commit d2e30e37 checked out ✓

---

## 🗄️ PHASE 2: DATABASE SETUP (15 minutes)

### Step 2.1: Start PostgreSQL Service
```bash
# Start service
start-postgres-service.bat

# Or manually
net start postgresql-x64-14

# Verify
psql -U postgres -c "SELECT version();"
# Expected: PostgreSQL 14.x
```

### Step 2.2: Create Database
```bash
# Create database
psql -U postgres -c "CREATE DATABASE debate_db;"

# Verify
psql -U postgres -l
# Should show debate_db in list
```

### Step 2.3: Create Schema
```bash
# Run schema script
psql -U postgres -d debate_db -f database-schema.sql

# Verify tables created
psql -U postgres -d debate_db -c "\dt"

# Expected output:
             List of relations
 Schema |      Name       | Type  |  Owner
--------+-----------------+-------+----------
 public | debate_topics   | table | postgres
 public | questions       | table | postgres
 public | replies         | table | postgres
 public | admin_users     | table | postgres
 public | contact_messages| table | postgres
```

### Step 2.4: Insert Initial Data
```bash
# Run initial data script
psql -U postgres -d debate_db -f database-initial-data.sql

# Verify data
psql -U postgres -d debate_db -c "SELECT COUNT(*) FROM debate_topics;"
# Expected: 3

psql -U postgres -d debate_db -c "SELECT topic FROM debate_topics;"
# Expected:
 Sanatan vs Islam
 Science vs Religion
 Capitalism vs Socialism
```

**CHECKPOINT 2:** Database created with schema and 3 sample topics ✓

---

## 🔧 PHASE 3: BACKEND FOUNDATION (45 minutes)

### Step 3.1: Review Current pom.xml
```bash
cd backend-java
type pom.xml | findstr "spring-boot-starter"

# Check if these dependencies exist:
# - spring-boot-starter-web ✓
# - spring-boot-starter-data-jpa ✓
# - postgresql ✓
# - lombok ✓

# If spring-boot-starter-security exists, NOTE IT
# We'll handle it carefully
```

### Step 3.2: Create/Update application.yml
**File:** `backend-java/src/main/resources/application.yml`

**Content:**
```yaml
spring:
  application:
    name: debate-backend

  datasource:
    url: jdbc:postgresql://localhost:5432/debate_db
    driver-class-name: org.postgresql.Driver
    username: postgres
    password: 123456
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5

  jpa:
    hibernate:
      ddl-auto: validate  # CRITICAL: Don't auto-create schema
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.PostgreSQLDialect

server:
  port: 8080
  servlet:
    context-path: /api/v1

logging:
  level:
    com.debatearena: DEBUG
    org.springframework.web: INFO
```

### Step 3.3: Create CORS Configuration
**File:** `backend-java/src/main/java/com/debatearena/config/CorsConfig.java`

```java
package com.debatearena.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowCredentials(true);
        config.setAllowedOrigins(Arrays.asList(
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:5175",
            "http://localhost:5177",
            "http://localhost:3000"
        ));
        config.addAllowedHeader("*");
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
```

### Step 3.4: Create Jackson Configuration
**File:** `backend-java/src/main/java/com/debatearena/config/JacksonConfig.java`

```java
package com.debatearena.config;

import com.fasterxml.jackson.databind.Module;
import com.fasterxml.jackson.datatype.hibernate5.jakarta.Hibernate5JakartaModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import static com.fasterxml.jackson.datatype.hibernate5.jakarta.Hibernate5JakartaModule.Feature.FORCE_LAZY_LOADING;

@Configuration
public class JacksonConfig {

    @Bean
    public Module hibernateModule() {
        Hibernate5JakartaModule module = new Hibernate5JakartaModule();
        module.disable(FORCE_LAZY_LOADING);
        return module;
    }
}
```

### Step 3.5: Update DebateTopic Entity
**File:** `backend-java/src/main/java/com/debatearena/model/DebateTopic.java`

**CRITICAL CHANGES - Add these:**
```java
// Add this import at top
import com.fasterxml.jackson.annotation.JsonIgnore;

// In the class, modify the questions field:
@OneToMany(mappedBy = "debateTopic", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
@JsonIgnore  // ← ADD THIS LINE
private List<Question> questions = new ArrayList<>();
```

### Step 3.6: Create Security Config (ONLY if spring-security dependency exists)
**File:** `backend-java/src/main/java/com/debatearena/config/SecurityConfig.java`

```java
package com.debatearena.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.http.SessionCreationPolicy;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> {})
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/**").permitAll()
            );
        return http.build();
    }
}
```

### Step 3.7: Build and Test Backend
```bash
# Clean build
mvn clean compile

# Expected: BUILD SUCCESS

# Start backend
mvn spring-boot:run

# Expected output (in 10-15 seconds):
✓ Tomcat started on port 8080
✓ Started DebateApplication in X.XXX seconds
```

### Step 3.8: Test Topics Endpoint
**Open NEW terminal:**
```bash
# Test endpoint
curl http://localhost:8080/api/v1/topics

# Expected: JSON array with 3 topics
[
  {
    "id": "...",
    "topic": "Sanatan vs Islam",
    "leftLabel": "Sanatan",
    "rightLabel": "Islam",
    ...
  },
  ...
]

# If 500 error:
# - Check @JsonIgnore on ALL @OneToMany fields
# - Run: mvn clean compile spring-boot:run

# If 403 error:
# - Verify SecurityConfig exists
# - Check requestMatchers("/**").permitAll()

# If CORS error:
# - Check CorsConfig has port 5175
```

**CHECKPOINT 3:** Backend running, /topics returns 3 topics ✓

---

## 💻 PHASE 4: FRONTEND INTEGRATION (30 minutes)

### Step 4.1: Install Dependencies
```bash
# Back to project root
cd D:\debate-app\debate-frontend

# Install packages
npm install

# Expected: No errors, node_modules created
```

### Step 4.2: Update apiService.ts (if using Vite proxy)
**File:** `src/services/apiService.ts`

**Change API_BASE_URL:**
```typescript
// If using Vite proxy (vite.config.js has proxy config):
const API_BASE_URL = '/api/v1';

// If NOT using proxy:
const API_BASE_URL = 'http://localhost:8080/api/v1';
```

### Step 4.3: Start Frontend
```bash
npm run dev

# Expected output:
✓ VITE vX.X.X ready in XXX ms
➜ Local:   http://localhost:5175/
```

### Step 4.4: Test in Browser
```
1. Open: http://localhost:5175
2. Open browser console (F12)
3. Check for errors

Expected:
✓ No console errors
✓ Topics load on homepage
✓ 3 debate topics visible

If "Failed to load topics":
1. Check Network tab (F12 → Network)
2. Look for request to /topics
3. Check response status:
   - 200 OK → Success!
   - 500 → Backend error, check @JsonIgnore
   - 403 → Security blocking
   - CORS → Origin not in CorsConfig
   - Connection refused → Backend not running
```

**CHECKPOINT 4:** Frontend displays 3 topics from database ✓

---

## 🎯 PHASE 5: VALIDATION (15 minutes)

### Test 1: End-to-End Flow
```bash
# 1. Backend health
curl http://localhost:8080/api/v1/health
# Expected: 200 OK

# 2. Topics endpoint
curl http://localhost:8080/api/v1/topics
# Expected: JSON array

# 3. CORS headers
curl -H "Origin: http://localhost:5175" -v http://localhost:8080/api/v1/topics 2>&1 | findstr "Access-Control"
# Expected: Access-Control-Allow-Origin: http://localhost:5175

# 4. Database query
psql -U postgres -d debate_db -c "SELECT COUNT(*) FROM debate_topics;"
# Expected: 3
```

### Test 2: Browser Integration
```javascript
// Open browser console:

// Test API call
fetch('http://localhost:8080/api/v1/topics')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)

// Expected: Array of 3 topics logged, no CORS errors
```

**CHECKPOINT 5:** All tests pass ✓

---

## 📝 POST-SETUP TASKS (10 minutes)

### Task 1: Commit Working State
```bash
git add .
git commit -m "feat: PostgreSQL integration with CORS and Jackson config

- Added PostgreSQL connection
- Fixed Jackson serialization with @JsonIgnore
- Configured CORS for all frontend ports
- Added Security config (permit all for dev)
- Verified 3 topics load successfully
- Status: WORKING ✓"

# Tag this as stable checkpoint
git tag -a v2.0-stable -m "Working PostgreSQL integration"
```

### Task 2: Run Status Check
```bash
check-status.bat

# Verify all green:
✓ Backend running on port 8080
✓ Frontend running on port 5175
✓ Database has 3 topics
✓ /topics endpoint returns 200 OK
```

**CHECKPOINT 6:** Clean state committed and documented ✓

---

## ⚠️ COMMON ISSUES & QUICK FIXES

### Issue 1: Backend Returns 500 on /topics
```bash
# Symptom: Jackson serialization error
# Fix: Add @JsonIgnore to ALL @OneToMany fields
# Then: mvn clean compile spring-boot:run
```

### Issue 2: CORS Error in Browser
```bash
# Fix: Edit CorsConfig.java
# Add: "http://localhost:5175" to setAllowedOrigins()
# Then: kill-backend-port.bat
```

### Issue 3: Port 8080 Already in Use
```bash
# Fix: kill-backend-port.bat
# Or: netstat -ano | findstr :8080
#     taskkill /F /PID [PID]
```

### Issue 4: Database Connection Failed
```bash
# Fix: net start postgresql-x64-14
# Verify: psql -U postgres -l
```

---

## 🎓 SUCCESS CRITERIA

You've completed the fresh start when:

- [ ] Backend starts without errors in < 15 seconds
- [ ] `curl http://localhost:8080/api/v1/topics` returns 3 topics
- [ ] No Jackson serialization errors in logs
- [ ] No CORS errors in browser console
- [ ] Frontend displays 3 debate topics
- [ ] Database has 3 topics
- [ ] Working state committed to git

**Estimated Total Time:** 2.5 - 3 hours

**Next Action:** Follow DEVELOPMENT_PLAN.md Phase 2 →

---

**Document Version:** 1.0  
**For Use With:** Commit d2e30e37  
**Last Updated:** December 18, 2025

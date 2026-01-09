# 🔄 NEW AI SESSION CONTEXT TEMPLATE
## ⚠️ INSTRUCTIONS: Copy-paste this ENTIRE file into a NEW AI chat window

**HOW TO USE:**
1. Open a FRESH AI conversation window
2. Copy ALL text from this file (Ctrl+A, Ctrl+C)
3. Paste as your FIRST message in the new window
4. Fill in the [brackets] with your current state
5. AI will have full context immediately

**NOTE:** Just having this file "attached" is NOT enough - you MUST paste the text!

---

**PROJECT:** Debate Forum Application  
**TECH STACK:** React (Vite) + Spring Boot 3.2.0 + PostgreSQL 14  
**BRANCH:** feature/production-ready-dec17  
**BASE COMMIT:** d2e30e37 (attachment upload working)

---

## 📍 CURRENT STATUS

**Last Working State:** [Describe what's working]
```bash
# Example:
- ✅ Backend running on port 8080
- ✅ Frontend displaying 3 topics from PostgreSQL
- ✅ CORS configured, no serialization errors
- ✅ Latest commit: [hash] - "feat: topics loading from DB"
```

**Currently Working On:** [What you're about to do]
```
Example: Adding question CRUD endpoints (Phase 2 from DEVELOPMENT_PLAN.md)
```

---

## 🔧 CRITICAL PROJECT RULES

**MUST FOLLOW (remind AI every session):**

1. **API Contract First:** Update `api-contract.yaml` BEFORE code changes
2. **Jackson Fix:** ALWAYS add `@JsonIgnore` to `@OneToMany` fields
3. **Lazy Loading:** ALL collections must use `fetch = FetchType.LAZY`
4. **DTOs Only:** Controllers return DTOs, NEVER entities
5. **Clean Build:** Always use `mvn clean compile spring-boot:run`
6. **Test Immediately:** Test endpoint after EVERY change
7. **CORS Ports:** All frontend ports in CorsConfig (5173, 5174, 5175, 5177, 3000)

---

## 📂 KEY FILES (for AI reference)

**Documentation:**
- `DEVELOPMENT_PLAN.md` - Step-by-step development guide
- `FRESH_START_CHECKLIST.md` - Setup verification steps
- `PROJECT_BEST_PRACTICES.md` - Patterns and utilities
- `AI_COPILOT_PROMPTING_GUIDE.md` - How to ask effective questions

**Backend Critical Files:**
- `api-contract.yaml` - Single source of truth for API
- `backend-java/src/main/java/com/debatearena/config/CorsConfig.java` - CORS config
- `backend-java/src/main/java/com/debatearena/config/SecurityConfig.java` - Spring Security
- `backend-java/src/main/java/com/debatearena/config/JacksonConfig.java` - Serialization
- `backend-java/src/main/java/com/debatearena/model/` - Entities (@JsonIgnore required)

**Database:**
- `database-schema.sql` - Schema definition (single source of truth)
- `database-initial-data.sql` - Default admin/user + sample data
- `clean-database.bat` + `setup-database.bat` - Reset database

**Utilities:**
- `kill-backend-port.bat` - Restart backend (kills port 8080)
- `kill-vite-port.bat` - Restart frontend (kills port 5174/5175)
- `test-backend.bat` - Health check

---

## 🚨 KNOWN ISSUES TO PREVENT

### Issue #1: Jackson Serialization (HTTP 500)
**Symptom:** `GET /topics` returns 500, "No serializer found" error  
**Fix:** Add `@JsonIgnore` to ALL `@OneToMany` fields
```java
@OneToMany(mappedBy = "parent", fetch = FetchType.LAZY)
@JsonIgnore  // ← MUST HAVE
private List<Child> children;
```

### Issue #2: CORS Errors
**Symptom:** Browser shows "Access-Control-Allow-Origin" error  
**Fix:** Ensure CorsConfig.java has ALL frontend ports
```java
config.setAllowedOrigins(Arrays.asList(
    "http://localhost:5173",
    "http://localhost:5175",  // ← Must include YOUR port
    "http://localhost:3000"
));
```

### Issue #3: Spring Security 403
**Symptom:** All endpoints return 403 Forbidden  
**Fix:** SecurityConfig must permit all for development
```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/**").permitAll()  // ← Required
)
```

### Issue #4: Maven Not Recompiling
**Symptom:** Code changes not reflected in running app  
**Fix:** ALWAYS use clean build
```bash
kill-backend-port.bat
cd backend-java
mvn clean compile spring-boot:run  # ← Use "clean"
```

---

## 🎯 CURRENT TASK

**What I'm trying to do:**
[Describe your immediate goal]

**What's working:**
[List working features]

**What's not working:**
[Describe the issue]

**Attempts made:**
1. [What you tried]
2. [Result]

**Error (if any):**
```
[Paste complete error message or stack trace]
```

**Question:**
[Your specific question for AI]

---

## ✅ VERIFICATION COMMANDS

**Before asking for help, run these:**
```bash
# Backend health
curl http://localhost:8080/api/v1/topics
# Expected: JSON array or specific error

# Database status
psql -U postgres -d debate_db -c "SELECT COUNT(*) FROM debate_topics;"
# Expected: 3

# Port status
netstat -ano | findstr :8080
# Expected: LISTENING on port 8080

# Recent commits
git log --oneline -3
# Shows recent work
```

---

**END OF CONTEXT TEMPLATE**

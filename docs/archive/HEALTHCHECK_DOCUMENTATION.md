# 🏥 HEALTH CHECK UTILITY - DOCUMENTATION

## Overview

The Health Check Utility is a comprehensive diagnostic tool that verifies all components of the Debate Application are properly configured and working correctly.

**Created:** December 19, 2025  
**Version:** 1.0  
**Purpose:** Pre-deployment verification and troubleshooting

---

## 📁 Files

| File | Platform | Purpose |
|------|----------|---------|
| `healthcheck.bat` | Windows | Batch script for Windows systems |
| `healthcheck.js` | Cross-platform | Node.js script for all platforms |

---

## 🚀 USAGE

### Windows (Batch Script)

```bash
# Simply double-click the file or run:
healthcheck.bat
```

### Cross-Platform (Node.js)

```bash
# Run from project root:
node healthcheck.js

# Or make executable (Linux/Mac):
chmod +x healthcheck.js
./healthcheck.js
```

---

## 🔍 WHAT IT CHECKS

### 1. System Requirements ✅
- **Java** - Version 17 or higher
- **Maven** - Version 3.8 or higher
- **Node.js** - Version 18 or higher
- **npm** - Latest version
- **PostgreSQL** - Version 13 or higher

**Why:** Ensures all required tools are installed

---

### 2. Database ✅
- **PostgreSQL Service** - Running or stopped
- **Database Existence** - `debate_db` exists
- **Table Count** - All 5 tables present
  - debate_topics
  - questions
  - replies
  - admin_users
  - contact_messages
- **Sample Data** - At least one topic exists

**Why:** Verifies database is set up correctly

---

### 3. Backend Files ✅
- **Directory Structure** - `backend/` exists
- **Build Configuration** - `pom.xml` present
- **Main Application** - `DebateApplication.java` exists
- **Controllers** - All 3 controllers present:
  - TopicController.java
  - QuestionController.java
  - ReplyController.java
- **Configuration** - `application.yml` exists

**Why:** Ensures backend code is complete

---

### 4. Frontend Files ✅
- **Directory Structure** - `frontend/` exists
- **Package Configuration** - `package.json` present
- **Dependencies** - `node_modules` installed
- **Main Component** - `App.jsx` exists
- **Admin Component** - `AdminDashboard.jsx` exists
- **API Service** - `apiService.js` exists

**Why:** Ensures frontend code is complete

---

### 5. Port Availability ✅
- **Port 8080** - Backend API port (available/in-use)
- **Port 5173** - Frontend dev server (available/in-use)
- **Port 5432** - PostgreSQL database (should be in-use)

**Why:** Detects port conflicts and running services

---

### 6. Backend API (Live Test) ✅
- **API Availability** - Backend responding on port 8080
- **Topics Endpoint** - `GET /api/v1/topics` returns 200
- **Questions Endpoint** - `GET /api/v1/questions/topic/{id}` works
- **Data Format** - JSON responses are valid

**Why:** Verifies backend is running and working correctly

**Note:** Only runs if backend is already started

---

### 7. Configuration Files ✅
- **Database Schema** - `database-schema.sql` exists
- **Initial Data** - `database-initial-data.sql` exists
- **Setup Scripts** - `setup-database.bat` exists
- **Database Config** - `application.yml` has PostgreSQL connection

**Why:** Ensures all configuration is in place

---

### 8. Build Artifacts ℹ️
- **Backend Build** - `backend/target/` exists
- **Frontend Build** - `frontend/dist/` exists

**Why:** Checks if project has been compiled

**Note:** Not required for development

---

### 9. Documentation ℹ️
- **README.md** - Project documentation
- **DEVELOPMENT_PLAN.md** - Development roadmap
- **DATABASE_SCRIPTS_ANALYSIS.md** - Database docs
- **Other docs** - Session logs, guides

**Why:** Ensures project is properly documented

**Note:** Optional checks

---

### 10. Security Configuration ⚠️
- **Password Placeholder** - Checks for placeholder in SQL
- **CORS Configuration** - `CorsConfig.java` exists
- **Security Warnings** - Displays production reminders

**Why:** Highlights security considerations

---

## 📊 OUTPUT INTERPRETATION

### Status Indicators

| Indicator | Meaning | Action Required |
|-----------|---------|-----------------|
| `[OK]` | ✅ Check passed | None |
| `[INFO]` | ℹ️ Informational | None (optional) |
| `[WARNING]` | ⚠️ Non-critical issue | Review when possible |
| `[ERROR]` | ❌ Critical issue | Must fix before running |

### Exit Codes

| Code | Meaning |
|------|---------|
| `0` | All checks passed or only warnings |
| `1` | One or more errors found |

---

## 🎯 COMMON SCENARIOS

### Scenario 1: Fresh Clone/Setup

**Expected Output:**
```
[ERROR] Database 'debate_db' not found!
[INFO] Backend not built yet
[INFO] node_modules not found
```

**Action:**
1. Run `setup-database.bat`
2. Run `cd frontend && npm install`
3. Run `cd backend && mvn clean compile`

---

### Scenario 2: Backend Not Running

**Expected Output:**
```
[OK] All 5 tables exist
[OK] Backend directory exists
[INFO] Backend API not running on port 8080
```

**Action:**
- This is normal if you haven't started the backend
- Start with: `cd backend && mvn spring-boot:run`

---

### Scenario 3: Database Empty

**Expected Output:**
```
[OK] Database 'debate_db' exists
[WARNING] No topics found. Database may be empty.
```

**Action:**
- Run `setup-database.bat` to insert sample data
- Or add topics through the application

---

### Scenario 4: All Green ✅

**Expected Output:**
```
[SUCCESS] All checks passed! System is healthy.
Your debate application is ready to run!
```

**Action:**
- None! System is ready
- Start backend and frontend if not running

---

## 🛠️ TROUBLESHOOTING

### Issue: "Java not found"

**Solution:**
1. Install Java JDK 17 or higher
2. Add Java to PATH environment variable
3. Verify: `java -version`

---

### Issue: "PostgreSQL not found"

**Solution:**
1. Install PostgreSQL 13 or higher
2. Add PostgreSQL bin to PATH
3. Verify: `psql --version`

---

### Issue: "Database connection failed"

**Solution:**
1. Check PostgreSQL service is running
2. Verify credentials in `application.yml`
3. Check port 5432 is not blocked

---

### Issue: "Backend API timeout"

**Solution:**
1. Check if backend is actually running
2. Verify no firewall blocking port 8080
3. Check backend logs for errors

---

### Issue: "Port already in use"

**Solution:**
1. Check if application is already running
2. Kill process: `netstat -ano | findstr :8080`
3. Or use a different port

---

## 📋 CHECKLIST FOR PRODUCTION

Before deploying to production, health check should show:

- [ ] All system requirements installed
- [ ] Database created with production credentials
- [ ] All tables exist with proper indexes
- [ ] Backend builds without errors
- [ ] Frontend builds without errors
- [ ] All API endpoints responding
- [ ] Security configurations reviewed
- [ ] Password placeholder replaced with bcrypt hash
- [ ] CORS configured for production domains
- [ ] No warnings in health check output

---

## 🔄 INTEGRATION WITH CI/CD

### GitHub Actions Example

```yaml
- name: Run Health Check
  run: node healthcheck.js
  
- name: Fail if errors
  if: failure()
  run: exit 1
```

### Jenkins Example

```groovy
stage('Health Check') {
  steps {
    bat 'healthcheck.bat'
  }
}
```

---

## 📈 MONITORING

### Recommended Schedule

| Environment | Frequency | Purpose |
|-------------|-----------|---------|
| Development | Before each dev session | Catch config drift |
| CI/CD | Every commit | Automated validation |
| Staging | Daily | Ensure stability |
| Production | After each deployment | Verify deployment |

---

## 🎓 BEST PRACTICES

### 1. Run Before Development
```bash
# Start of day routine:
healthcheck.bat
cd backend && mvn spring-boot:run
cd frontend && npm run dev
```

### 2. Run After Git Pull
```bash
git pull
healthcheck.bat  # Check for new dependencies
npm install      # If needed
```

### 3. Run Before Committing
```bash
healthcheck.bat  # Ensure nothing broken
git add .
git commit -m "Your message"
```

### 4. Run After Database Changes
```bash
setup-database.bat
healthcheck.bat  # Verify schema is correct
```

---

## 🔧 CUSTOMIZATION

### Adding Custom Checks

**In healthcheck.bat:**
```bat
REM Add after line 400:
echo Checking custom feature...
if exist "path\to\custom\file" (
    echo [OK] Custom feature configured
) else (
    echo [ERROR] Custom feature missing
    SET /A ERROR_COUNT+=1
)
```

**In healthcheck.js:**
```javascript
async function checkCustomFeature() {
  header('[11/10] Custom Feature');
  checkFile('path/to/custom/file', true);
}

// Add to main():
await checkCustomFeature();
```

---

## 📝 VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Dec 19, 2025 | Initial release |
| | | - 10 comprehensive checks |
| | | - Windows and Node.js versions |
| | | - Detailed documentation |

---

## 🆘 SUPPORT

### If Health Check Fails

1. **Read the error messages carefully**
2. **Check the specific section above** for that error
3. **Review the troubleshooting guide**
4. **Check documentation files** (README.md, etc.)
5. **Run individual commands** to isolate the issue

### Common Commands

```bash
# Test database connection:
psql -U postgres -d debate_db -c "SELECT 1;"

# Test backend compilation:
cd backend && mvn clean compile

# Test frontend build:
cd frontend && npm run build

# Test backend API:
curl http://localhost:8080/api/v1/topics
```

---

## ✅ SUCCESS CRITERIA

A healthy system should show:

```
================================================
  HEALTH CHECK SUMMARY
================================================

[SUCCESS] All checks passed! System is healthy.

Your debate application is ready to run!
```

**When you see this, you're good to go!** 🎉

---

## 📞 QUICK REFERENCE

| Want to... | Command |
|------------|---------|
| Check system health | `healthcheck.bat` or `node healthcheck.js` |
| Setup database | `setup-database.bat` |
| Start backend | `cd backend && mvn spring-boot:run` |
| Start frontend | `cd frontend && npm run dev` |
| Clean database | `clean-database.bat` |
| View all topics | `curl http://localhost:8080/api/v1/topics` |

---

**Remember:** The health check utility is your first line of defense against configuration issues. Run it often! 🏥✅



# 🔴 IMMEDIATE ACTION REQUIRED

## Current Status

❌ **Backend: NOT RUNNING**  
✅ **Frontend: RUNNING** (Port 5173)  
❌ **Error:** "Failed to load topics. Please make sure the backend is running."

---

## Root Cause

Backend won't start because the `guidelines` table is missing from the database.

**Error Message:**
```
Schema-validation: missing table [guidelines]
```

---

## 🚀 FIX IN 3 STEPS

### STEP 1: Create Guidelines Table

**Open pgAdmin or any SQL tool and run:**

```sql
CREATE TABLE guidelines (
    id BIGSERIAL PRIMARY KEY,
    text VARCHAR(1000) NOT NULL,
    display_order INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_guidelines_display_order ON guidelines(display_order);
CREATE INDEX idx_guidelines_active ON guidelines(is_active);
```

### STEP 2: Start Backend

```bash
cd C:\Users\Admin\IdeaProjects\debate_app\tarkVtark.com
.\start-all.bat
```

### STEP 3: Refresh Browser

Open http://localhost:5173 and refresh

---

## ✅ Success Indicators

**Backend Console:**
```
Started DebateApplication in X seconds
Tomcat started on port(s): 8080
```

**Frontend:**
- Topics load successfully
- No more "Failed to load topics" error
- Can click on topics and see questions

---

## 📁 Files to Reference

- **Full Migration SQL:** `database-migration-guidelines.sql`
- **Detailed Guide:** `URGENT_FIX_BACKEND.md`  
- **Guidelines Info:** `GUIDELINES_DATABASE_COMPLETE.md`

---

## ⚡ Quick Copy-Paste SQL

```sql
-- Run this in pgAdmin on database: debate_arena
CREATE TABLE IF NOT EXISTS guidelines (
    id BIGSERIAL PRIMARY KEY,
    text VARCHAR(1000) NOT NULL,
    display_order INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_guidelines_display_order ON guidelines(display_order);
CREATE INDEX IF NOT EXISTS idx_guidelines_active ON guidelines(is_active);
SELECT 'Table created!' as status;
```

---

**Time to Fix:** 2-3 minutes  
**Difficulty:** Easy  
**Impact:** HIGH - Fixes "Failed to load topics" error

🎯 **Do this now, then start the backend!**


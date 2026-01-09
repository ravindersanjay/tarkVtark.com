# 🚨 URGENT FIX - Backend Won't Start

## ❌ Current Error

```
Schema-validation: missing table [guidelines]
```

**Backend is failing** because the `guidelines` table doesn't exist in the database.

---

## ✅ SOLUTION - Apply Migration

### Option 1: Using pgAdmin (RECOMMENDED)

1. Open **pgAdmin**
2. Connect to your PostgreSQL server
3. Expand to find database: **debate_arena**
4. Right-click → **Query Tool**
5. **Copy and paste this SQL:**

```sql
-- Create guidelines table
CREATE TABLE IF NOT EXISTS guidelines (
    id BIGSERIAL PRIMARY KEY,
    text VARCHAR(1000) NOT NULL,
    display_order INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_guidelines_display_order ON guidelines(display_order);
CREATE INDEX IF NOT EXISTS idx_guidelines_active ON guidelines(is_active);

-- Add comment
COMMENT ON TABLE guidelines IS 'Community guidelines for debates';

-- Verify
SELECT 'Guidelines table created successfully!' as status;
SELECT COUNT(*) as guideline_count FROM guidelines;
```

6. Click **Execute** (F5)
7. **Expected:** "Guidelines table created successfully!"

### Option 2: Using DBeaver or Other SQL Client

1. Connect to database: **debate_arena**
2. Open SQL Editor
3. Paste the SQL above
4. Execute

### Option 3: Using psql (if you know the password)

```bash
cd C:\Users\Admin\IdeaProjects\debate_app\tarkVtark.com
psql -U postgres -d debate_arena
# Enter password when prompted
# Then paste the CREATE TABLE SQL
```

---

## 🔄 After Migration - Restart Backend

### Method 1: Use start-all.bat

```bash
cd C:\Users\Admin\IdeaProjects\debate_app\tarkVtark.com
.\start-all.bat
```

### Method 2: Manual Start

```bash
cd backend
mvn spring-boot:run
```

---

## ✅ Verify Backend Started

**Look for this in console:**
```
Started DebateApplication in X seconds
Tomcat started on port(s): 8080 (http)
```

**Test:**
```bash
curl http://localhost:8080/api/v1/topics
```

---

## 🧪 Test Guidelines

1. Backend will auto-initialize 12 default guidelines
2. Open http://localhost:5173
3. Click "Guidelines"
4. You should see the guidelines list

---

## 📊 Quick Verification

```sql
-- Check table exists
SELECT COUNT(*) FROM guidelines;

-- View guidelines
SELECT * FROM guidelines ORDER BY display_order;
```

---

## 🎯 Why This Happened

- We added `Guideline` entity to backend code
- But database schema wasn't updated
- Spring Boot validates schema on startup
- Found missing table → Failed to start

**Solution:** Create the table, then restart!

---

**Next:** After creating the table, run `.\start-all.bat`


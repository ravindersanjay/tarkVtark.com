# 🚀 Part 3: Database with PostgreSQL & Docker
## Setting Up PostgreSQL Database in Docker

**Time Required:** 1 hour  
**Difficulty:** Medium  
**Prerequisites:** Parts 1 and 2 completed

---

## 📚 What You'll Learn in This Part

1. PostgreSQL basics for beginners
2. Understanding database schemas
3. Creating Task table with SQL
4. Running PostgreSQL in Docker
5. Connecting Spring Boot to PostgreSQL
6. Testing database connection
7. Creating seed data

---

## 🎯 What We'll Build

By the end of this part, you'll have:
- PostgreSQL running in Docker container
- Task table created in database
- Spring Boot connected to PostgreSQL
- Sample data loaded
- Ability to query database

---

## 📖 PostgreSQL Basics (Simple Explanation)

### What is PostgreSQL?

**PostgreSQL** (often called "Postgres") is a database that stores your application data.

**Think of it like:**
- Excel spreadsheet (but much more powerful)
- Filing cabinet with organized drawers
- Library where you store and retrieve information

### Why PostgreSQL?

- ✅ Free and open source
- ✅ Reliable and battle-tested
- ✅ Works great with Spring Boot
- ✅ Easy to run in Docker
- ✅ Industry standard

### Database Concepts

**Database:** Container for all your data  
**Table:** Like a spreadsheet with rows and columns  
**Column:** A field (e.g., "title", "status")  
**Row:** A record (e.g., one task)  
**Primary Key:** Unique identifier for each row  

**Example:**

```
Tasks Table:
┌────┬─────────────┬────────┬──────────┐
│ id │    title    │ status │ priority │
├────┼─────────────┼────────┼──────────┤
│ 1  │ Buy milk    │ DONE   │ HIGH     │
│ 2  │ Study Docker│ PENDING│ MEDIUM   │
│ 3  │ Write code  │ PENDING│ HIGH     │
└────┴─────────────┴────────┴──────────┘
```

---

## 🗄️ Step 1: Design Database Schema

### Create Database Schema File

**File:** `task-manager-docker/database/init.sql`

```sql
-- =====================================================================
-- Task Manager Database Schema
-- =====================================================================
-- This script creates the database structure for our task manager app

-- Create database (Docker will handle this)
-- CREATE DATABASE task_manager_db;

-- Connect to the database
-- \c task_manager_db;

-- =====================================================================
-- Create Tasks Table
-- =====================================================================

CREATE TABLE IF NOT EXISTS tasks (
    -- Primary key (unique ID for each task)
    id BIGSERIAL PRIMARY KEY,
    
    -- Task information
    title VARCHAR(255) NOT NULL,           -- Task title (required)
    description TEXT,                      -- Longer description (optional)
    status VARCHAR(50) DEFAULT 'PENDING',  -- PENDING, IN_PROGRESS, COMPLETED
    priority VARCHAR(50) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- Create Indexes (makes queries faster)
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);

-- =====================================================================
-- Add Comments (documentation)
-- =====================================================================

COMMENT ON TABLE tasks IS 'Stores all user tasks/todos';
COMMENT ON COLUMN tasks.id IS 'Unique identifier for each task';
COMMENT ON COLUMN tasks.title IS 'Short title/name of the task';
COMMENT ON COLUMN tasks.status IS 'Current status: PENDING, IN_PROGRESS, or COMPLETED';
COMMENT ON COLUMN tasks.priority IS 'Task priority: LOW, MEDIUM, or HIGH';

-- =====================================================================
-- Success Message
-- =====================================================================

SELECT 'Database schema created successfully!' AS message;
```

**Understanding the schema:**

- `BIGSERIAL` - Auto-incrementing number (1, 2, 3, ...)
- `PRIMARY KEY` - Unique identifier
- `VARCHAR(255)` - Text up to 255 characters
- `TEXT` - Unlimited text
- `NOT NULL` - Required field
- `DEFAULT` - Default value if not provided
- `TIMESTAMP` - Date and time

### Create Seed Data File

**File:** `task-manager-docker/database/seed.sql`

```sql
-- =====================================================================
-- Sample Data for Development
-- =====================================================================

-- Insert sample tasks
INSERT INTO tasks (title, description, status, priority) VALUES
('Setup Development Environment', 'Install Docker, Node.js, Java, and VS Code', 'COMPLETED', 'HIGH'),
('Learn Docker Basics', 'Complete Docker tutorial and run first container', 'COMPLETED', 'HIGH'),
('Create Project Structure', 'Initialize React and Spring Boot projects', 'COMPLETED', 'MEDIUM'),
('Setup Database', 'Configure PostgreSQL with Docker', 'IN_PROGRESS', 'HIGH'),
('Build Backend API', 'Create REST endpoints for CRUD operations', 'PENDING', 'HIGH'),
('Design Frontend UI', 'Create React components for task management', 'PENDING', 'MEDIUM'),
('Write Tests', 'Add unit and integration tests', 'PENDING', 'MEDIUM'),
('Deploy to Production', 'Deploy app to Vercel, Render, and Neon', 'PENDING', 'LOW');

-- Show inserted data
SELECT 'Sample data inserted successfully!' AS message;
SELECT COUNT(*) AS total_tasks FROM tasks;
```

---

## 🐳 Step 2: Run PostgreSQL in Docker

### Pull PostgreSQL Image

```bash
# In task-manager-docker folder
docker pull postgres:15-alpine
```

**Expected output:**
```
15-alpine: Pulling from library/postgres
...
Status: Downloaded newer image for postgres:15-alpine
```

**What this does:**
- Downloads PostgreSQL version 15
- Alpine variant (smaller, faster)
- Image size: ~80MB

### Run PostgreSQL Container

```bash
docker run -d \
  --name task-manager-db \
  -e POSTGRES_DB=task_manager_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres123 \
  -p 5432:5432 \
  -v $(pwd)/database:/docker-entrypoint-initdb.d \
  postgres:15-alpine
```

**On Windows PowerShell:**
```powershell
docker run -d `
  --name task-manager-db `
  -e POSTGRES_DB=task_manager_db `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_PASSWORD=postgres123 `
  -p 5432:5432 `
  -v ${PWD}/database:/docker-entrypoint-initdb.d `
  postgres:15-alpine
```

**Command explanation:**
- `-d` - Run in background (detached)
- `--name` - Give it a friendly name
- `-e` - Set environment variables
- `-p 5432:5432` - Map port (host:container)
- `-v` - Mount volume (share files)
- `postgres:15-alpine` - Image to use

**Expected output:**
```
abc123def456... (container ID)
```

### Verify Container is Running

```bash
docker ps
```

**Expected output:**
```
CONTAINER ID   IMAGE                COMMAND                  STATUS         PORTS                    NAMES
abc123def456   postgres:15-alpine   "docker-entrypoint.s…"   Up 5 seconds   0.0.0.0:5432->5432/tcp   task-manager-db
```

**✅ PostgreSQL is running!**

### View Container Logs

```bash
docker logs task-manager-db
```

**Expected output:**
```
...
PostgreSQL init process complete; ready for start up.
...
database system is ready to accept connections
```

---

## 🔍 Step 3: Connect to Database

### Install PostgreSQL Client (Optional)

**Windows:**
- Download from: https://www.postgresql.org/download/windows/
- Or use Docker (shown below)

**macOS:**
```bash
brew install postgresql
```

**Linux:**
```bash
sudo apt-get install postgresql-client
```

### Connect Using Docker

```bash
docker exec -it task-manager-db psql -U postgres -d task_manager_db
```

**Expected output:**
```
psql (15.x)
Type "help" for help.

task_manager_db=#
```

**✅ You're connected to the database!**

### Verify Tables

Inside psql, run:

```sql
-- List all tables
\dt
```

**Expected output:**
```
         List of relations
 Schema | Name  | Type  |  Owner
--------+-------+-------+----------
 public | tasks | table | postgres
```

### Query Sample Data

```sql
-- Show all tasks
SELECT * FROM tasks;
```

**Expected output:**
```
 id |              title              | status |  priority
----+---------------------------------+--------+-----------
  1 | Setup Development Environment   | COMPLETED | HIGH
  2 | Learn Docker Basics             | COMPLETED | HIGH
  3 | Create Project Structure        | COMPLETED | MEDIUM
  ...
```

**✅ Sample data is loaded!**

### Exit psql

```sql
\q
```

---

## ☕ Step 4: Configure Spring Boot

### Update application.properties

**File:** `backend/src/main/resources/application.properties`

```properties
# =====================================================================
# Spring Boot Application Configuration
# =====================================================================

# Application name
spring.application.name=task-manager-backend

# =====================================================================
# Database Configuration (PostgreSQL)
# =====================================================================

# JDBC connection URL
spring.datasource.url=jdbc:postgresql://localhost:5432/task_manager_db

# Database credentials
spring.datasource.username=postgres
spring.datasource.password=postgres123

# PostgreSQL driver
spring.datasource.driver-class-name=org.postgresql.Driver

# =====================================================================
# JPA / Hibernate Configuration
# =====================================================================

# Show SQL queries in console (useful for development)
spring.jpa.show-sql=true

# Format SQL queries for readability
spring.jpa.properties.hibernate.format_sql=true

# DDL mode (IMPORTANT!)
# - validate: Check schema matches entities (recommended for production)
# - update: Update schema automatically (development only)
# - create: Create schema on startup (development only, deletes data!)
# - create-drop: Create on startup, drop on shutdown (testing only)
spring.jpa.hibernate.ddl-auto=validate

# Hibernate dialect for PostgreSQL
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# =====================================================================
# Server Configuration
# =====================================================================

# Server port
server.port=8080

# =====================================================================
# Logging
# =====================================================================

# Log levels
logging.level.root=INFO
logging.level.com.taskmanager=DEBUG
logging.level.org.hibernate.SQL=DEBUG
```

---

## 📦 Step 5: Create Task Entity

### Create Task Entity Class

**File:** `backend/src/main/java/com/taskmanager/model/Task.java`

```java
package com.taskmanager.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Task Entity - Represents a task in the database
 * 
 * This class maps to the 'tasks' table in PostgreSQL
 */
@Entity
@Table(name = "tasks")
@Data                    // Lombok: Generates getters, setters, toString, etc.
@NoArgsConstructor       // Lombok: Generates no-args constructor
@AllArgsConstructor      // Lombok: Generates all-args constructor
public class Task {

    /**
     * Primary Key - Auto-generated ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Task title (required)
     */
    @Column(nullable = false, length = 255)
    private String title;

    /**
     * Task description (optional)
     */
    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * Task status: PENDING, IN_PROGRESS, COMPLETED
     */
    @Column(length = 50)
    private String status = "PENDING";

    /**
     * Task priority: LOW, MEDIUM, HIGH
     */
    @Column(length = 50)
    private String priority = "MEDIUM";

    /**
     * When the task was created
     */
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    /**
     * When the task was last updated
     */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Set timestamps before saving to database
     */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    /**
     * Update timestamp before updating in database
     */
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

**Understanding the annotations:**

- `@Entity` - This is a database table
- `@Table(name = "tasks")` - Table name in database
- `@Id` - Primary key
- `@GeneratedValue` - Auto-increment
- `@Column` - Column configuration
- `@Data` - Lombok generates getters/setters
- `@PrePersist` - Run before saving
- `@PreUpdate` - Run before updating

---

## 🔌 Step 6: Test Database Connection

### Start Spring Boot

```bash
cd backend
./mvnw spring-boot:run
# On Windows: mvnw.cmd spring-boot:run
```

**Expected output:**
```
...
Hibernate: 
    SELECT ... FROM tasks
...
Started TaskManagerBackendApplication in 3.456 seconds
```

**✅ If you see SQL queries, Spring Boot connected to PostgreSQL!**

### Check Logs

Look for these lines:
```
HikariPool-1 - Starting...
HikariPool-1 - Start completed.
```

**This means connection pool is working!**

### Common Errors and Fixes

**Error:** `Connection refused`
```
Solution:
1. Check PostgreSQL container is running: docker ps
2. Check port 5432 is accessible
3. Verify database credentials in application.properties
```

**Error:** `Table 'tasks' doesn't exist`
```
Solution:
1. Connect to database: docker exec -it task-manager-db psql -U postgres -d task_manager_db
2. Run: \dt (should show 'tasks' table)
3. If missing, run init.sql manually
```

---

## 🧪 Step 7: Test Database Queries

### Using psql

```bash
# Connect to database
docker exec -it task-manager-db psql -U postgres -d task_manager_db
```

**Test queries:**

```sql
-- Count tasks
SELECT COUNT(*) FROM tasks;

-- Find pending tasks
SELECT * FROM tasks WHERE status = 'PENDING';

-- Find high priority tasks
SELECT * FROM tasks WHERE priority = 'HIGH';

-- Find recently created tasks
SELECT * FROM tasks ORDER BY created_at DESC LIMIT 3;

-- Update a task
UPDATE tasks SET status = 'IN_PROGRESS' WHERE id = 5;

-- Delete a task
DELETE FROM tasks WHERE id = 8;
```

---

## 📋 Database Commands Cheat Sheet

### Docker Commands

```bash
# Start database
docker start task-manager-db

# Stop database
docker stop task-manager-db

# View logs
docker logs task-manager-db

# View live logs
docker logs -f task-manager-db

# Connect to database
docker exec -it task-manager-db psql -U postgres -d task_manager_db

# Restart database
docker restart task-manager-db

# Remove database (⚠️ deletes all data!)
docker rm -f task-manager-db
```

### psql Commands

```sql
-- List databases
\l

-- List tables
\dt

-- Describe table structure
\d tasks

-- Show table with details
\d+ tasks

-- List indexes
\di

-- Quit psql
\q

-- Get help
\?
```

### SQL Commands

```sql
-- Select all
SELECT * FROM tasks;

-- Select specific columns
SELECT id, title, status FROM tasks;

-- Filter by condition
SELECT * FROM tasks WHERE status = 'PENDING';

-- Order results
SELECT * FROM tasks ORDER BY created_at DESC;

-- Limit results
SELECT * FROM tasks LIMIT 5;

-- Insert new record
INSERT INTO tasks (title, description, status, priority) 
VALUES ('New Task', 'Description here', 'PENDING', 'HIGH');

-- Update record
UPDATE tasks SET status = 'COMPLETED' WHERE id = 1;

-- Delete record
DELETE FROM tasks WHERE id = 1;

-- Count records
SELECT COUNT(*) FROM tasks;

-- Group by status
SELECT status, COUNT(*) FROM tasks GROUP BY status;
```

---

## ✅ Part 3 Checklist

- [ ] Created `database/init.sql` with schema
- [ ] Created `database/seed.sql` with sample data
- [ ] Pulled PostgreSQL Docker image
- [ ] Started PostgreSQL container
- [ ] Verified container is running
- [ ] Connected to database using psql
- [ ] Verified tables exist
- [ ] Saw sample data
- [ ] Created Task entity in Spring Boot
- [ ] Updated `application.properties`
- [ ] Started Spring Boot successfully
- [ ] Saw database connection in logs
- [ ] Tested SQL queries

---

## 🎓 Key Concepts Review

### What is a Database?
Storage system for application data

### What is PostgreSQL?
Open-source relational database

### What is Docker Volume?
Shared folder between host and container

### What is JPA?
Java Persistence API - connects Java to database

### What is Hibernate?
JPA implementation that generates SQL

---

## 🆘 Troubleshooting

### Container won't start

**Check ports:**
```bash
# See if port 5432 is in use
netstat -an | grep 5432  # Mac/Linux
netstat -an | findstr 5432  # Windows
```

**Kill existing process:**
```bash
# Find process ID
lsof -i :5432  # Mac/Linux

# Kill process
kill -9 [PID]
```

### Can't connect to database

**Verify credentials:**
- Username: postgres
- Password: postgres123
- Database: task_manager_db
- Port: 5432

**Check container logs:**
```bash
docker logs task-manager-db
```

### Spring Boot can't find table

**Rebuild database:**
```bash
# Stop and remove container
docker rm -f task-manager-db

# Start fresh container
docker run -d \
  --name task-manager-db \
  -e POSTGRES_DB=task_manager_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres123 \
  -p 5432:5432 \
  -v $(pwd)/database:/docker-entrypoint-initdb.d \
  postgres:15-alpine
```

---

## ✅ Part 3 Complete!

You now have:
- ✅ PostgreSQL running in Docker
- ✅ Database schema created
- ✅ Sample data loaded
- ✅ Spring Boot connected to database
- ✅ Task entity configured
- ✅ Able to query database

---

## 🚀 What's Next?

**Part 4: Backend Development (Spring Boot)**

In the next part, you'll:
- Create TaskRepository
- Create TaskService
- Create TaskController (REST API)
- Build Backend Dockerfile
- Test CRUD operations
- Run backend in Docker

**Time:** 3-4 hours  
**Difficulty:** Medium

**Next:** [Part 4 - Backend Development](./DOCKER_FULLSTACK_PART_4_BACKEND.md)

---

*Great job! Your database is ready. Time to build the REST API!* 🎉


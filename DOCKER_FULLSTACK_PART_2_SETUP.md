# 🚀 Part 2: Project Setup & Folder Structure
## Creating the Perfect Project Foundation

**Time Required:** 30 minutes  
**Difficulty:** Easy  
**Prerequisites:** Part 1 completed

---

## 📚 What You'll Learn in This Part

1. Creating the perfect folder structure
2. Initializing React frontend with Vite
3. Initializing Spring Boot backend
4. Setting up Git repository
5. Understanding project organization
6. Creating basic configuration files

---

## 🎯 Final Folder Structure

By the end of this part, you'll have:

```
task-manager-docker/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   └── test/
│   ├── pom.xml
│   ├── .gitignore
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── .gitignore
│   └── README.md
│
├── database/
│   └── init.sql
│
├── .gitignore
└── README.md
```

---

## 📂 Step 1: Create Project Root

### Create Main Project Folder

Open terminal/command prompt and run:

```bash
# Create project folder
mkdir task-manager-docker

# Navigate into it
cd task-manager-docker

# Verify you're in the right place
pwd  # On Windows: cd
```

**Expected output:**
```
/path/to/task-manager-docker
```

**✅ You're now in your project root!**

---

## 🎨 Step 2: Initialize Frontend (React + Vite)

### What is Vite?

**Vite** is a modern build tool for React that's:
- ⚡ Super fast (instant server start)
- 🔥 Hot Module Replacement (changes show immediately)
- 📦 Optimized builds
- 🎯 Better than Create React App

### Create React App with Vite

```bash
# Still in task-manager-docker folder
npm create vite@latest frontend -- --template react
```

**What this command does:**
- `npm create vite@latest` - Use Vite to create project
- `frontend` - Name of the folder
- `--template react` - Use React template

**Expected output:**
```
Scaffolding project in /path/to/task-manager-docker/frontend...

Done. Now run:

  cd frontend
  npm install
  npm run dev
```

### Install Frontend Dependencies

```bash
cd frontend
npm install
```

**This will take 1-2 minutes.**

**Expected output:**
```
added 200+ packages in 45s
```

### Test Frontend Works

```bash
npm run dev
```

**Expected output:**
```
  VITE v5.0.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Open browser:** http://localhost:5173

**You should see:** Vite + React welcome page with a counter button

**✅ Frontend is working!**

**Stop the server:** Press `Ctrl + C` in terminal

### Navigate Back to Project Root

```bash
cd ..
pwd  # Should show task-manager-docker
```

---

## ☕ Step 3: Initialize Backend (Spring Boot)

### Option A: Using Spring Initializr (Recommended for Beginners)

1. **Go to:** https://start.spring.io

2. **Configure Project:**
   - Project: **Maven**
   - Language: **Java**
   - Spring Boot: **3.2.1** (or latest 3.x)
   - Group: **com.taskmanager**
   - Artifact: **task-manager-backend**
   - Name: **Task Manager Backend**
   - Package name: **com.taskmanager**
   - Packaging: **Jar**
   - Java: **17**

3. **Add Dependencies** (click "Add Dependencies" button):
   - Spring Web
   - Spring Data JPA
   - PostgreSQL Driver
   - Lombok
   - Spring Boot DevTools

4. **Click "Generate"**
   - Downloads a ZIP file

5. **Extract ZIP:**
   - Extract to a temporary location
   - Copy contents to `task-manager-docker/backend/`

### Option B: Using Command Line (Advanced)

```bash
# Still in task-manager-docker folder
curl https://start.spring.io/starter.zip \
  -d dependencies=web,data-jpa,postgresql,lombok,devtools \
  -d type=maven-project \
  -d language=java \
  -d bootVersion=3.2.1 \
  -d baseDir=backend \
  -d groupId=com.taskmanager \
  -d artifactId=task-manager-backend \
  -d name=task-manager-backend \
  -d packageName=com.taskmanager \
  -d javaVersion=17 \
  -o backend.zip

# Extract
unzip backend.zip
rm backend.zip
```

### Verify Backend Structure

```bash
cd backend
ls -la  # On Windows: dir
```

**Expected output:**
```
pom.xml
src/
  main/
    java/
      com/
        taskmanager/
          TaskManagerBackendApplication.java
    resources/
      application.properties
  test/
mvnw
mvnw.cmd
.mvn/
```

### Test Backend Works

```bash
# Build the project
./mvnw clean install
# On Windows: mvnw.cmd clean install
```

**This will take 2-3 minutes (downloads dependencies).**

**Expected output:**
```
[INFO] BUILD SUCCESS
[INFO] Total time: 45.3 s
```

**✅ Backend is initialized!**

### Navigate Back to Project Root

```bash
cd ..
```

---

## 🗄️ Step 4: Create Database Folder

```bash
# In task-manager-docker folder
mkdir database
```

### Create Initial SQL Script

```bash
# Create init.sql file
# On Windows, you can create this in VS Code
```

**File:** `database/init.sql`

```sql
-- Task Manager Database Initialization Script

-- Create database (this will be handled by Docker later)
-- CREATE DATABASE task_manager;

-- For now, this file is a placeholder
-- We'll add table schemas in Part 3

SELECT 'Database initialization placeholder' AS message;
```

---

## 📝 Step 5: Create Project README

### Create Main README.md

**File:** `task-manager-docker/README.md`

```markdown
# Task Manager Application

Full-stack CRUD application built with Docker, React, Spring Boot, and PostgreSQL.

## Tech Stack

- **Frontend:** React 18 + Vite
- **Backend:** Spring Boot 3.2 + Java 17
- **Database:** PostgreSQL 15
- **Containerization:** Docker + Docker Compose

## Project Structure

```
task-manager-docker/
├── backend/        # Spring Boot REST API
├── frontend/       # React UI
├── database/       # SQL scripts
└── docker-compose.yml
```

## Getting Started

### Prerequisites

- Docker Desktop
- Node.js 18+
- Java 17+
- Git

### Local Development

Coming soon...

### Deployment

Coming soon...

## License

MIT
```

---

## 🔧 Step 6: Initialize Git Repository

### Create .gitignore

**File:** `task-manager-docker/.gitignore`

```
# Environment variables
.env
.env.local
.env.*.local

# Dependencies
node_modules/
target/

# Build outputs
dist/
build/
*.log

# IDE
.idea/
.vscode/
*.iml
*.iws

# OS
.DS_Store
Thumbs.db
```

### Initialize Git

```bash
# In task-manager-docker folder
git init
```

**Expected output:**
```
Initialized empty Git repository in /path/to/task-manager-docker/.git/
```

### Create Initial Commit

```bash
# Add all files
git add .

# Create first commit
git commit -m "Initial project setup"
```

**Expected output:**
```
[main (root-commit) abc1234] Initial project setup
 XX files changed, XXX insertions(+)
```

**✅ Git repository initialized!**

---

## 📁 Step 7: Organize Frontend Structure

### Create Additional Folders

```bash
cd frontend/src

# Create components folder
mkdir components

# Create services folder
mkdir services

cd ../..
```

### Create Placeholder Files

**File:** `frontend/src/components/.gitkeep`
```
# This file keeps the folder in git
```

**File:** `frontend/src/services/.gitkeep`
```
# This file keeps the folder in git
```

---

## 📁 Step 8: Organize Backend Structure

### Navigate to Backend Java Source

```bash
cd backend/src/main/java/com/taskmanager
```

### Create Package Folders

```bash
# Create package folders
mkdir controller
mkdir model  
mkdir repository
mkdir service
mkdir dto
mkdir exception
```

### Create Placeholder Files

**File:** `backend/src/main/java/com/taskmanager/controller/.gitkeep`
```
// Package placeholder
```

Repeat for model, repository, service, dto, and exception folders.

### Navigate Back

```bash
cd ../../../../../../  # Back to project root
```

---

## ✅ Step 9: Verify Project Structure

### Check Complete Structure

```bash
# In task-manager-docker folder
tree -L 3  # On Windows: use 'dir /s' or File Explorer
```

**Expected structure:**

```
task-manager-docker/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/taskmanager/
│   │   │   │   ├── controller/
│   │   │   │   ├── model/
│   │   │   │   ├── repository/
│   │   │   │   ├── service/
│   │   │   │   ├── dto/
│   │   │   │   ├── exception/
│   │   │   │   └── TaskManagerBackendApplication.java
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   ├── pom.xml
│   ├── mvnw
│   └── .mvn/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── database/
│   └── init.sql
├── .gitignore
└── README.md
```

**✅ Perfect structure created!**

---

## 🎓 Understanding What We Built

### Frontend (React + Vite)

**Key Files:**
- `package.json` - Lists dependencies (like requirements.txt in Python)
- `vite.config.js` - Build tool configuration
- `src/main.jsx` - Entry point (starts React)
- `src/App.jsx` - Main React component
- `src/components/` - Reusable UI components (we'll create these)
- `src/services/` - API communication code

**What Happens:**
1. `npm run dev` starts Vite development server
2. Vite compiles React code
3. Browser shows the UI
4. Hot reload: Changes show instantly!

### Backend (Spring Boot)

**Key Files:**
- `pom.xml` - Maven configuration (like package.json for Java)
- `TaskManagerBackendApplication.java` - Entry point
- `application.properties` - Configuration
- `controller/` - REST API endpoints (routes)
- `model/` - Database entities (tables)
- `repository/` - Database queries
- `service/` - Business logic

**What Happens:**
1. `./mvnw spring-boot:run` starts Spring Boot
2. Spring Boot starts embedded Tomcat server
3. Server listens on port 8080
4. Ready to handle API requests!

### Database Folder

**Purpose:**
- Store SQL scripts
- Database initialization
- Seed data
- Migrations

---

## 🔧 Configuration Files Explained

### Frontend: package.json

```json
{
  "name": "frontend",
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",              // Start development server
    "build": "vite build",      // Build for production
    "preview": "vite preview"   // Preview production build
  },
  "dependencies": {
    "react": "^18.2.0",         // React library
    "react-dom": "^18.2.0"      // React DOM renderer
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",  // Vite React plugin
    "vite": "^5.0.0"                   // Vite build tool
  }
}
```

### Backend: pom.xml (excerpt)

```xml
<dependencies>
    <!-- Spring Boot Web (REST API) -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- Spring Data JPA (Database) -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    
    <!-- PostgreSQL Driver -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>
</dependencies>
```

---

## 📋 Project Setup Checklist

- [ ] Created task-manager-docker folder
- [ ] Initialized frontend with Vite
- [ ] Installed frontend dependencies
- [ ] Tested frontend runs (http://localhost:5173)
- [ ] Initialized Spring Boot backend
- [ ] Built backend successfully
- [ ] Created database folder
- [ ] Created project README.md
- [ ] Initialized Git repository
- [ ] Created .gitignore
- [ ] Made initial commit
- [ ] Created frontend folder structure
- [ ] Created backend package structure
- [ ] Verified complete project structure

---

## 🎯 Quick Commands Reference

### Frontend Commands

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend Commands

```bash
cd backend

# Install dependencies & build
./mvnw clean install

# Run application
./mvnw spring-boot:run

# Run tests
./mvnw test

# Package as JAR
./mvnw package
```

### Git Commands

```bash
# Check status
git status

# Add files
git add .

# Commit
git commit -m "Your message"

# View history
git log --oneline
```

---

## 🆘 Troubleshooting

### Frontend Issues

**Issue:** `npm: command not found`
**Solution:** Install Node.js (Part 1)

**Issue:** Port 5173 already in use
**Solution:** Kill process or use different port:
```bash
npm run dev -- --port 3000
```

**Issue:** `EACCES` permission error
**Solution:** 
```bash
sudo chown -R $USER ~/.npm
```

### Backend Issues

**Issue:** `./mvnw: command not found`
**Solution:** On Windows use `mvnw.cmd`

**Issue:** `JAVA_HOME not set`
**Solution:** Set JAVA_HOME environment variable:
```bash
export JAVA_HOME=/path/to/java
```

**Issue:** Build fails with dependency errors
**Solution:** Clear Maven cache:
```bash
rm -rf ~/.m2/repository
./mvnw clean install
```

---

## 🎓 Key Concepts Review

### What is a Package Manager?

**Frontend (npm):**
- Manages JavaScript libraries
- package.json lists dependencies
- node_modules/ stores downloaded packages

**Backend (Maven):**
- Manages Java libraries
- pom.xml lists dependencies  
- Downloads from Maven Central

### What is a Build Tool?

**Vite (Frontend):**
- Bundles JavaScript files
- Optimizes for production
- Provides development server

**Maven (Backend):**
- Compiles Java code
- Runs tests
- Packages as JAR file

---

## ✅ Part 2 Complete!

You now have:
- ✅ Complete project structure
- ✅ React frontend initialized
- ✅ Spring Boot backend initialized
- ✅ Git repository setup
- ✅ All folders organized
- ✅ Ready for development

---

## 🚀 What's Next?

**Part 3: Database with PostgreSQL & Docker**

In the next part, you'll:
- Understand PostgreSQL basics
- Create database schema
- Run PostgreSQL in Docker
- Connect backend to database
- Test database connection

**Time:** 1 hour  
**Difficulty:** Medium

**Next:** [Part 3 - Database Setup](./DOCKER_FULLSTACK_PART_3_DATABASE.md)

---

## 💡 Pro Tips

1. **Commit Often**
   - Commit after each working feature
   - Use meaningful commit messages

2. **Test Frequently**
   - Run frontend: `npm run dev`
   - Run backend: `./mvnw spring-boot:run`
   - Catch errors early!

3. **Keep Terminal Open**
   - One for frontend
   - One for backend
   - One for commands

4. **Use VS Code**
   - Open entire project folder
   - See all files in sidebar
   - Integrated terminal

---

*Great job! Your project foundation is solid. Time to add the database!* 🎉


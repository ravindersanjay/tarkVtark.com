# 🚀 Complete Full-Stack CRUD Application Guide
## React + Spring Boot + PostgreSQL - Production Ready

**Author:** Based on TarkVtark.com project learnings  
**Date:** January 2026  
**Level:** Beginner to Production  
**Time to Complete:** 8-12 hours

---

## Table of Contents

1. [Introduction & Prerequisites](#1-introduction--prerequisites)
2. [Project Setup & Folder Structure](#2-project-setup--folder-structure)
3. [Backend Development (Spring Boot)](#3-backend-development-spring-boot)
4. [Database Design & Setup (PostgreSQL)](#4-database-design--setup-postgresql)
5. [Frontend Development (React)](#5-frontend-development-react)
6. [Testing Strategy](#6-testing-strategy)
7. [Deployment](#7-deployment)
8. [Best Practices & Lessons Learned](#8-best-practices--lessons-learned)

---

## 1. Introduction & Prerequisites

### What We're Building

**Project:** Simple Task Management System (CRUD)

**Features:**
- ✅ Create, Read, Update, Delete tasks
- ✅ User authentication (Google OAuth)
- ✅ Real-time updates
- ✅ Production-ready deployment

**Tech Stack:**
- **Frontend:** React 18, Vite, Context API
- **Backend:** Spring Boot 3.2, Java 17
- **Database:** PostgreSQL 15
- **Authentication:** JWT + Google OAuth
- **Deployment:** Render.com (backend), Vercel (frontend)

### Prerequisites

**Required Knowledge:**
- ✅ JavaScript/TypeScript basics
- ✅ Java basics
- ✅ SQL fundamentals
- ✅ Git basics
- ✅ Terminal/Command line

**Tools to Install:**

```bash
# Check versions
node --version    # v18.0.0 or higher
npm --version     # v9.0.0 or higher
java --version    # 17 or higher
mvn --version     # 3.6.0 or higher
psql --version    # 15.0 or higher
git --version     # 2.0 or higher
```

**Installation Links:**
- Node.js: https://nodejs.org
- Java 17: https://adoptium.net
- Maven: https://maven.apache.org
- PostgreSQL: https://postgresql.org
- Git: https://git-scm.com
- VS Code: https://code.visualstudio.com

**VS Code Extensions:**
- Extension Pack for Java
- Spring Boot Extension Pack
- ESLint
- Prettier
- PostgreSQL (by Chris Kolkman)
- REST Client

---

## 2. Project Setup & Folder Structure

### 2.1 Create Project Root

```bash
# Create project directory
mkdir task-manager-app
cd task-manager-app

# Initialize git
git init

# Create .gitignore
cat > .gitignore << 'EOF'
# IDE
.idea/
.vscode/
*.iml
*.iws

# OS
.DS_Store
Thumbs.db

# Environment
.env
.env.local

# Dependencies
node_modules/
target/

# Build outputs
build/
dist/
*.log
EOF
```

### 2.2 Perfect Folder Structure

```
task-manager-app/
├── backend/                          # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/
│   │   │   │       └── taskmanager/
│   │   │   │           ├── TaskManagerApplication.java
│   │   │   │           ├── config/              # Configuration classes
│   │   │   │           │   ├── SecurityConfig.java
│   │   │   │           │   ├── CorsConfig.java
│   │   │   │           │   └── DatabaseConfig.java
│   │   │   │           ├── controller/          # REST Controllers
│   │   │   │           │   ├── TaskController.java
│   │   │   │           │   └── AuthController.java
│   │   │   │           ├── dto/                 # Data Transfer Objects
│   │   │   │           │   ├── TaskDTO.java
│   │   │   │           │   ├── CreateTaskRequest.java
│   │   │   │           │   ├── UpdateTaskRequest.java
│   │   │   │           │   └── LoginResponse.java
│   │   │   │           ├── model/               # Entity classes
│   │   │   │           │   ├── Task.java
│   │   │   │           │   └── User.java
│   │   │   │           ├── repository/          # Data access layer
│   │   │   │           │   ├── TaskRepository.java
│   │   │   │           │   └── UserRepository.java
│   │   │   │           ├── service/             # Business logic
│   │   │   │           │   ├── TaskService.java
│   │   │   │           │   └── AuthService.java
│   │   │   │           ├── exception/           # Custom exceptions
│   │   │   │           │   ├── TaskNotFoundException.java
│   │   │   │           │   └── GlobalExceptionHandler.java
│   │   │   │           └── util/                # Utility classes
│   │   │   │               └── JwtUtil.java
│   │   │   └── resources/
│   │   │       ├── application.yml              # Main config
│   │   │       ├── application-dev.yml          # Development config
│   │   │       └── application-prod.yml         # Production config
│   │   └── test/
│   │       └── java/
│   │           └── com/
│   │               └── taskmanager/
│   │                   ├── TaskControllerTest.java
│   │                   └── TaskServiceTest.java
│   ├── pom.xml                                  # Maven dependencies
│   ├── .env                                     # Environment variables
│   ├── mvnw                                     # Maven wrapper (Linux/Mac)
│   ├── mvnw.cmd                                 # Maven wrapper (Windows)
│   └── .mvn/                                    # Maven wrapper config
│
├── frontend/                         # React frontend
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/                          # React components
│   │   │   ├── TaskList.jsx
│   │   │   ├── TaskForm.jsx
│   │   │   ├── TaskItem.jsx
│   │   │   ├── LoginModal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── ErrorBoundary.jsx
│   │   ├── contexts/                            # React Context
│   │   │   └── AuthContext.jsx
│   │   ├── services/                            # API services
│   │   │   └── apiService.js
│   │   ├── utils/                               # Utility functions
│   │   │   └── helpers.js
│   │   ├── styles/                              # CSS files
│   │   │   ├── App.css
│   │   │   ├── TaskList.css
│   │   │   └── LoginModal.css
│   │   ├── App.jsx                              # Main app component
│   │   ├── main.jsx                             # Entry point
│   │   └── index.css                            # Global styles
│   ├── package.json                             # NPM dependencies
│   ├── vite.config.js                           # Vite configuration
│   ├── .env                                     # Environment variables
│   └── .env.example                             # Example env file
│
├── database/                         # Database scripts
│   ├── schema.sql                               # Database schema
│   ├── seed.sql                                 # Sample data
│   └── migrations/                              # Migration scripts
│       ├── V1__initial_schema.sql
│       └── V2__add_users_table.sql
│
├── docs/                             # Documentation
│   ├── API.md                                   # API documentation
│   ├── SETUP.md                                 # Setup instructions
│   └── DEPLOYMENT.md                            # Deployment guide
│
├── .gitignore                        # Git ignore file
├── README.md                         # Project documentation
└── docker-compose.yml                # Docker setup (optional)
```

### 2.3 Initialize Backend (Spring Boot)

```bash
# Navigate to project root
cd task-manager-app

# Create backend using Spring Initializr
mkdir backend
cd backend

# Create pom.xml
cat > pom.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
        <relativePath/>
    </parent>

    <groupId>com.taskmanager</groupId>
    <artifactId>task-manager-backend</artifactId>
    <version>1.0.0</version>
    <name>Task Manager Backend</name>
    <description>Backend API for Task Manager Application</description>

    <properties>
        <java.version>17</java.version>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <!-- Spring Boot Web -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- Spring Boot Data JPA -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>

        <!-- Spring Boot Validation -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <!-- Spring Boot Security -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>

        <!-- PostgreSQL Driver -->
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- Lombok (reduces boilerplate) -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>

        <!-- JWT Support -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.11.5</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.11.5</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.11.5</version>
            <scope>runtime</scope>
        </dependency>

        <!-- Google OAuth Client -->
        <dependency>
            <groupId>com.google.api-client</groupId>
            <artifactId>google-api-client</artifactId>
            <version>2.2.0</version>
        </dependency>

        <!-- Spring Boot DevTools (hot reload) -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-devtools</artifactId>
            <scope>runtime</scope>
            <optional>true</optional>
        </dependency>

        <!-- Spring Boot Test -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>

</project>
EOF

# Generate Maven Wrapper
mvn -N wrapper:wrapper

# Create .env file
cat > .env << 'EOF'
# Database Configuration
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/task_manager_db
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=your_password_here

# Server Configuration
SERVER_PORT=8080

# JWT Configuration
JWT_SECRET=TaskManager2026SecureJWTSecretKeyMinimum32CharactersLong
JWT_EXPIRATION_MS=86400000

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id_here

# Environment
SPRING_PROFILES_ACTIVE=dev
EOF
```

### 2.4 Initialize Frontend (React + Vite)

```bash
# Navigate to project root
cd ../

# Create React app with Vite
npm create vite@latest frontend -- --template react

# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Install additional packages
npm install @react-oauth/google

# Create .env file
cat > .env << 'EOF'
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
EOF

# Create .env.example
cat > .env.example << 'EOF'
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
EOF
```

### 2.5 Create Database Setup Scripts

```bash
# Navigate to project root
cd ../

# Create database directory
mkdir database

# Create schema.sql
cat > database/schema.sql << 'EOF'
-- =====================================================================
-- Task Manager Database Schema
-- =====================================================================

-- Create database (run as postgres superuser)
CREATE DATABASE task_manager_db;

-- Connect to database
\c task_manager_db;

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    google_id VARCHAR(255) UNIQUE,
    profile_picture VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    priority VARCHAR(50) DEFAULT 'MEDIUM',
    due_date TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_users_email ON users(email);

-- Comments
COMMENT ON TABLE users IS 'Application users authenticated via Google OAuth';
COMMENT ON TABLE tasks IS 'User tasks/todos';
COMMENT ON COLUMN tasks.status IS 'Task status: PENDING, IN_PROGRESS, COMPLETED';
COMMENT ON COLUMN tasks.priority IS 'Task priority: LOW, MEDIUM, HIGH';
EOF

# Create seed.sql
cat > database/seed.sql << 'EOF'
-- =====================================================================
-- Sample Data for Development
-- =====================================================================

-- Insert sample user (replace with real data after authentication)
INSERT INTO users (id, email, name, google_id, is_active) VALUES
('00000000-0000-0000-0000-000000000001', 'demo@example.com', 'Demo User', 'demo-google-id', true);

-- Insert sample tasks
INSERT INTO tasks (title, description, status, priority, due_date, created_by) VALUES
('Setup Development Environment', 'Install all required tools and dependencies', 'COMPLETED', 'HIGH', CURRENT_TIMESTAMP + INTERVAL '1 day', '00000000-0000-0000-0000-000000000001'),
('Create Database Schema', 'Design and implement database tables', 'COMPLETED', 'HIGH', CURRENT_TIMESTAMP + INTERVAL '2 days', '00000000-0000-0000-0000-000000000001'),
('Build Backend API', 'Implement REST API endpoints', 'IN_PROGRESS', 'HIGH', CURRENT_TIMESTAMP + INTERVAL '5 days', '00000000-0000-0000-0000-000000000001'),
('Design Frontend UI', 'Create React components', 'PENDING', 'MEDIUM', CURRENT_TIMESTAMP + INTERVAL '7 days', '00000000-0000-0000-0000-000000000001'),
('Deploy to Production', 'Deploy backend and frontend', 'PENDING', 'MEDIUM', CURRENT_TIMESTAMP + INTERVAL '10 days', '00000000-0000-0000-0000-000000000001');
EOF
```

### 2.6 Create README.md

```bash
# Navigate to project root
cd ../

cat > README.md << 'EOF'
# Task Manager Application

Full-stack CRUD application built with React, Spring Boot, and PostgreSQL.

## Tech Stack

- **Frontend:** React 18 + Vite
- **Backend:** Spring Boot 3.2 + Java 17
- **Database:** PostgreSQL 15
- **Authentication:** JWT + Google OAuth

## Quick Start

### Prerequisites
- Node.js 18+
- Java 17+
- Maven 3.6+
- PostgreSQL 15+

### Setup

1. **Clone repository**
   ```bash
   git clone <your-repo-url>
   cd task-manager-app
   ```

2. **Setup Database**
   ```bash
   psql -U postgres -f database/schema.sql
   psql -U postgres -d task_manager_db -f database/seed.sql
   ```

3. **Backend Setup**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your database credentials
   ./mvnw spring-boot:run
   ```

4. **Frontend Setup**
   ```bash
   cd frontend
   cp .env.example .env
   # Edit .env if needed
   npm install
   npm run dev
   ```

5. **Access Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080/api/v1

## Documentation

- [Setup Guide](docs/SETUP.md)
- [API Documentation](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## License

MIT
EOF
```

---

**✅ Checkpoint 1: Project Structure Created**

You should now have:
- ✅ Perfect folder structure
- ✅ Backend initialized with Spring Boot
- ✅ Frontend initialized with React + Vite
- ✅ Database scripts ready
- ✅ README.md created

**Next:** We'll build the backend layer by layer.

---

*This is Part 1 of the guide. Continue to the next section for Backend Development.*


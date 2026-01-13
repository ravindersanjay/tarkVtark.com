# 🚀 Part 4: Backend Development (Spring Boot)
## Building the REST API with Docker

**Time Required:** 3-4 hours  
**Difficulty:** Medium  
**Prerequisites:** Parts 1, 2, and 3 completed

---

## 📚 What You'll Learn in This Part

1. Creating TaskRepository (Spring Data JPA)
2. Creating TaskService (business logic)
3. Creating TaskController (REST API)
4. Complete CRUD operations
5. Creating Backend Dockerfile
6. Building Docker image for backend
7. Running backend in Docker
8. Testing API endpoints

---

## 🎯 What We'll Build

By the end of this part, you'll have:
- Complete REST API for task management
- Backend running in Docker container
- Tested CRUD endpoints
- Production-ready backend

---

## 📦 Step 1: Create TaskRepository

### What is a Repository?

A **Repository** is a layer that handles database operations. Spring Data JPA auto-generates SQL queries for you!

**Think of it as:** A librarian who knows how to find, add, update, and remove books.

### Create Repository Interface

**File:** `backend/src/main/java/com/taskmanager/repository/TaskRepository.java`

```java
package com.taskmanager.repository;

import com.taskmanager.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Task Repository - Database operations for tasks
 * 
 * Spring Data JPA automatically implements these methods!
 * No need to write SQL manually.
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    /**
     * Find all tasks by status
     * Spring generates SQL: SELECT * FROM tasks WHERE status = ?
     */
    List<Task> findByStatus(String status);

    /**
     * Find all tasks by priority
     * Spring generates SQL: SELECT * FROM tasks WHERE priority = ?
     */
    List<Task> findByPriority(String priority);

    /**
     * Find all tasks ordered by created date (newest first)
     * Spring generates SQL: SELECT * FROM tasks ORDER BY created_at DESC
     */
    List<Task> findAllByOrderByCreatedAtDesc();

    /**
     * Find tasks by title containing keyword (case-insensitive)
     * Spring generates SQL: SELECT * FROM tasks WHERE LOWER(title) LIKE %keyword%
     */
    List<Task> findByTitleContainingIgnoreCase(String keyword);

    /**
     * Count tasks by status
     * Spring generates SQL: SELECT COUNT(*) FROM tasks WHERE status = ?
     */
    long countByStatus(String status);
}
```

**Magic of Spring Data JPA:**
- Just declare method names following naming convention
- Spring automatically generates SQL
- No boilerplate code!

---

## 🔧 Step 2: Create TaskService

### What is a Service?

A **Service** contains business logic. It sits between Controller and Repository.

**Think of it as:** A manager who makes decisions and coordinates work.

### Create Service Class

**File:** `backend/src/main/java/com/taskmanager/service/TaskService.java`

```java
package com.taskmanager.service;

import com.taskmanager.model.Task;
import com.taskmanager.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Task Service - Business logic for task operations
 * 
 * This layer handles the "what to do" logic
 */
@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    /**
     * Get all tasks (newest first)
     */
    public List<Task> getAllTasks() {
        return taskRepository.findAllByOrderByCreatedAtDesc();
    }

    /**
     * Get task by ID
     */
    public Optional<Task> getTaskById(Long id) {
        return taskRepository.findById(id);
    }

    /**
     * Create new task
     */
    public Task createTask(Task task) {
        // Set default values if not provided
        if (task.getStatus() == null || task.getStatus().isEmpty()) {
            task.setStatus("PENDING");
        }
        if (task.getPriority() == null || task.getPriority().isEmpty()) {
            task.setPriority("MEDIUM");
        }
        
        // Save to database
        return taskRepository.save(task);
    }

    /**
     * Update existing task
     */
    public Task updateTask(Long id, Task taskDetails) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));

        // Update fields
        task.setTitle(taskDetails.getTitle());
        task.setDescription(taskDetails.getDescription());
        task.setStatus(taskDetails.getStatus());
        task.setPriority(taskDetails.getPriority());
        task.setUpdatedAt(LocalDateTime.now());

        // Save changes
        return taskRepository.save(task);
    }

    /**
     * Delete task
     */
    public void deleteTask(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
        
        taskRepository.delete(task);
    }

    /**
     * Get tasks by status
     */
    public List<Task> getTasksByStatus(String status) {
        return taskRepository.findByStatus(status);
    }

    /**
     * Get tasks by priority
     */
    public List<Task> getTasksByPriority(String priority) {
        return taskRepository.findByPriority(priority);
    }

    /**
     * Search tasks by title
     */
    public List<Task> searchTasks(String keyword) {
        return taskRepository.findByTitleContainingIgnoreCase(keyword);
    }

    /**
     * Get task count by status
     */
    public long getTaskCountByStatus(String status) {
        return taskRepository.countByStatus(status);
    }
}
```

---

## 🌐 Step 3: Create TaskController (REST API)

### What is a Controller?

A **Controller** handles HTTP requests and returns responses.

**Think of it as:** A receptionist who receives requests and sends back responses.

### Create Controller Class

**File:** `backend/src/main/java/com/taskmanager/controller/TaskController.java`

```java
package com.taskmanager.controller;

import com.taskmanager.model.Task;
import com.taskmanager.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Task Controller - REST API endpoints
 * 
 * This handles HTTP requests from the frontend
 */
@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*") // Allow requests from any origin (for development)
public class TaskController {

    @Autowired
    private TaskService taskService;

    /**
     * GET /api/tasks - Get all tasks
     */
    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks() {
        List<Task> tasks = taskService.getAllTasks();
        return ResponseEntity.ok(tasks);
    }

    /**
     * GET /api/tasks/{id} - Get task by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getTaskById(@PathVariable Long id) {
        return taskService.getTaskById(id)
                .map(task -> ResponseEntity.ok(task))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(createErrorResponse("Task not found with id: " + id)));
    }

    /**
     * POST /api/tasks - Create new task
     */
    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody Task task) {
        Task createdTask = taskService.createTask(task);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTask);
    }

    /**
     * PUT /api/tasks/{id} - Update task
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(@PathVariable Long id, @RequestBody Task taskDetails) {
        try {
            Task updatedTask = taskService.updateTask(id, taskDetails);
            return ResponseEntity.ok(updatedTask);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * DELETE /api/tasks/{id} - Delete task
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable Long id) {
        try {
            taskService.deleteTask(id);
            return ResponseEntity.ok(createSuccessResponse("Task deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * GET /api/tasks/status/{status} - Get tasks by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Task>> getTasksByStatus(@PathVariable String status) {
        List<Task> tasks = taskService.getTasksByStatus(status);
        return ResponseEntity.ok(tasks);
    }

    /**
     * GET /api/tasks/priority/{priority} - Get tasks by priority
     */
    @GetMapping("/priority/{priority}")
    public ResponseEntity<List<Task>> getTasksByPriority(@PathVariable String priority) {
        List<Task> tasks = taskService.getTasksByPriority(priority);
        return ResponseEntity.ok(tasks);
    }

    /**
     * GET /api/tasks/search?keyword={keyword} - Search tasks
     */
    @GetMapping("/search")
    public ResponseEntity<List<Task>> searchTasks(@RequestParam String keyword) {
        List<Task> tasks = taskService.searchTasks(keyword);
        return ResponseEntity.ok(tasks);
    }

    /**
     * GET /api/tasks/stats - Get task statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getTaskStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", taskService.getAllTasks().size());
        stats.put("pending", taskService.getTaskCountByStatus("PENDING"));
        stats.put("inProgress", taskService.getTaskCountByStatus("IN_PROGRESS"));
        stats.put("completed", taskService.getTaskCountByStatus("COMPLETED"));
        
        return ResponseEntity.ok(stats);
    }

    // Helper methods
    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> response = new HashMap<>();
        response.put("error", message);
        return response;
    }

    private Map<String, String> createSuccessResponse(String message) {
        Map<String, String> response = new HashMap<>();
        response.put("message", message);
        return response;
    }
}
```

**REST API Endpoints Created:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/tasks | Get all tasks |
| GET | /api/tasks/{id} | Get task by ID |
| POST | /api/tasks | Create new task |
| PUT | /api/tasks/{id} | Update task |
| DELETE | /api/tasks/{id} | Delete task |
| GET | /api/tasks/status/{status} | Get by status |
| GET | /api/tasks/priority/{priority} | Get by priority |
| GET | /api/tasks/search?keyword=x | Search tasks |
| GET | /api/tasks/stats | Get statistics |

---

## 🧪 Step 4: Test Backend Locally

### Start Backend

```bash
cd backend
./mvnw spring-boot:run
# On Windows: mvnw.cmd spring-boot:run
```

**Expected output:**
```
...
Tomcat started on port(s): 8080 (http)
Started TaskManagerBackendApplication in 4.567 seconds
```

### Test with curl

**Create a task:**
```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Docker",
    "description": "Learn Docker containers",
    "status": "PENDING",
    "priority": "HIGH"
  }'
```

**Expected response:**
```json
{
  "id": 9,
  "title": "Test Docker",
  "description": "Learn Docker containers",
  "status": "PENDING",
  "priority": "HIGH",
  "createdAt": "2026-01-12T10:30:00",
  "updatedAt": "2026-01-12T10:30:00"
}
```

**Get all tasks:**
```bash
curl http://localhost:8080/api/tasks
```

**Get task by ID:**
```bash
curl http://localhost:8080/api/tasks/1
```

**Update task:**
```bash
curl -X PUT http://localhost:8080/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Task",
    "description": "Updated description",
    "status": "COMPLETED",
    "priority": "LOW"
  }'
```

**Delete task:**
```bash
curl -X DELETE http://localhost:8080/api/tasks/1
```

**Search tasks:**
```bash
curl http://localhost:8080/api/tasks/search?keyword=docker
```

**Get stats:**
```bash
curl http://localhost:8080/api/tasks/stats
```

**✅ If all work, your REST API is complete!**

---

## 🐳 Step 5: Create Backend Dockerfile

### What is Multi-Stage Build?

**Multi-stage build** = Build in one container, run in another

**Benefits:**
- Smaller final image
- Only includes runtime dependencies
- More secure

### Create Dockerfile

**File:** `backend/Dockerfile`

```dockerfile
# =====================================================================
# Multi-Stage Build for Spring Boot Backend
# =====================================================================

# Stage 1: Build
# Use Maven image to build the application
FROM maven:3.9-eclipse-temurin-17 AS build

# Set working directory
WORKDIR /app

# Copy pom.xml first (for dependency caching)
COPY pom.xml .

# Download dependencies (cached if pom.xml hasn't changed)
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application (skip tests for faster build)
RUN mvn clean package -DskipTests

# =====================================================================
# Stage 2: Runtime
# Use smaller JRE image to run the application
FROM eclipse-temurin:17-jre-alpine

# Set working directory
WORKDIR /app

# Copy jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Create non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/tasks/stats || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**Dockerfile explained:**

- **Stage 1 (build):**
  - Use Maven image
  - Copy pom.xml and download dependencies
  - Copy source code
  - Build JAR file

- **Stage 2 (runtime):**
  - Use smaller JRE image (not full JDK)
  - Copy only the JAR file
  - Create non-root user (security)
  - Run the application

**Size comparison:**
- With full JDK: ~500MB
- With multi-stage: ~200MB

### Create .dockerignore

**File:** `backend/.dockerignore`

```
target/
!target/*.jar
.mvn/
mvnw
mvnw.cmd
*.md
.git
.gitignore
```

---

## 🏗️ Step 6: Build Docker Image

### Build Image

```bash
# In task-manager-docker/backend folder
docker build -t task-manager-backend:latest .
```

**Expected output:**
```
[+] Building 45.3s (15/15) FINISHED
...
=> => naming to docker.io/library/task-manager-backend:latest
```

**This will take 2-3 minutes the first time.**

### Verify Image

```bash
docker images | grep task-manager-backend
```

**Expected output:**
```
task-manager-backend   latest   abc123def456   1 minute ago   205MB
```

**✅ Docker image created!**

---

## 🚀 Step 7: Run Backend in Docker

### Run Container

```bash
docker run -d \
  --name backend \
  --network host \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/task_manager_db \
  -e SPRING_DATASOURCE_USERNAME=postgres \
  -e SPRING_DATASOURCE_PASSWORD=postgres123 \
  task-manager-backend:latest
```

**Command explained:**
- `-d` - Run in background
- `--name backend` - Container name
- `--network host` - Use host network (can access localhost)
- `-e` - Environment variables
- `task-manager-backend:latest` - Image to use

### Check Container Status

```bash
docker ps
```

**Expected output:**
```
CONTAINER ID   IMAGE                         STATUS         PORTS      NAMES
xyz789abc123   task-manager-backend:latest   Up 10 seconds             backend
```

### View Logs

```bash
docker logs backend
```

**Expected output:**
```
...
Tomcat started on port(s): 8080 (http)
Started TaskManagerBackendApplication in 5.678 seconds
```

### Test API

```bash
curl http://localhost:8080/api/tasks
```

**✅ Backend is running in Docker!**

---

## 📋 Backend Commands Cheat Sheet

### Maven Commands

```bash
# Build project
./mvnw clean install

# Run application
./mvnw spring-boot:run

# Run tests
./mvnw test

# Package as JAR
./mvnw package
```

### Docker Commands

```bash
# Build image
docker build -t task-manager-backend:latest .

# Run container
docker run -d --name backend -p 8080:8080 task-manager-backend:latest

# Stop container
docker stop backend

# Start container
docker start backend

# View logs
docker logs backend

# View live logs
docker logs -f backend

# Execute command in container
docker exec -it backend sh

# Remove container
docker rm -f backend

# Remove image
docker rmi task-manager-backend:latest
```

---

## ✅ Part 4 Checklist

- [ ] Created TaskRepository.java
- [ ] Created TaskService.java
- [ ] Created TaskController.java
- [ ] Tested endpoints with curl
- [ ] All CRUD operations work
- [ ] Created backend Dockerfile
- [ ] Created .dockerignore
- [ ] Built Docker image
- [ ] Ran backend in Docker container
- [ ] Verified backend works in Docker
- [ ] Tested API from Docker container

---

## 🆘 Troubleshooting

### Build Fails

**Issue:** Maven build errors
```bash
# Clean build
./mvnw clean

# Rebuild
./mvnw clean install -U
```

### Container Won't Start

**Check logs:**
```bash
docker logs backend
```

**Common issues:**
- Database not running
- Wrong database URL
- Port 8080 already in use

### API Returns 404

**Verify URL:**
```bash
# Correct URL
http://localhost:8080/api/tasks

# Wrong URL (missing /api)
http://localhost:8080/tasks
```

### Database Connection Failed

**Check database container:**
```bash
docker ps | grep task-manager-db
```

**Restart database:**
```bash
docker restart task-manager-db
```

---

## ✅ Part 4 Complete!

You now have:
- ✅ Complete REST API with CRUD operations
- ✅ Repository, Service, and Controller layers
- ✅ Backend running in Docker
- ✅ All endpoints tested and working
- ✅ Production-ready backend

---

## 🚀 What's Next?

**Part 5: Frontend Development (React)**

In the next part, you'll:
- Create React components
- Connect to backend API
- Build user interface
- Create Frontend Dockerfile
- Run frontend in Docker

**Time:** 2-3 hours  
**Difficulty:** Medium

**Next:** [Part 5 - Frontend Development](./DOCKER_FULLSTACK_PART_5_FRONTEND.md)

---

*Excellent work! Your backend is Dockerized and ready. Time to build the UI!* 🎉


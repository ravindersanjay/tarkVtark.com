# 🚀 Complete Full-Stack CRUD Application Guide - Part 2
## Backend Development (Spring Boot)

---

## 3. Backend Development (Spring Boot)

### 3.1 Create Main Application Class

```bash
# Create package structure
cd backend
mkdir -p src/main/java/com/taskmanager
mkdir -p src/main/resources
```

**File:** `backend/src/main/java/com/taskmanager/TaskManagerApplication.java`

```java
package com.taskmanager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import io.github.cdimascio.dotenv.Dotenv;

/**
 * Main application class for Task Manager
 * Loads environment variables from .env file
 */
@SpringBootApplication
public class TaskManagerApplication {

    public static void main(String[] args) {
        // Load .env file for local development
        Dotenv dotenv = Dotenv.configure()
                .ignoreIfMissing()
                .load();
        
        dotenv.entries().forEach(entry -> {
            System.setProperty(entry.getKey(), entry.getValue());
        });

        SpringApplication.run(TaskManagerApplication.class, args);
    }
}
```

### 3.2 Create Configuration Files

**File:** `backend/src/main/resources/application.yml`

```yaml
spring:
  application:
    name: task-manager-backend

  # Database Configuration
  datasource:
    url: ${SPRING_DATASOURCE_URL}
    username: ${SPRING_DATASOURCE_USERNAME}
    password: ${SPRING_DATASOURCE_PASSWORD}
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      connection-timeout: 30000

  # JPA Configuration
  jpa:
    hibernate:
      ddl-auto: validate  # Never use 'create' or 'update' in production
      naming:
        physical-strategy: org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        jdbc:
          batch_size: 20

# Server Configuration
server:
  port: ${SERVER_PORT:8080}
  servlet:
    context-path: /api/v1

# Logging
logging:
  level:
    com.taskmanager: DEBUG
    org.springframework.web: INFO
    org.hibernate.SQL: DEBUG
```

**File:** `backend/src/main/resources/application-dev.yml`

```yaml
spring:
  jpa:
    show-sql: true
    properties:
      hibernate:
        format_sql: true

logging:
  level:
    com.taskmanager: DEBUG
```

**File:** `backend/src/main/resources/application-prod.yml`

```yaml
spring:
  jpa:
    show-sql: false

logging:
  level:
    com.taskmanager: INFO
    org.springframework.web: WARN
    org.hibernate.SQL: WARN
```

### 3.3 Create Entity Classes (Models)

**File:** `backend/src/main/java/com/taskmanager/model/User.java`

```java
package com.taskmanager.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "google_id", unique = true, length = 255)
    private String googleId;

    @Column(name = "profile_picture", length = 500)
    private String profilePicture;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (isActive == null) {
            isActive = true;
        }
    }
}
```

**File:** `backend/src/main/java/com/taskmanager/model/Task.java`

```java
package com.taskmanager.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tasks")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(length = 50, nullable = false)
    private TaskStatus status = TaskStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(length = 50, nullable = false)
    private TaskPriority priority = TaskPriority.MEDIUM;

    @Column(name = "due_date")
    private LocalDateTime dueDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Enums
    public enum TaskStatus {
        PENDING, IN_PROGRESS, COMPLETED
    }

    public enum TaskPriority {
        LOW, MEDIUM, HIGH
    }
}
```

### 3.4 Create DTOs (Data Transfer Objects)

**File:** `backend/src/main/java/com/taskmanager/dto/TaskDTO.java`

```java
package com.taskmanager.dto;

import com.taskmanager.model.Task;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskDTO {
    
    private UUID id;
    private String title;
    private String description;
    private String status;
    private String priority;
    private LocalDateTime dueDate;
    private String createdByName;
    private UUID createdById;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Convert Entity to DTO
    public static TaskDTO fromEntity(Task task) {
        TaskDTO dto = new TaskDTO();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setStatus(task.getStatus().name());
        dto.setPriority(task.getPriority().name());
        dto.setDueDate(task.getDueDate());
        dto.setCreatedByName(task.getCreatedBy().getName());
        dto.setCreatedById(task.getCreatedBy().getId());
        dto.setCreatedAt(task.getCreatedAt());
        dto.setUpdatedAt(task.getUpdatedAt());
        return dto;
    }
}
```

**File:** `backend/src/main/java/com/taskmanager/dto/CreateTaskRequest.java`

```java
package com.taskmanager.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateTaskRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 255, message = "Title must be between 3 and 255 characters")
    private String title;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    private String status; // PENDING, IN_PROGRESS, COMPLETED
    
    private String priority; // LOW, MEDIUM, HIGH
    
    private LocalDateTime dueDate;
}
```

**File:** `backend/src/main/java/com/taskmanager/dto/UpdateTaskRequest.java`

```java
package com.taskmanager.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTaskRequest {

    @Size(min = 3, max = 255, message = "Title must be between 3 and 255 characters")
    private String title;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    private String status;
    
    private String priority;
    
    private LocalDateTime dueDate;
}
```

### 3.5 Create Repositories

**File:** `backend/src/main/java/com/taskmanager/repository/UserRepository.java`

```java
package com.taskmanager.repository;

import com.taskmanager.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByGoogleId(String googleId);
    
    boolean existsByEmail(String email);
}
```

**File:** `backend/src/main/java/com/taskmanager/repository/TaskRepository.java`

```java
package com.taskmanager.repository;

import com.taskmanager.model.Task;
import com.taskmanager.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {
    
    // Find all tasks by user
    List<Task> findByCreatedByOrderByCreatedAtDesc(User user);
    
    // Find tasks by status
    List<Task> findByCreatedByAndStatusOrderByCreatedAtDesc(
        User user, 
        Task.TaskStatus status
    );
    
    // Find tasks by priority
    List<Task> findByCreatedByAndPriorityOrderByCreatedAtDesc(
        User user, 
        Task.TaskPriority priority
    );
    
    // Count tasks by status
    @Query("SELECT COUNT(t) FROM Task t WHERE t.createdBy = ?1 AND t.status = ?2")
    long countByUserAndStatus(User user, Task.TaskStatus status);
    
    // Search tasks by title or description
    @Query("SELECT t FROM Task t WHERE t.createdBy = ?1 AND " +
           "(LOWER(t.title) LIKE LOWER(CONCAT('%', ?2, '%')) OR " +
           "LOWER(t.description) LIKE LOWER(CONCAT('%', ?2, '%')))")
    List<Task> searchTasks(User user, String keyword);
}
```

### 3.6 Create Services (Business Logic)

**File:** `backend/src/main/java/com/taskmanager/service/TaskService.java`

```java
package com.taskmanager.service;

import com.taskmanager.dto.CreateTaskRequest;
import com.taskmanager.dto.TaskDTO;
import com.taskmanager.dto.UpdateTaskRequest;
import com.taskmanager.exception.TaskNotFoundException;
import com.taskmanager.model.Task;
import com.taskmanager.model.User;
import com.taskmanager.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;

    /**
     * Get all tasks for a user
     */
    public List<TaskDTO> getAllTasks(User user) {
        return taskRepository.findByCreatedByOrderByCreatedAtDesc(user)
                .stream()
                .map(TaskDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get task by ID
     */
    public TaskDTO getTaskById(UUID id, User user) {
        Task task = findTaskOrThrow(id, user);
        return TaskDTO.fromEntity(task);
    }

    /**
     * Create new task
     */
    @Transactional
    public TaskDTO createTask(CreateTaskRequest request, User user) {
        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setCreatedBy(user);
        
        // Set status (default: PENDING)
        if (request.getStatus() != null) {
            task.setStatus(Task.TaskStatus.valueOf(request.getStatus()));
        }
        
        // Set priority (default: MEDIUM)
        if (request.getPriority() != null) {
            task.setPriority(Task.TaskPriority.valueOf(request.getPriority()));
        }
        
        task.setDueDate(request.getDueDate());
        
        Task savedTask = taskRepository.save(task);
        return TaskDTO.fromEntity(savedTask);
    }

    /**
     * Update existing task
     */
    @Transactional
    public TaskDTO updateTask(UUID id, UpdateTaskRequest request, User user) {
        Task task = findTaskOrThrow(id, user);
        
        if (request.getTitle() != null) {
            task.setTitle(request.getTitle());
        }
        
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }
        
        if (request.getStatus() != null) {
            task.setStatus(Task.TaskStatus.valueOf(request.getStatus()));
        }
        
        if (request.getPriority() != null) {
            task.setPriority(Task.TaskPriority.valueOf(request.getPriority()));
        }
        
        if (request.getDueDate() != null) {
            task.setDueDate(request.getDueDate());
        }
        
        Task updatedTask = taskRepository.save(task);
        return TaskDTO.fromEntity(updatedTask);
    }

    /**
     * Delete task
     */
    @Transactional
    public void deleteTask(UUID id, User user) {
        Task task = findTaskOrThrow(id, user);
        taskRepository.delete(task);
    }

    /**
     * Get tasks by status
     */
    public List<TaskDTO> getTasksByStatus(String status, User user) {
        Task.TaskStatus taskStatus = Task.TaskStatus.valueOf(status);
        return taskRepository.findByCreatedByAndStatusOrderByCreatedAtDesc(user, taskStatus)
                .stream()
                .map(TaskDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Search tasks
     */
    public List<TaskDTO> searchTasks(String keyword, User user) {
        return taskRepository.searchTasks(user, keyword)
                .stream()
                .map(TaskDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Helper: Find task or throw exception
     */
    private Task findTaskOrThrow(UUID id, User user) {
        return taskRepository.findById(id)
                .filter(task -> task.getCreatedBy().getId().equals(user.getId()))
                .orElseThrow(() -> new TaskNotFoundException("Task not found with id: " + id));
    }
}
```

### 3.7 Create Exception Handlers

**File:** `backend/src/main/java/com/taskmanager/exception/TaskNotFoundException.java`

```java
package com.taskmanager.exception;

public class TaskNotFoundException extends RuntimeException {
    public TaskNotFoundException(String message) {
        super(message);
    }
}
```

**File:** `backend/src/main/java/com/taskmanager/exception/GlobalExceptionHandler.java`

```java
package com.taskmanager.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handle validation errors
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(
            MethodArgumentNotValidException ex) {
        
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now());
        response.put("status", HttpStatus.BAD_REQUEST.value());
        response.put("errors", errors);
        
        return ResponseEntity.badRequest().body(response);
    }

    /**
     * Handle task not found
     */
    @ExceptionHandler(TaskNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleTaskNotFound(
            TaskNotFoundException ex) {
        
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now());
        response.put("status", HttpStatus.NOT_FOUND.value());
        response.put("error", "Not Found");
        response.put("message", ex.getMessage());
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    /**
     * Handle generic exceptions
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(
            Exception ex) {
        
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now());
        response.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        response.put("error", "Internal Server Error");
        response.put("message", ex.getMessage());
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
```

### 3.8 Create Controllers (REST APIs)

**File:** `backend/src/main/java/com/taskmanager/controller/TaskController.java`

```java
package com.taskmanager.controller;

import com.taskmanager.dto.CreateTaskRequest;
import com.taskmanager.dto.TaskDTO;
import com.taskmanager.dto.UpdateTaskRequest;
import com.taskmanager.model.User;
import com.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/tasks")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    /**
     * GET /tasks - Get all tasks for current user
     */
    @GetMapping
    public ResponseEntity<List<TaskDTO>> getAllTasks(
            @AuthenticationPrincipal User user) {
        
        List<TaskDTO> tasks = taskService.getAllTasks(user);
        return ResponseEntity.ok(tasks);
    }

    /**
     * GET /tasks/{id} - Get task by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<TaskDTO> getTaskById(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        
        TaskDTO task = taskService.getTaskById(id, user);
        return ResponseEntity.ok(task);
    }

    /**
     * POST /tasks - Create new task
     */
    @PostMapping
    public ResponseEntity<TaskDTO> createTask(
            @Valid @RequestBody CreateTaskRequest request,
            @AuthenticationPrincipal User user) {
        
        TaskDTO createdTask = taskService.createTask(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTask);
    }

    /**
     * PUT /tasks/{id} - Update task
     */
    @PutMapping("/{id}")
    public ResponseEntity<TaskDTO> updateTask(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTaskRequest request,
            @AuthenticationPrincipal User user) {
        
        TaskDTO updatedTask = taskService.updateTask(id, request, user);
        return ResponseEntity.ok(updatedTask);
    }

    /**
     * DELETE /tasks/{id} - Delete task
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        
        taskService.deleteTask(id, user);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /tasks/status/{status} - Get tasks by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<TaskDTO>> getTasksByStatus(
            @PathVariable String status,
            @AuthenticationPrincipal User user) {
        
        List<TaskDTO> tasks = taskService.getTasksByStatus(status, user);
        return ResponseEntity.ok(tasks);
    }

    /**
     * GET /tasks/search?q=keyword - Search tasks
     */
    @GetMapping("/search")
    public ResponseEntity<List<TaskDTO>> searchTasks(
            @RequestParam String q,
            @AuthenticationPrincipal User user) {
        
        List<TaskDTO> tasks = taskService.searchTasks(q, user);
        return ResponseEntity.ok(tasks);
    }
}
```

---

**✅ Checkpoint 2: Backend Core Complete**

You now have:
- ✅ Entity models (Task, User)
- ✅ DTOs for request/response
- ✅ Repositories with query methods
- ✅ Service layer with business logic
- ✅ REST Controllers with CRUD endpoints
- ✅ Exception handling

**Next:** Configure security and authentication.

---

*This is Part 2 of the guide. Continue to Part 3 for Security Configuration.*


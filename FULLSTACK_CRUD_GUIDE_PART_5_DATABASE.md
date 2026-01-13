# 🚀 Complete Full-Stack CRUD Application Guide - Part 5
## Frontend Components & Database Setup

---

## 5.5 More Frontend Components (Continued)

### TaskItem Component

**File:** `frontend/src/components/TaskItem.jsx`

```javascript
import React, { useState } from 'react';
import { taskAPI } from '../services/apiService';
import '../styles/TaskItem.css';

const TaskItem = ({ task, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
  });

  const handleUpdate = async () => {
    try {
      const updatedTask = await taskAPI.update(task.id, editData);
      onUpdate(updatedTask);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update task:', error);
      alert('Failed to update task');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await taskAPI.delete(task.id);
      onDelete(task.id);
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return '#ff4444';
      case 'MEDIUM': return '#ffaa00';
      case 'LOW': return '#44ff44';
      default: return '#888';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return '#4caf50';
      case 'IN_PROGRESS': return '#2196f3';
      case 'PENDING': return '#ff9800';
      default: return '#888';
    }
  };

  if (isEditing) {
    return (
      <div className="task-item editing">
        <input
          type="text"
          value={editData.title}
          onChange={(e) => setEditData({...editData, title: e.target.value})}
          placeholder="Task title"
        />
        <textarea
          value={editData.description || ''}
          onChange={(e) => setEditData({...editData, description: e.target.value})}
          placeholder="Description"
        />
        <select
          value={editData.status}
          onChange={(e) => setEditData({...editData, status: e.target.value})}
        >
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <select
          value={editData.priority}
          onChange={(e) => setEditData({...editData, priority: e.target.value})}
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
        <div className="task-actions">
          <button onClick={handleUpdate} className="btn-save">Save</button>
          <button onClick={() => setIsEditing(false)} className="btn-cancel">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="task-item">
      <div className="task-header">
        <h3>{task.title}</h3>
        <div className="task-badges">
          <span 
            className="badge badge-priority" 
            style={{backgroundColor: getPriorityColor(task.priority)}}
          >
            {task.priority}
          </span>
          <span 
            className="badge badge-status"
            style={{backgroundColor: getStatusColor(task.status)}}
          >
            {task.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-meta">
        <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
        {task.dueDate && (
          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
        )}
      </div>

      <div className="task-actions">
        <button onClick={() => setIsEditing(true)} className="btn-edit">Edit</button>
        <button onClick={handleDelete} className="btn-delete">Delete</button>
      </div>
    </div>
  );
};

export default TaskItem;
```

### TaskForm Component

**File:** `frontend/src/components/TaskForm.jsx`

```javascript
import React, { useState } from 'react';
import { taskAPI } from '../services/apiService';
import '../styles/TaskForm.css';

const TaskForm = ({ onClose, onTaskCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'PENDING',
    priority: 'MEDIUM',
    dueDate: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);

    try {
      const newTask = await taskAPI.create(formData);
      onTaskCreated(newTask);
      onClose();
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Failed to create task: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Task</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className={errors.title ? 'error' : ''}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="dueDate">Due Date</label>
            <input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
```

---

## 6. Database Setup & Testing

### 6.1 Initialize PostgreSQL Database

**Step 1: Install PostgreSQL**

```bash
# Windows (using Chocolatey)
choco install postgresql

# macOS (using Homebrew)
brew install postgresql

# Linux (Ubuntu/Debian)
sudo apt-get install postgresql postgresql-contrib

# Verify installation
psql --version
```

**Step 2: Start PostgreSQL Service**

```bash
# Windows
# PostgreSQL runs as a Windows service (auto-starts)

# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Step 3: Create Database**

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE task_manager_db;

# List databases to verify
\l

# Connect to new database
\c task_manager_db

# Exit
\q
```

### 6.2 Run Database Schema

**Execute schema SQL:**

```bash
# From project root
cd task-manager-app

# Run schema
psql -U postgres -d task_manager_db -f database/schema.sql

# Verify tables created
psql -U postgres -d task_manager_db -c "\dt"
```

**Expected output:**
```
           List of relations
 Schema |  Name  | Type  |  Owner
--------+--------+-------+----------
 public | tasks  | table | postgres
 public | users  | table | postgres
```

### 6.3 Load Sample Data

```bash
# Run seed data
psql -U postgres -d task_manager_db -f database/seed.sql

# Verify data loaded
psql -U postgres -d task_manager_db -c "SELECT * FROM users;"
psql -U postgres -d task_manager_db -c "SELECT * FROM tasks;"
```

---

## 6.4 Testing Strategy

### Backend Testing

**Unit Tests - Service Layer**

**File:** `backend/src/test/java/com/taskmanager/TaskServiceTest.java`

```java
package com.taskmanager;

import com.taskmanager.dto.CreateTaskRequest;
import com.taskmanager.dto.TaskDTO;
import com.taskmanager.model.Task;
import com.taskmanager.model.User;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.service.TaskService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
    private TaskService taskService;

    private User testUser;
    private Task testTask;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        
        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setEmail("test@example.com");
        testUser.setName("Test User");

        testTask = new Task();
        testTask.setId(UUID.randomUUID());
        testTask.setTitle("Test Task");
        testTask.setStatus(Task.TaskStatus.PENDING);
        testTask.setPriority(Task.TaskPriority.MEDIUM);
        testTask.setCreatedBy(testUser);
    }

    @Test
    void testGetAllTasks() {
        when(taskRepository.findByCreatedByOrderByCreatedAtDesc(testUser))
                .thenReturn(Arrays.asList(testTask));

        List<TaskDTO> tasks = taskService.getAllTasks(testUser);

        assertEquals(1, tasks.size());
        assertEquals("Test Task", tasks.get(0).getTitle());
        verify(taskRepository, times(1)).findByCreatedByOrderByCreatedAtDesc(testUser);
    }

    @Test
    void testCreateTask() {
        CreateTaskRequest request = new CreateTaskRequest();
        request.setTitle("New Task");
        request.setDescription("Test Description");
        request.setStatus("PENDING");
        request.setPriority("HIGH");

        when(taskRepository.save(any(Task.class))).thenReturn(testTask);

        TaskDTO createdTask = taskService.createTask(request, testUser);

        assertNotNull(createdTask);
        verify(taskRepository, times(1)).save(any(Task.class));
    }
}
```

**Run tests:**
```bash
cd backend
./mvnw test
```

---

## 6.5 Integration Testing

**Test full flow:**

```bash
# 1. Start backend
cd backend
./mvnw spring-boot:run

# 2. Test API with curl
# Create task
curl -X POST http://localhost:8080/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test Task",
    "description": "Testing",
    "status": "PENDING",
    "priority": "HIGH"
  }'

# Get all tasks
curl http://localhost:8080/api/v1/tasks \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update task
curl -X PUT http://localhost:8080/api/v1/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "status": "COMPLETED"
  }'

# Delete task
curl -X DELETE http://localhost:8080/api/v1/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 6.6 Frontend Testing

**Manual Testing Checklist:**

- [ ] Login with Google works
- [ ] Tasks load after login
- [ ] Can create new task
- [ ] Can edit task
- [ ] Can delete task
- [ ] Filters work (ALL, PENDING, etc.)
- [ ] Search works
- [ ] Logout works
- [ ] UI responsive on mobile

---

## 6.7 Database Verification

**Check data integrity:**

```sql
-- Connect to database
psql -U postgres -d task_manager_db

-- Count users
SELECT COUNT(*) FROM users;

-- Count tasks
SELECT COUNT(*) FROM tasks;

-- View tasks with user info
SELECT t.title, t.status, t.priority, u.name as created_by
FROM tasks t
JOIN users u ON t.created_by = u.id
ORDER BY t.created_at DESC;

-- Check foreign key relationships
SELECT 
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

---

**✅ Checkpoint: Part 5 Complete**

You now have:
- ✅ More frontend components (TaskItem, TaskForm)
- ✅ Database setup guide
- ✅ Testing strategy
- ✅ Integration tests
- ✅ Database verification

**Continue to Part 6 for Deployment**

---

*This is Part 5 of the Full-Stack CRUD Guide*


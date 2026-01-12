# 🚀 Part 5: Frontend Development (React)
## Building the UI with Docker

**Time Required:** 2-3 hours  
**Difficulty:** Medium  
**Prerequisites:** Parts 1-4 completed

---

## 📚 What You'll Learn in This Part

1. Creating React components
2. Building API service layer
3. Connecting frontend to backend
4. Creating Frontend Dockerfile
5. Building Docker image for frontend
6. Running frontend in Docker
7. Testing complete application

---

## 🎯 What We'll Build

By the end of this part, you'll have:
- Complete task management UI
- Frontend connected to backend API
- Frontend running in Docker with Nginx
- Full-stack application working together

---

## 📦 Step 1: Create API Service Layer

### What is an API Service?

An **API Service** handles all communication with the backend.

**Think of it as:** A messenger that talks to the backend for you.

### Create API Service

**File:** `frontend/src/services/apiService.js`

```javascript
/**
 * API Service - Handles all backend communication
 * 
 * Base URL points to our Spring Boot backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    // Parse JSON response
    const data = await response.json();

    // Check for errors
    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Task API methods
 */
export const taskAPI = {
  /**
   * Get all tasks
   */
  getAll: async () => {
    return fetchAPI('/tasks');
  },

  /**
   * Get task by ID
   */
  getById: async (id) => {
    return fetchAPI(`/tasks/${id}`);
  },

  /**
   * Create new task
   */
  create: async (task) => {
    return fetchAPI('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  },

  /**
   * Update task
   */
  update: async (id, task) => {
    return fetchAPI(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
  },

  /**
   * Delete task
   */
  delete: async (id) => {
    return fetchAPI(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get tasks by status
   */
  getByStatus: async (status) => {
    return fetchAPI(`/tasks/status/${status}`);
  },

  /**
   * Search tasks
   */
  search: async (keyword) => {
    return fetchAPI(`/tasks/search?keyword=${encodeURIComponent(keyword)}`);
  },

  /**
   * Get task statistics
   */
  getStats: async () => {
    return fetchAPI('/tasks/stats');
  },
};
```

---

## 🎨 Step 2: Create TaskList Component

**File:** `frontend/src/components/TaskList.jsx`

```jsx
import { useState, useEffect } from 'react';
import { taskAPI } from '../services/apiService';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';
import '../styles/TaskList.css';

/**
 * TaskList Component - Displays all tasks
 */
function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [stats, setStats] = useState({});

  // Load tasks on component mount
  useEffect(() => {
    loadTasks();
    loadStats();
  }, [filter]);

  /**
   * Load tasks from backend
   */
  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      let data;
      if (filter === 'ALL') {
        data = await taskAPI.getAll();
      } else {
        data = await taskAPI.getByStatus(filter);
      }

      setTasks(data);
    } catch (err) {
      setError('Failed to load tasks. Make sure backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load task statistics
   */
  const loadStats = async () => {
    try {
      const data = await taskAPI.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  /**
   * Handle task creation
   */
  const handleTaskCreated = (newTask) => {
    setTasks([newTask, ...tasks]);
    setShowForm(false);
    loadStats();
  };

  /**
   * Handle task update
   */
  const handleTaskUpdated = (updatedTask) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    setEditingTask(null);
    loadStats();
  };

  /**
   * Handle task deletion
   */
  const handleTaskDeleted = (taskId) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    loadStats();
  };

  /**
   * Handle edit button click
   */
  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  return (
    <div className="task-list-container">
      {/* Header */}
      <div className="header">
        <h1>📝 Task Manager</h1>
        <button 
          className="btn-primary" 
          onClick={() => {
            setEditingTask(null);
            setShowForm(true);
          }}
        >
          + Add Task
        </button>
      </div>

      {/* Statistics */}
      <div className="stats">
        <div className="stat-card">
          <div className="stat-value">{stats.total || 0}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.pending || 0}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.inProgress || 0}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.completed || 0}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        {['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'].map(status => (
          <button
            key={status}
            className={`filter-btn ${filter === status ? 'active' : ''}`}
            onClick={() => setFilter(status)}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Task Form Modal */}
      {showForm && (
        <TaskForm
          task={editingTask}
          onClose={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
          onTaskCreated={handleTaskCreated}
          onTaskUpdated={handleTaskUpdated}
        />
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading">Loading tasks...</div>
      )}

      {/* Error State */}
      {error && (
        <div className="error">
          <p>{error}</p>
          <button onClick={loadTasks}>Retry</button>
        </div>
      )}

      {/* Task List */}
      {!loading && !error && (
        <div className="tasks-grid">
          {tasks.length === 0 ? (
            <div className="empty-state">
              <p>No tasks found. Create your first task!</p>
            </div>
          ) : (
            tasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onEdit={handleEdit}
                onDelete={handleTaskDeleted}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default TaskList;
```

---

## 📝 Step 3: Create TaskForm Component

**File:** `frontend/src/components/TaskForm.jsx`

```jsx
import { useState, useEffect } from 'react';
import { taskAPI } from '../services/apiService';
import '../styles/TaskForm.css';

/**
 * TaskForm Component - Create/Edit task form
 */
function TaskForm({ task, onClose, onTaskCreated, onTaskUpdated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'PENDING',
    priority: 'MEDIUM',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Populate form if editing
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
      });
    }
  }, [task]);

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      if (task) {
        // Update existing task
        const updated = await taskAPI.update(task.id, formData);
        onTaskUpdated(updated);
      } else {
        // Create new task
        const created = await taskAPI.create(formData);
        onTaskCreated(created);
      }
    } catch (err) {
      setError('Failed to save task. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task ? 'Edit Task' : 'Create New Task'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter task title"
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter task description"
              rows="4"
            />
          </div>

          {/* Status and Priority */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
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
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">{error}</div>
          )}

          {/* Buttons */}
          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : (task ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskForm;
```

---

## 📌 Step 4: Create TaskItem Component

**File:** `frontend/src/components/TaskItem.jsx`

```jsx
import { taskAPI } from '../services/apiService';
import '../styles/TaskItem.css';

/**
 * TaskItem Component - Individual task card
 */
function TaskItem({ task, onEdit, onDelete }) {
  /**
   * Handle delete button click
   */
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await taskAPI.delete(task.id);
      onDelete(task.id);
    } catch (err) {
      alert('Failed to delete task');
      console.error(err);
    }
  };

  /**
   * Get color for priority badge
   */
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return '#ef4444';
      case 'MEDIUM': return '#f59e0b';
      case 'LOW': return '#10b981';
      default: return '#6b7280';
    }
  };

  /**
   * Get color for status badge
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return '#10b981';
      case 'IN_PROGRESS': return '#3b82f6';
      case 'PENDING': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <div className="task-item">
      <div className="task-header">
        <h3>{task.title}</h3>
        <div className="task-badges">
          <span 
            className="badge"
            style={{ backgroundColor: getPriorityColor(task.priority) }}
          >
            {task.priority}
          </span>
          <span 
            className="badge"
            style={{ backgroundColor: getStatusColor(task.status) }}
          >
            {task.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-meta">
        <small>Created: {new Date(task.createdAt).toLocaleDateString()}</small>
      </div>

      <div className="task-actions">
        <button 
          className="btn-edit" 
          onClick={() => onEdit(task)}
        >
          ✏️ Edit
        </button>
        <button 
          className="btn-delete" 
          onClick={handleDelete}
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}

export default TaskItem;
```

---

## 🎨 Step 5: Create Styles

### TaskList Styles

**File:** `frontend/src/styles/TaskList.css`

```css
.task-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header h1 {
  font-size: 2rem;
  color: #1f2937;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #3b82f6;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 5px;
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 8px 16px;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  border-color: #3b82f6;
}

.filter-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.loading, .error, .empty-state {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
}

.error {
  color: #ef4444;
}

.btn-primary {
  padding: 10px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #2563eb;
}
```

### TaskForm Styles

**File:** `frontend/src/styles/TaskForm.css`

```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #6b7280;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn-secondary {
  padding: 10px 20px;
  background: #e5e7eb;
  color: #374151;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
}

.error-message {
  color: #ef4444;
  padding: 10px;
  background: #fee2e2;
  border-radius: 6px;
  margin-bottom: 15px;
}
```

### TaskItem Styles

**File:** `frontend/src/styles/TaskItem.css`

```css
.task-item {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.task-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 10px;
}

.task-header h3 {
  margin: 0;
  color: #1f2937;
}

.task-badges {
  display: flex;
  gap: 5px;
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  color: white;
  font-weight: 600;
}

.task-description {
  color: #6b7280;
  margin: 10px 0;
}

.task-meta {
  color: #9ca3af;
  font-size: 0.875rem;
  margin: 10px 0;
}

.task-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.btn-edit, .btn-delete {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: opacity 0.2s;
}

.btn-edit {
  background: #3b82f6;
  color: white;
}

.btn-delete {
  background: #ef4444;
  color: white;
}

.btn-edit:hover, .btn-delete:hover {
  opacity: 0.9;
}
```

---

## 📱 Step 6: Update App.jsx

**File:** `frontend/src/App.jsx`

```jsx
import TaskList from './components/TaskList';
import './App.css';

function App() {
  return (
    <div className="App">
      <TaskList />
    </div>
  );
}

export default App;
```

**File:** `frontend/src/App.css`

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #f3f4f6;
}

.App {
  min-height: 100vh;
  padding: 20px;
}
```

---

## 🧪 Step 7: Test Frontend Locally

### Start Frontend

```bash
cd frontend
npm run dev
```

**Expected output:**
```
  VITE v5.0.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
```

### Open Browser

Go to: http://localhost:5173

**You should see:**
- Task Manager header
- Statistics cards
- Filter buttons
- Add Task button
- List of tasks from database

**✅ Frontend is working!**

---

## 🐳 Step 8: Create Frontend Dockerfile

**File:** `frontend/Dockerfile`

```dockerfile
# =====================================================================
# Multi-Stage Build for React Frontend
# =====================================================================

# Stage 1: Build
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build production bundle
RUN npm run build

# =====================================================================
# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### Create nginx.conf

**File:** `frontend/nginx.conf`

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Create .dockerignore

**File:** `frontend/.dockerignore`

```
node_modules
dist
.git
.gitignore
*.md
.env.local
```

---

## 🏗️ Step 9: Build Frontend Docker Image

```bash
cd frontend
docker build -t task-manager-frontend:latest .
```

**Expected output:**
```
[+] Building 35.2s (12/12) FINISHED
...
=> => naming to docker.io/library/task-manager-frontend:latest
```

---

## 🚀 Step 10: Run Frontend in Docker

```bash
docker run -d \
  --name frontend \
  -p 3000:80 \
  task-manager-frontend:latest
```

### Test Frontend

Open browser: http://localhost:3000

**✅ Frontend is running in Docker!**

---

## ✅ Part 5 Complete!

You now have:
- ✅ Complete React UI
- ✅ Connected to backend API
- ✅ Frontend running in Docker
- ✅ Full-stack app working

**Next:** [Part 6 - Docker Compose](./DOCKER_FULLSTACK_PART_6_COMPOSE.md)

---

*Excellent! Your frontend is Dockerized. Time to run everything together!* 🎉


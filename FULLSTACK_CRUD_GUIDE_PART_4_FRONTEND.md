# 🚀 Complete Full-Stack CRUD Application Guide - Part 4
## Frontend Development (React)

---

## 5. Frontend Development (React)

### 5.1 Project Structure Overview

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── TaskList.jsx
│   │   ├── TaskForm.jsx
│   │   ├── TaskItem.jsx
│   │   ├── LoginModal.jsx
│   │   ├── Navbar.jsx
│   │   └── ErrorBoundary.jsx
│   ├── contexts/            # Context API
│   │   └── AuthContext.jsx
│   ├── services/            # API calls
│   │   └── apiService.js
│   ├── utils/               # Helper functions
│   │   └── helpers.js
│   ├── styles/              # CSS files
│   │   ├── App.css
│   │   ├── TaskList.css
│   │   ├── TaskForm.css
│   │   ├── LoginModal.css
│   │   └── Navbar.css
│   ├── App.jsx              # Main component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── public/
│   └── favicon.ico
├── package.json
├── vite.config.js
├── .env
└── .env.example
```

---

## 5.2 Setup API Service Layer

**File:** `frontend/src/services/apiService.js`

```javascript
/**
 * API Service - Centralized API communication
 * Handles all HTTP requests to backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

/**
 * Get authentication token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem('user_token');
};

/**
 * Create headers with authentication
 */
const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Handle API response
 */
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
};

// =====================================================================
// Task API
// =====================================================================

export const taskAPI = {
  /**
   * Get all tasks for current user
   */
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  /**
   * Get task by ID
   */
  async getById(id) {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  /**
   * Create new task
   */
  async create(taskData) {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(taskData),
    });
    return handleResponse(response);
  },

  /**
   * Update task
   */
  async update(id, taskData) {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(taskData),
    });
    return handleResponse(response);
  },

  /**
   * Delete task
   */
  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete task');
    }
  },

  /**
   * Get tasks by status
   */
  async getByStatus(status) {
    const response = await fetch(`${API_BASE_URL}/tasks/status/${status}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  /**
   * Search tasks
   */
  async search(query) {
    const response = await fetch(`${API_BASE_URL}/tasks/search?q=${encodeURIComponent(query)}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

// =====================================================================
// Auth API
// =====================================================================

export const authAPI = {
  /**
   * Login with Google
   */
  async loginWithGoogle(googleToken) {
    const response = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: googleToken }),
    });
    return handleResponse(response);
  },

  /**
   * Get current user
   */
  async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  /**
   * Logout
   */
  async logout() {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};
```

---

## 5.3 Create Authentication Context

**File:** `frontend/src/contexts/AuthContext.jsx`

```javascript
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/apiService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('user_token');
    
    if (token) {
      try {
        const userData = await authAPI.getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('user_token');
        setUser(null);
        setIsAuthenticated(false);
      }
    }
    
    setLoading(false);
  };

  const loginWithGoogle = async (credential) => {
    try {
      const response = await authAPI.loginWithGoogle(credential);
      
      if (response.success) {
        setUser(response.user);
        setIsAuthenticated(true);
        localStorage.setItem('user_token', response.token);
        setLoginModalOpen(false);
        return true;
      } else {
        alert('Login failed: ' + response.message);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
      return false;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('user_token');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const showLoginModal = () => {
    setLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setLoginModalOpen(false);
  };

  const requireAuth = (callback) => {
    if (!isAuthenticated) {
      showLoginModal();
      return false;
    }
    callback();
    return true;
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    loginModalOpen,
    loginWithGoogle,
    logout,
    showLoginModal,
    closeLoginModal,
    requireAuth,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

## 5.4 Create UI Components

### TaskList Component

**File:** `frontend/src/components/TaskList.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import { taskAPI } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';
import '../styles/TaskList.css';

const TaskList = () => {
  const { isAuthenticated, requireAuth } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL'); // ALL, PENDING, IN_PROGRESS, COMPLETED
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Load tasks on mount and when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadTasks();
    } else {
      setTasks([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let tasksData;
      if (filter === 'ALL') {
        tasksData = await taskAPI.getAll();
      } else {
        tasksData = await taskAPI.getByStatus(filter);
      }
      
      setTasks(tasksData);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadTasks();
      return;
    }

    try {
      setLoading(true);
      const results = await taskAPI.search(searchQuery);
      setTasks(results);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = () => {
    requireAuth(() => setShowForm(true));
  };

  const handleTaskCreated = (newTask) => {
    setTasks([newTask, ...tasks]);
    setShowForm(false);
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks(tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
  };

  const handleTaskDeleted = (deletedTaskId) => {
    setTasks(tasks.filter(task => task.id !== deletedTaskId));
  };

  const filteredTasks = tasks;

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <h1>My Tasks</h1>
        
        {isAuthenticated && (
          <button className="btn-primary" onClick={handleAddTask}>
            + Add Task
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="task-filters">
        <div className="filter-buttons">
          {['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'].map(status => (
            <button
              key={status}
              className={`filter-btn ${filter === status ? 'active' : ''}`}
              onClick={() => {
                setFilter(status);
                setTimeout(loadTasks, 0);
              }}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
      </div>

      {/* Task Form Modal */}
      {showForm && (
        <TaskForm
          onClose={() => setShowForm(false)}
          onTaskCreated={handleTaskCreated}
        />
      )}

      {/* Task List */}
      {loading ? (
        <div className="loading">Loading tasks...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : !isAuthenticated ? (
        <div className="not-authenticated">
          <p>Please login to see your tasks</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="empty-state">
          <p>No tasks found. Create your first task!</p>
        </div>
      ) : (
        <div className="tasks-grid">
          {filteredTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onUpdate={handleTaskUpdated}
              onDelete={handleTaskDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;
```

---

**✅ Checkpoint: Part 4 Created**

This is Part 4 covering Frontend Development. The guide now includes:
- Complete API service layer
- Authentication context
- TaskList component

**Continue to FULLSTACK_CRUD_GUIDE_PART_5.md for more components and styling**

---

*This is Part 4 of the Full-Stack CRUD Guide*


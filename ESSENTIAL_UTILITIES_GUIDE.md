# 🛠️ Essential Utilities Guide - Every Project Should Have These
## Based on TarkVtark.com Project Best Practices

---

## Table of Contents

1. [Frontend Utilities](#1-frontend-utilities)
2. [Backend Utilities](#2-backend-utilities)
3. [Configuration Utilities](#3-configuration-utilities)
4. [Error Handling Utilities](#4-error-handling-utilities)
5. [Security Utilities](#5-security-utilities)
6. [Logging Utilities](#6-logging-utilities)
7. [API Communication Utilities](#7-api-communication-utilities)
8. [Quick Reference](#8-quick-reference)

---

## Why These Utilities Matter

**Benefits:**
- ✅ **Reusability** - Write once, use everywhere
- ✅ **Consistency** - Same patterns across the project
- ✅ **Maintainability** - Fix bugs in one place
- ✅ **Testability** - Easier to test isolated functions
- ✅ **Security** - Centralized security handling
- ✅ **Debugging** - Better logging and error tracking

---

## 1. Frontend Utilities

### 1.1 Helper Functions (helpers.js)

**Location:** `frontend/src/utils/helpers.js`

**Purpose:** Common utility functions used across components

```javascript
/**
 * =====================================================================
 * Frontend Helper Utilities
 * =====================================================================
 * Pure functions with no side effects
 */

/**
 * Generate a unique ID for UI elements
 * 
 * Format: prefix-timestamp-random
 * Example: "task-1705123456789-123"
 * 
 * NOTE: Not cryptographically secure - only for UI/local usage
 * For production IDs, use server-generated UUIDs
 *
 * @param {string} prefix - Prefix for the ID (e.g., 'task', 'user')
 * @returns {string} Generated unique ID
 */
export const generateUniqueId = (prefix = 'id') =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

/**
 * Create a deep copy of a JSON-serializable object
 * 
 * Used for maintaining immutability in React state updates
 * 
 * LIMITATIONS:
 * - Only works with JSON-serializable data
 * - Loses functions, undefined, Date objects
 * - Relatively slow for very large objects
 *
 * @param {any} obj - Object to deep copy
 * @returns {any} Deep copy of the object
 * 
 * @example
 * const original = { items: [{id: 1}] };
 * const copy = deepCopy(original);
 * copy.items.push({id: 2});
 * // original.items still has 1 item
 * // copy.items now has 2 items
 */
export const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));

/**
 * Escape HTML special characters
 * 
 * NOTE: React automatically escapes text content,
 * so this is only needed if using dangerouslySetInnerHTML
 *
 * @param {string} text - Text to escape
 * @returns {string} HTML-safe text
 */
export const escapeHtml = (text = '') => {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Debounce function - delays execution until after delay ms
 * 
 * Useful for search inputs, window resize, scroll events
 *
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 * 
 * @example
 * const searchHandler = debounce((query) => {
 *   fetchResults(query);
 * }, 500);
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle function - limits execution to once per delay ms
 *
 * @param {Function} func - Function to throttle
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, delay) => {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

/**
 * Format date to readable string
 *
 * @param {Date|string|number} date - Date to format
 * @param {string} locale - Locale (default: 'en-US')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, locale = 'en-US') => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format date to relative time (e.g., "2 hours ago")
 *
 * @param {Date|string|number} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return formatDate(date);
};

/**
 * Truncate text to specified length
 *
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated text
 */
export const truncate = (text, maxLength, suffix = '...') => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Capitalize first letter of string
 *
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 *
 * @param {any} value - Value to check
 * @returns {boolean} True if empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Sleep/delay function (async)
 *
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after ms
 * 
 * @example
 * await sleep(1000); // Wait 1 second
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generate random string
 *
 * @param {number} length - Length of string
 * @returns {string} Random string
 */
export const randomString = (length = 10) => {
  return Math.random().toString(36).substring(2, 2 + length);
};

/**
 * Group array by key
 *
 * @param {Array} array - Array to group
 * @param {string|Function} key - Key to group by
 * @returns {Object} Grouped object
 * 
 * @example
 * const tasks = [{status: 'pending'}, {status: 'done'}];
 * groupBy(tasks, 'status');
 * // { pending: [...], done: [...] }
 */
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = typeof key === 'function' ? key(item) : item[key];
    (result[group] = result[group] || []).push(item);
    return result;
  }, {});
};
```

**When to Use:**
- ✅ Unique ID generation for UI elements
- ✅ State immutability (deep copy)
- ✅ Date formatting
- ✅ Search input debouncing
- ✅ Text manipulation
- ✅ Array/object utilities

---

### 1.2 Logger Utility (logger.js)

**Location:** `frontend/src/utils/logger.js`

**Purpose:** Centralized logging with console + file download capability

```javascript
/**
 * =====================================================================
 * Frontend Logger - Console + File Download
 * =====================================================================
 * 
 * Features:
 * - Logs to console for immediate debugging
 * - Accumulates logs in memory for download
 * - Auto-download logs on errors
 * - Session tracking
 * - Multiple log levels (INFO, WARN, ERROR, DEBUG)
 */

class FrontendLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000; // Keep last 1000 entries
    this.sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.startTime = new Date();
    this.logSessionStart();
  }

  logSessionStart() {
    this.addLog('INFO', '='.repeat(80));
    this.addLog('INFO', 'Frontend Logging Session Started');
    this.addLog('INFO', `Session ID: ${this.sessionId}`);
    this.addLog('INFO', `Start Time: ${this.startTime.toLocaleString()}`);
    this.addLog('INFO', `User Agent: ${navigator.userAgent}`);
    this.addLog('INFO', `URL: ${window.location.href}`);
    this.addLog('INFO', '='.repeat(80));
  }

  addLog(level, ...args) {
    const timestamp = new Date().toISOString();
    const message = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');

    this.logs.push({ timestamp, level, message });

    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  log(...args) {
    this.addLog('INFO', ...args);
    console.log(...args);
  }

  info(...args) {
    this.addLog('INFO', ...args);
    console.info(...args);
  }

  warn(...args) {
    this.addLog('WARN', ...args);
    console.warn(...args);
  }

  error(...args) {
    this.addLog('ERROR', ...args);
    console.error(...args);
    // Optional: Auto-download on error
    // this.downloadLogs();
  }

  debug(...args) {
    this.addLog('DEBUG', ...args);
    console.debug(...args);
  }

  group(label) {
    this.addLog('GROUP', `>>> ${label}`);
    console.group(label);
  }

  groupEnd() {
    this.addLog('GROUP', `<<< GROUP END`);
    console.groupEnd();
  }

  /**
   * Get all logs as formatted text
   */
  getLogsAsText() {
    return this.logs.map(log =>
      `[${log.timestamp}] [${log.level.padEnd(5)}] ${log.message}`
    ).join('\n');
  }

  /**
   * Download logs as a text file
   */
  downloadLogs() {
    const text = this.getLogsAsText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${this.sessionId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Clear all logs
   */
  clear() {
    this.logs = [];
    console.clear();
  }
}

// Export singleton instance
const logger = new FrontendLogger();
export default logger;
```

**Usage:**
```javascript
import logger from './utils/logger';

logger.info('Application started');
logger.warn('Warning message');
logger.error('Error occurred', errorObject);
logger.debug('Debug info', data);

// Download logs
logger.downloadLogs();
```

**When to Use:**
- ✅ Debugging production issues
- ✅ Tracking user actions
- ✅ Error reporting
- ✅ Performance monitoring

---

## 2. Backend Utilities

### 2.1 JWT Utility (JwtUtil.java)

**Location:** `backend/src/main/java/com/debatearena/util/JwtUtil.java`

**Purpose:** JWT token generation and validation

```java
package com.yourproject.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

/**
 * JWT Utility Class
 * 
 * Features:
 * - Generate JWT tokens with user details
 * - Validate JWT tokens
 * - Extract user info from token
 * - Check token expiration
 * - Support multiple token types (admin, user)
 */
@Component
public class JwtUtil {

    @Value("${JWT_SECRET}")
    private String jwtSecret;

    @Value("${JWT_EXPIRATION_MS:86400000}") // 24 hours default
    private Long jwtExpirationMs;

    /**
     * Generate JWT token for user
     */
    public String generateToken(UUID userId, String username, String type) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        SecretKey key = Keys.hmacShaKeyFor(
            jwtSecret.getBytes(StandardCharsets.UTF_8)
        );

        return Jwts.builder()
                .setSubject(username)
                .claim("userId", userId.toString())
                .claim("type", type)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }

    /**
     * Validate JWT token
     */
    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (MalformedJwtException ex) {
            System.err.println("Invalid JWT token");
        } catch (ExpiredJwtException ex) {
            System.err.println("Expired JWT token");
        } catch (UnsupportedJwtException ex) {
            System.err.println("Unsupported JWT token");
        } catch (IllegalArgumentException ex) {
            System.err.println("JWT claims string is empty");
        }
        return false;
    }

    /**
     * Extract user ID from token
     */
    public UUID getUserIdFromToken(String token) {
        Claims claims = parseToken(token);
        String userIdStr = claims.get("userId", String.class);
        return UUID.fromString(userIdStr);
    }

    /**
     * Extract username from token
     */
    public String getUsernameFromToken(String token) {
        Claims claims = parseToken(token);
        return claims.getSubject();
    }

    /**
     * Check if token is expired
     */
    public boolean isTokenExpired(String token) {
        try {
            Claims claims = parseToken(token);
            return claims.getExpiration().before(new Date());
        } catch (ExpiredJwtException ex) {
            return true;
        }
    }

    /**
     * Parse JWT token and extract claims
     */
    private Claims parseToken(String token) {
        SecretKey key = Keys.hmacShaKeyFor(
            jwtSecret.getBytes(StandardCharsets.UTF_8)
        );

        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
```

**When to Use:**
- ✅ User authentication
- ✅ Stateless sessions
- ✅ API authorization
- ✅ Token-based security

---

## 3. Configuration Utilities

### 3.1 Environment Variable Loader (DotenvConfig.java)

**Location:** `backend/src/main/java/com/yourproject/config/DotenvConfig.java`

**Purpose:** Load environment variables from .env file

```java
package com.yourproject.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

/**
 * Dotenv Configuration
 * 
 * Loads environment variables from .env file
 * 
 * Features:
 * - Tries multiple locations (./backend/.env, ./.env, ../.env)
 * - Graceful fallback to system environment variables
 * - Detailed logging of loaded configuration
 * - Security warnings if .env not found
 */
public class DotenvConfig implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        Dotenv dotenv = loadDotenv();
        
        if (dotenv == null) {
            System.err.println("⚠️ WARNING: .env file not found");
            System.err.println("   Application will use system environment variables");
            return;
        }

        // Load environment variables into Spring context
        ConfigurableEnvironment environment = applicationContext.getEnvironment();
        Map<String, Object> envMap = new HashMap<>();

        dotenv.entries().forEach(entry -> {
            String key = entry.getKey();
            String value = entry.getValue();
            envMap.put(key, value);
            System.setProperty(key, value);
        });

        environment.getPropertySources().addFirst(
            new MapPropertySource("dotenvProperties", envMap)
        );

        System.out.println("✅ Environment variables loaded from .env");
    }

    private Dotenv loadDotenv() {
        // Try multiple locations
        String[] locations = {"./backend/.env", "./.env", "../.env"};
        
        for (String location : locations) {
            try {
                Dotenv dotenv = Dotenv.configure()
                        .directory(location)
                        .ignoreIfMissing()
                        .load();
                
                if (dotenv.get("SPRING_DATASOURCE_URL") != null) {
                    System.out.println("✅ Loaded .env from: " + location);
                    return dotenv;
                }
            } catch (Exception e) {
                // Try next location
            }
        }
        
        return null;
    }
}
```

**When to Use:**
- ✅ Local development configuration
- ✅ Secure credential storage
- ✅ Environment-specific settings
- ✅ Avoiding hardcoded values

---

## 4. Error Handling Utilities

### 4.1 Error Boundary (ErrorBoundary.jsx)

**Location:** `frontend/src/components/ErrorBoundary.jsx`

**Purpose:** Catch React errors and show fallback UI

```javascript
import React from 'react';

/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors in component tree
 * Shows fallback UI instead of white screen
 * Logs errors for debugging
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
    
    // Optional: Send to error tracking service
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h1>⚠️ Something went wrong</h1>
          <p>Please try refreshing the page.</p>
          
          {process.env.NODE_ENV === 'development' && (
            <details>
              <summary>Error Details</summary>
              <pre>{this.state.error?.toString()}</pre>
              <pre>{this.state.errorInfo?.componentStack}</pre>
            </details>
          )}
          
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

**Usage:**
```javascript
import ErrorBoundary from './components/ErrorBoundary';

<ErrorBoundary>
  <App />
</ErrorBoundary>
```

**When to Use:**
- ✅ Prevent white screen errors
- ✅ Graceful error handling
- ✅ Error logging
- ✅ Production error recovery

---

### 4.2 Global Exception Handler (GlobalExceptionHandler.java)

**Location:** `backend/src/main/java/com/yourproject/exception/GlobalExceptionHandler.java`

**Purpose:** Centralized backend error handling

```java
package com.yourproject.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Global Exception Handler
 * 
 * Features:
 * - Consistent error response format
 * - Validation error handling
 * - Custom exception handling
 * - Security (no stack trace exposure)
 */
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
     * Handle resource not found
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(
            ResourceNotFoundException ex) {
        
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
        response.put("message", "An unexpected error occurred");
        
        // Log for debugging (don't expose to client)
        System.err.println("Unexpected error: " + ex.getMessage());
        ex.printStackTrace();
        
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(response);
    }
}
```

**When to Use:**
- ✅ Consistent error responses
- ✅ Validation error handling
- ✅ Security (hide stack traces)
- ✅ Error logging

---

## 5. Security Utilities

### 5.1 Input Validation Utility

**Location:** `frontend/src/utils/validation.js`

```javascript
/**
 * Input Validation Utilities
 */

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * Requires: 8+ chars, uppercase, lowercase, number
 */
export const isValidPassword = (password) => {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
};

/**
 * Sanitize user input (remove dangerous chars)
 */
export const sanitizeInput = (input) => {
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

/**
 * Validate URL format
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Check if string contains only alphanumeric characters
 */
export const isAlphanumeric = (str) => {
  return /^[a-zA-Z0-9]+$/.test(str);
};
```

---

## 6. Logging Utilities

### 6.1 Structured Logger (Backend)

**Location:** `backend/src/main/java/com/yourproject/util/Logger.java`

```java
package com.yourproject.util;

import org.slf4j.LoggerFactory;

/**
 * Structured Logger Utility
 */
public class Logger {
    
    private static final org.slf4j.Logger log = 
        LoggerFactory.getLogger(Logger.class);

    public static void logApiRequest(String method, String endpoint, String userId) {
        log.info("API_REQUEST | Method: {} | Endpoint: {} | User: {}", 
            method, endpoint, userId);
    }

    public static void logApiResponse(String endpoint, int status, long duration) {
        log.info("API_RESPONSE | Endpoint: {} | Status: {} | Duration: {}ms", 
            endpoint, status, duration);
    }

    public static void logError(String context, Exception e) {
        log.error("ERROR | Context: {} | Message: {} | Type: {}", 
            context, e.getMessage(), e.getClass().getSimpleName());
    }

    public static void logSecurityEvent(String event, String details) {
        log.warn("SECURITY | Event: {} | Details: {}", event, details);
    }
}
```

---

## 7. API Communication Utilities

### 7.1 API Service Wrapper

**Location:** `frontend/src/services/apiService.js`

```javascript
/**
 * API Service - Centralized backend communication
 * 
 * Features:
 * - Automatic auth header injection
 * - Error handling
 * - Request/response logging
 * - Retry logic (optional)
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

/**
 * Get auth token from localStorage
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
    const error = await response.json().catch(() => ({ 
      message: 'Request failed' 
    }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  
  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }
  
  return response.json();
};

/**
 * Generic fetch wrapper
 */
const apiFetch = async (url, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        ...getHeaders(),
        ...options.headers,
      },
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * API methods
 */
export const api = {
  get: (url) => apiFetch(url, { method: 'GET' }),
  
  post: (url, data) => apiFetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  put: (url, data) => apiFetch(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  delete: (url) => apiFetch(url, { method: 'DELETE' }),
};

/**
 * Usage:
 * 
 * import { api } from './services/apiService';
 * 
 * const tasks = await api.get('/tasks');
 * const newTask = await api.post('/tasks', {title: 'New Task'});
 * await api.put('/tasks/1', {status: 'done'});
 * await api.delete('/tasks/1');
 */
```

---

## 8. Quick Reference

### Frontend Utilities Checklist

- [ ] **helpers.js** - Common utility functions
  - generateUniqueId()
  - deepCopy()
  - debounce()
  - formatDate()
  - truncate()
  
- [ ] **logger.js** - Frontend logging
  - log(), info(), warn(), error()
  - downloadLogs()
  
- [ ] **validation.js** - Input validation
  - isValidEmail()
  - isValidPassword()
  - sanitizeInput()
  
- [ ] **apiService.js** - API communication
  - Centralized fetch wrapper
  - Auto auth headers
  - Error handling

- [ ] **ErrorBoundary.jsx** - Error handling
  - Catch React errors
  - Show fallback UI

### Backend Utilities Checklist

- [ ] **JwtUtil.java** - JWT operations
  - generateToken()
  - validateToken()
  - extractUserId()
  
- [ ] **DotenvConfig.java** - Environment config
  - Load .env file
  - Inject into Spring context
  
- [ ] **GlobalExceptionHandler.java** - Error handling
  - Validation errors
  - Custom exceptions
  - Generic errors

- [ ] **Logger.java** - Structured logging
  - API request/response logging
  - Error logging
  - Security event logging

### Configuration Files

- [ ] **.env** - Environment variables
- [ ] **.env.example** - Template
- [ ] **.gitignore** - Exclude .env
- [ ] **application.yml** - Spring config
- [ ] **vite.config.js** - Vite config

---

## Benefits Summary

### Code Quality
- ✅ Reusable code
- ✅ Consistent patterns
- ✅ Single source of truth
- ✅ Easier testing

### Security
- ✅ Centralized validation
- ✅ Secure token handling
- ✅ Input sanitization
- ✅ Error hiding (production)

### Debugging
- ✅ Structured logging
- ✅ Error tracking
- ✅ Request/response logging
- ✅ Downloadable logs

### Maintainability
- ✅ Fix bugs in one place
- ✅ Easy to update
- ✅ Clear documentation
- ✅ Consistent API

---

## Implementation Checklist

### Phase 1: Core Utilities
1. Create utils/helpers.js
2. Create utils/logger.js
3. Create services/apiService.js
4. Create ErrorBoundary component

### Phase 2: Backend Utilities
1. Create util/JwtUtil.java
2. Create config/DotenvConfig.java
3. Create exception/GlobalExceptionHandler.java

### Phase 3: Validation & Security
1. Create utils/validation.js
2. Add input sanitization
3. Add XSS protection

### Phase 4: Testing
1. Test each utility function
2. Document usage
3. Add examples

---

**Utilities Complete!** 🎉

Every project should include these essential utilities for better code quality, security, and maintainability.

---

*Based on TarkVtark.com project best practices*  
*Updated: January 12, 2026*


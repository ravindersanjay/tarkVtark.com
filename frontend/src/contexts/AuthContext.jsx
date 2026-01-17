import React, { createContext, useState, useContext, useEffect } from 'react';

/**
 * =====================================================================
 * Authentication Context
 * =====================================================================
 *
 * Manages user authentication state across the application.
 * Handles Google OAuth login, logout, and session persistence.
 *
 * Usage:
 * - Wrap app with <AuthProvider>
 * - Use useAuth() hook to access auth state and methods
 *
 * @author TarkVtark Team
 */

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
  const [loginAction, setLoginAction] = useState('');

  // Check for existing token on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('user_token');

    if (token) {
      try {
        const response = await fetch('http://localhost:8080/api/v1/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsAuthenticated(true);
          console.log('✅ User authenticated:', userData.email);
        } else {
          // Token invalid, clear it
          localStorage.removeItem('user_token');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('❌ Error checking auth:', error);
        localStorage.removeItem('user_token');
        setUser(null);
        setIsAuthenticated(false);
      }
    }

    setLoading(false);
  };

  const loginWithGoogle = async (credential) => {
    try {
      console.log('🔐 Logging in with Google...');

      const response = await fetch('${API_BASE_URL}/api/v1/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: credential }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Login successful:', data.user.email);
        setUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem('user_token', data.token);
        setLoginModalOpen(false);
        return true;
      } else {
        console.error('❌ Login failed:', data.message);
        alert('Login failed: ' + data.message);
        return false;
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      alert('Login failed. Please try again.');
      return false;
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('user_token');

      if (token) {
        await fetch('http://localhost:8080/api/v1/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      localStorage.removeItem('user_token');
      setUser(null);
      setIsAuthenticated(false);
      console.log('👋 User logged out');
    }
  };

  const showLoginModal = (action) => {
    setLoginAction(action);
    setLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setLoginModalOpen(false);
    setLoginAction('');
  };

  const requireAuth = (callback) => {
    if (!isAuthenticated) {
      showLoginModal('perform this action');
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
    loginAction,
    loginWithGoogle,
    logout,
    showLoginModal,
    closeLoginModal,
    requireAuth,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_URL;

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

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('user_token');

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
        console.log('✅ User authenticated:', userData.email);
      } else {
        localStorage.removeItem('user_token');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('❌ Error checking auth:', error);
      localStorage.removeItem('user_token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (credential) => {
    try {
      console.log('🔐 Logging in with Google...');
      console.log('AUTH URL =>', `${API_BASE_URL}/auth/google`);

      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: credential }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log('✅ Login successful:', data.user.email);
        setUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem('user_token', data.token);
        setLoginModalOpen(false);
        return true;
      }

      throw new Error(data.message || 'Login failed');
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
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

  return (
    <AuthContext.Provider
      value={{
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
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

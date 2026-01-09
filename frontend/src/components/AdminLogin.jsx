import React, { useState } from 'react';
import { authAPI } from '../services/apiService';

/**
 * AdminLogin Component
 * Handles admin authentication using backend JWT authentication
 *
 * Features:
 * - Authenticates against backend API
 * - Stores JWT token securely
 * - Displays user-friendly error messages
 * - Loading state during authentication
 */
const AdminLogin = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔐 Attempting login for user:', username);

      // Call backend authentication API
      const response = await authAPI.login(username, password);

      console.log('✅ Login successful:', response);

      // Store token and user info
      if (response.token) {
        authAPI.setToken(response.token);
      }

      if (response.user) {
        authAPI.setUser(response.user);
      }

      // Set legacy flag for backward compatibility (will be removed later)
      localStorage.setItem('admin_logged_in', 'true');

      // Notify parent component
      onLogin();

    } catch (err) {
      console.error('❌ Login failed:', err);

      // Display user-friendly error message
      if (err.message) {
        setError(err.message);
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '400px',
      margin: '100px auto',
      padding: '32px',
      background: '#fff',
      borderRadius: '12px',
      boxShadow: '0 2px 16px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ marginBottom: '24px', textAlign: 'center', color: '#2563eb' }}>
        Admin Login
      </h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '1rem'
            }}
            required
            disabled={loading}
          />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '1rem'
            }}
            required
            disabled={loading}
          />
        </div>
        {error && (
          <div style={{
            color: '#dc2626',
            marginBottom: '16px',
            fontSize: '0.9rem',
            padding: '8px',
            backgroundColor: '#fee2e2',
            borderRadius: '4px',
            border: '1px solid #fecaca'
          }}>
            {error}
          </div>
        )}
        <button
          type="submit"
          className="add-btn"
          style={{
            width: '100%',
            padding: '10px',
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
          disabled={loading}
        >
          {loading ? 'Authenticating...' : 'Login'}
        </button>
      </form>
      <p style={{ marginTop: '16px', fontSize: '0.85rem', color: '#6b7280', textAlign: 'center' }}>
        Default: admin / Admin@2026
      </p>
    </div>
  );
};

export default AdminLogin;

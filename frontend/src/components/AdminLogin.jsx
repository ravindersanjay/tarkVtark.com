import React, { useState } from 'react';

/**
 * AdminLogin Component
 * Simple login form for admin authentication
 * In production, this would connect to a real backend auth system
 */
const AdminLogin = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simple hardcoded auth (replace with real auth in production)
    if (username === 'admin' && password === 'admin996') {
      localStorage.setItem('admin_logged_in', 'true');
      onLogin();
    } else {
      setError('Invalid credentials. Use admin/admin123');
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
          />
        </div>
        {error && (
          <div style={{ color: '#dc2626', marginBottom: '16px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}
        <button
          type="submit"
          className="add-btn"
          style={{ width: '100%', padding: '10px' }}
        >
          Login
        </button>
      </form>
      <p style={{ marginTop: '16px', fontSize: '0.85rem', color: '#6b7280', textAlign: 'center' }}>
        Default credentials: admin / admin123
      </p>
    </div>
  );
};

export default AdminLogin;

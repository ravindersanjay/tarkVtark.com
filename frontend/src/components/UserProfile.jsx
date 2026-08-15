import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/userProfile.css';

/**
 * =====================================================================
 * User Profile Component
 * =====================================================================
 *
 * Displays logged-in user info and logout button in the top navigation.
 * Shows login button when user is not authenticated.
 *
 * @author TarkVtark Team
 */
const UserProfile = () => {
  const { user, isAuthenticated, logout, showLoginModal } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div className="user-profile">
        <button className="login-btn" onClick={() => showLoginModal('login')}>
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="user-profile">
      {user.profilePicture && (
        <img
          src={user.profilePicture}
          alt={user.name}
          className="user-avatar"
        />
      )}
      <span className="user-name">{user.name}</span>
      <button className="logout-btn" onClick={logout} title="Logout">
        Logout
      </button>
    </div>
  );
};

export default UserProfile;


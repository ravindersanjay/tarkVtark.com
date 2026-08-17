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
      <div className="user-profile" data-testid="user-profile-logged-out">
        <button className="login-btn" data-testid="user-profile-login-button" onClick={() => showLoginModal('login')}>
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="user-profile" data-testid="user-profile-logged-in">
      {user.profilePicture && (
        <img
          src={user.profilePicture}
          alt={user.name}
          className="user-avatar"
          data-testid="user-profile-avatar"
        />
      )}
      <span className="user-name" data-testid="user-profile-name">{user.name}</span>
      <button className="logout-btn" data-testid="user-profile-logout-button" onClick={logout} title="Logout">
        Logout
      </button>
    </div>
  );
};

export default UserProfile;


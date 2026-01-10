import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import '../styles/loginModal.css';

/**
 * =====================================================================
 * Login Modal Component
 * =====================================================================
 *
 * Displays a modal prompting users to login with Google.
 * Shows when guest users attempt protected actions.
 *
 * @author TarkVtark Team
 */
const LoginModal = () => {
  const { loginModalOpen, loginAction, closeLoginModal, loginWithGoogle } = useAuth();

  if (!loginModalOpen) return null;

  const handleGoogleSuccess = async (credentialResponse) => {
    console.log('Google login success');
    const success = await loginWithGoogle(credentialResponse.credential);
    if (success) {
      console.log('User logged in successfully');
    }
  };

  const handleGoogleError = () => {
    console.error('Google login failed');
    alert('Google login failed. Please try again.');
  };

  return (
    <div className="modal-overlay" onClick={closeLoginModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={closeLoginModal}>×</button>

        <div className="modal-header">
          <h2>Login Required</h2>
        </div>

        <div className="modal-body">
          <p className="modal-message">
            You need to login to {loginAction || 'continue'}.
          </p>

          <div className="modal-info">
            <p>Sign in with your Google account to:</p>
            <ul>
              <li>Post questions and answers</li>
              <li>Vote on content</li>
              <li>Reply to discussions</li>
              <li>Create new debate topics</li>
            </ul>
          </div>

          <div className="google-login-container">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
              theme="filled_blue"
              size="large"
              text="signin_with"
              shape="rectangular"
            />
          </div>

          <p className="modal-note">
            Your information will only be used for authentication and displaying your name with your posts.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;


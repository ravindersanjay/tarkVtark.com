import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
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
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

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
    toast.error('Google login failed. Please try again.');
  };

  return (
    <div className="modal-overlay" data-testid="login-modal-overlay" onClick={closeLoginModal}>
      <div className="modal-content" data-testid="login-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" data-testid="login-modal-close" onClick={closeLoginModal}>×</button>

        <div className="modal-header" data-testid="login-modal-header">
          <h2 data-testid="login-modal-title">Login Required</h2>
        </div>

        <div className="modal-body" data-testid="login-modal-body">
          <p className="modal-message" data-testid="login-modal-message">
            You need to login to {loginAction || 'continue'}.
          </p>

          <div className="modal-info" data-testid="login-modal-info">
            <p data-testid="login-modal-info-text">Sign in with your Google account to:</p>
            <ul data-testid="login-modal-benefits">
              <li data-testid="login-modal-benefit-1">Post questions and answers</li>
              <li data-testid="login-modal-benefit-2">Vote on content</li>
              <li data-testid="login-modal-benefit-3">Reply to discussions</li>
              <li data-testid="login-modal-benefit-4">Create new debate topics</li>
            </ul>
          </div>

          {GOOGLE_CLIENT_ID ? (
            <div className="google-login-container" data-testid="google-login-container">
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
          ) : (
            <div className="modal-error" data-testid="login-modal-error">
              <p data-testid="login-modal-error-text">Google Sign-In is not configured. Please contact the administrator.</p>
            </div>
          )}

          <p className="modal-note" data-testid="login-modal-note">
            Your information will only be used for authentication and displaying your name with your posts.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;


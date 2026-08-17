/**
 * =====================================================================
 * MAIN ENTRY POINT - Debate Application
 * =====================================================================
 *
 * This is the main entry file for the React application. It handles:
 * - Client-side routing between different pages
 * - Rendering the appropriate page based on URL or user navigation
 * - Managing the TopNav component that appears on all pages
 * - "Jump to Unique ID" feature for sharing specific posts
 *
 * PAGES AVAILABLE:
 * - Home: Shows list of debate topics
 * - Debate: Shows a specific debate (e.g., "Sanatan vs Islam")
 * - Guidelines: Rules and guidelines for debates
 * - FAQ: Frequently Asked Questions
 * - Contact: Contact information page
 *
 * ROUTING STRATEGY:
 * Simple client-side routing using React state. No router library needed
 * because the app is small. URL structure: /debate_Topic_Name.html
 */

import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import App from './App.jsx';
import DebateTopics from './components/DebateTopics.jsx';
import ContactUs from './components/ContactUs.jsx';
import Guidelines from './components/Guidelines.jsx';
import TopNav from './components/TopNav.jsx';
import FAQ from './components/FAQ.jsx';
import PrivacyPolicy from './components/PrivacyPolicy.jsx';
import AdminLogin from './components/AdminLogin.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import LoginModal from './components/LoginModal.jsx';
import { authAPI } from './services/apiService.js';

/**
 * Extract debate topic and post timestamp from the URL path
 *
 * Supports multiple URL formats:
 * - Clean URLs: /hindu_vs_muslim → "Hindu vs Muslim"
 * - Post-specific URLs: /hindu_vs_muslim/q02.08.2026.14.51.44.830-298 → "Hindu vs Muslim" with timestamp
 * - Legacy format: /debate_Sanatan_vs_Islam.html → "Sanatan vs Islam"
 *
 * This allows users to navigate directly to a specific debate via URL
 * and share links to specific posts within debates.
 *
 * @returns {object|null} - { topic: string, timestamp: string|null } or null if not a debate URL
 */
function getDebateInfoFromUrl() {
  const path = window.location.pathname;

  // Skip these special paths - they're not debate topics
  const specialPaths = ['/', '', '/contact', '/guidelines', '/faq', '/privacy'];
  if (specialPaths.includes(path)) {
    return null;
  }

  // Skip admin paths (including sub-sections)
  if (path.startsWith('/admin')) {
    return null;
  }

  // Legacy format: /debate_Topic_Name.html
  const legacyMatch = path.match(/debate_(.+)\.html$/);
  if (legacyMatch) {
    return {
      topic: decodeURIComponent(legacyMatch[1]).replace(/_/g, ' '),
      timestamp: null
    };
  }

  // Post-specific format: /topic_name/timestamp
  // Supports both question (q) and reply (r) timestamp prefixes
  const postMatch = path.match(/^\/([^\/]+)\/([qr]\d+\.\d+\.\d+\.\d+\.\d+\.\d+\.\d+-\d+)$/);
  if (postMatch) {
    const topic = decodeURIComponent(postMatch[1]).replace(/_/g, ' ');
    const timestamp = postMatch[2];
    return {
      topic: topic.split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' '),
      timestamp
    };
  }

  // Clean URL format: /hindu_vs_muslim
  const topic = decodeURIComponent(path.slice(1)).replace(/_/g, ' ');
  return {
    topic: topic.split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' '),
    timestamp: null
  };
}

/**
 * MainRouter Component
 *
 * Handles navigation between different pages of the application.
 * Uses React state to track which page to display, avoiding the need
 * for a heavy routing library like React Router.
 */
function MainRouter() {
  const { user, isAuthenticated, logout, showLoginModal } = useAuth();
  /**
   * Page state - determines which component to render
   *
   * Structure:
   * - { type: 'home' } - Show debate topics list
   * - { type: 'debate', topic: 'Sanatan vs Islam', timestamp: null } - Show specific debate
   * - { type: 'debate', topic: 'Sanatan vs Islam', timestamp: 'q02.08.2026.14.51.44.830-298' } - Show specific debate with post highlighted
   * - { type: 'contact' } - Show contact page
   * - { type: 'guidelines' } - Show guidelines
   * - { type: 'faq' } - Show FAQ
   */
  const [page, setPage] = useState(() => {
    // Initialize based on URL - if URL contains a debate topic, go directly to it
    const debateInfo = getDebateInfoFromUrl();
    if (debateInfo) return { type: 'debate', topic: debateInfo.topic, timestamp: debateInfo.timestamp };
    return { type: 'home' };
  });

  // Admin authentication state
  // TODO: Replace with session-based auth from backend API
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    // Check if admin is уже logged in on page load
    return authAPI.isAuthenticated();
  });

  // Check for admin route in URL and restore authentication
  useEffect(() => {
    const path = window.location.pathname;

    if (path.includes('/admin')) {
      // Check if user is authenticated
      if (authAPI.isAuthenticated()) {
        setIsAdminLoggedIn(true);
        // Extract admin sub-section from URL
        const adminSection = path.split('/')[2] || 'debate';
        setPage({ type: 'admin', section: adminSection });
      } else {
        // Not authenticated, show login
        setPage({ type: 'admin' });
      }
    }
  }, []);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;

      // Determine which page to show based on URL
      if (path === '/' || path === '') {
        setPage({ type: 'home' });
      } else if (path.startsWith('/admin')) {
        // Extract admin sub-section from URL
        const adminSection = path.split('/')[2] || 'debate';
        if (authAPI.isAuthenticated()) {
          setIsAdminLoggedIn(true);
          setPage({ type: 'admin', section: adminSection });
        } else {
          setPage({ type: 'admin' });
        }
      } else if (path === '/contact') {
        setPage({ type: 'contact' });
      } else if (path === '/guidelines') {
        setPage({ type: 'guidelines' });
      } else if (path === '/faq') {
        setPage({ type: 'faq' });
      } else if (path === '/privacy') {
        setPage({ type: 'privacy' });
      } else {
        // Assume it's a debate topic URL
        const debateInfo = getDebateInfoFromUrl();
        if (debateInfo) {
          setPage({ type: 'debate', topic: debateInfo.topic, timestamp: debateInfo.timestamp });
        } else {
          // Invalid path, redirect to home
          window.history.replaceState({}, '', '/');
          setPage({ type: 'home' });
        }
      }
    };

    // Listen for browser back/forward navigation
    window.addEventListener('popstate', handlePopState);

    // Cleanup listener on unmount
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Admin logout handler
  const handleAdminLogout = () => {
    // TODO: Call backend logout API
    setIsAdminLoggedIn(false);
    window.history.pushState({}, '', '/');
    setPage({ type: 'home' });
  };

  // Admin login handler
  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
    const adminSection = page.section || 'debate';
    window.history.pushState({}, '', `/admin/${adminSection}`);
    setPage({ type: 'admin', section: adminSection });
  };

  /**
   * Jump to a specific post by its uniqueId
   *
   * This feature allows users to:
   * 1. Copy a post's uniqueId
   * 2. Share it with others
   * 3. Others can paste it in the "Jump to Unique ID" box
   * 4. The page scrolls to that specific post and highlights it
   *
   * @param {string} id - The uniqueId to jump to
   */
  const jumpToUniqueId = (id) => {
    if (!id) return;

    // Find the element with this uniqueId (set via data-uniqueid attribute in Card.jsx)
    const el = document.querySelector(`[data-uniqueid="${id}"]`);

    if (el) {
      // Scroll smoothly to the element
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Temporarily highlight the element
      el.classList.add('highlight-reply');
      setTimeout(() => el.classList.remove('highlight-reply'), 1800);
    } else {
      toast.error('Unique ID not found on this page.');
    }
  };

  /**
   * Props for the TopNav component
   * These callbacks allow TopNav to trigger navigation
   * Each navigation also updates the URL for shareability
   */
  const navProps = {
    onHome: () => {
      window.history.pushState({}, '', '/');
      setPage({ type: 'home' });
    },
    onContact: () => {
      window.history.pushState({}, '', '/contact');
      setPage({ type: 'contact' });
    },
    onGuidelines: () => {
      window.history.pushState({}, '', '/guidelines');
      setPage({ type: 'guidelines' });
    },
    onFAQ: () => {
      window.history.pushState({}, '', '/faq');
      setPage({ type: 'faq' });
    },
    onPrivacy: () => {
      window.history.pushState({}, '', '/privacy');
      setPage({ type: 'privacy' });
    },
    onAdmin: () => {
      window.history.pushState({}, '', '/admin/debate');
      setPage({ type: 'admin', section: 'debate' });
    },
    active: page.type,
    // Jump feature only available on debate pages
    onJump: page.type === 'debate' ? jumpToUniqueId : undefined,
    isAdminLoggedIn,
    onAdminLogin: handleAdminLogin,
    onAdminLogout: handleAdminLogout,
    isUserLoggedIn: isAuthenticated,
    onUserLogin: () => showLoginModal('login'),
    onUserLogout: logout,
    user
  };

  return (
    <>
      {/* Navigation bar - appears on all pages except admin */}
      {page.type !== 'admin' && <TopNav {...navProps} />}

      {/* Login Modal - shown when guest tries protected actions */}
      <LoginModal />

      {/* Render the appropriate page based on current state */}
      <div data-testid="page-container">
      {page.type === 'home' && (
        <div data-testid="debate-topics-page">
          <DebateTopics
            onSelectTopic={(topic) => {
              // Convert topic to URL-friendly format: "Hindu vs Muslim" → "hindu_vs_muslim"
              const urlTopic = topic.toLowerCase().replace(/\s+/g, '_');
              // Update browser URL (makes it shareable)
              window.history.pushState({}, '', `/${urlTopic}`);
              // Update React state to show debate page
              setPage({ type: 'debate', topic });
            }}
          />
        </div>
      )}

      {page.type === 'debate' && (
        <div data-testid="debate-page">
          <App topic={page.topic} timestamp={page.timestamp} />
        </div>
      )}

      {page.type === 'contact' && (
        <div data-testid="contact-page">
          <ContactUs />
        </div>
      )}

      {page.type === 'guidelines' && (
        <div data-testid="guidelines-page">
          <Guidelines />
        </div>
      )}

      {page.type === 'faq' && (
        <div data-testid="faq-page">
          <FAQ />
        </div>
      )}

      {page.type === 'privacy' && (
        <div data-testid="privacy-policy-page">
          <PrivacyPolicy />
        </div>
      )}

      {page.type === 'admin' && (
        <div data-testid="admin-page">
          {!isAdminLoggedIn ? (
            <AdminLogin onLogin={handleAdminLogin} />
          ) : (
            <AdminDashboard
              onLogout={handleAdminLogout}
              onBackToSite={() => setPage({ type: 'home' })}
              initialSection={page.section || 'debate'}
            />
          )}
        </div>
      )}
      </div>
    </>
  );
}

// =====================================================================
// APPLICATION BOOTSTRAP
// =====================================================================

/**
 * Mount the React application to the DOM
 *
 * Wrapped with:
 * - GoogleOAuthProvider: Enables Google Sign-In
 * - AuthProvider: Manages authentication state
 * - ErrorBoundary: Catches React errors
 * - StrictMode: Development checks
 */

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
  // Removed hard throw to avoid breaking production when env is missing.
  // Instead log a clear message — the app will still render but Google login will be disabled.
  console.error('VITE_GOOGLE_CLIENT_ID is not defined. Google Sign-In will be disabled.');
}

function AppRoot() {
  return (
    <StrictMode>
      <ErrorBoundary>
        {GOOGLE_CLIENT_ID ? (
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <AuthProvider>
              <MainRouter />
            </AuthProvider>
          </GoogleOAuthProvider>
        ) : (
          <AuthProvider>
            <MainRouter />
          </AuthProvider>
        )}
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      </ErrorBoundary>
    </StrictMode>
  );
}

createRoot(document.getElementById('root')).render(<AppRoot />);

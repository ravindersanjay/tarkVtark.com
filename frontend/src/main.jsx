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
import { AuthProvider } from './contexts/AuthContext.jsx';
import './index.css';
import App from './App.jsx';
import DebateTopics from './components/DebateTopics.jsx';
import ContactUs from './components/ContactUs.jsx';
import Guidelines from './components/Guidelines.jsx';
import TopNav from './components/TopNav.jsx';
import FAQ from './components/FAQ.jsx';
import AdminLogin from './components/AdminLogin.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import LoginModal from './components/LoginModal.jsx';
import UserProfile from './components/UserProfile.jsx';

/**
 * Extract debate topic from the URL path
 *
 * Supports multiple URL formats:
 * - Clean URLs: /hindu_vs_muslim → "Hindu vs Muslim"
 * - Legacy format: /debate_Sanatan_vs_Islam.html → "Sanatan vs Islam"
 *
 * This allows users to navigate directly to a specific debate via URL
 * and share links to specific debates.
 *
 * @returns {string|null} - The debate topic with proper capitalization, or null if not a debate URL
 */
function getDebateTopicFromUrl() {
  const path = window.location.pathname;

  // Skip these special paths - they're not debate topics
  const specialPaths = ['/', '', '/admin', '/contact', '/guidelines', '/faq'];
  if (specialPaths.includes(path)) {
    return null;
  }

  // Legacy format: /debate_Topic_Name.html
  const legacyMatch = path.match(/debate_(.+)\.html$/);
  if (legacyMatch) {
    return legacyMatch[1].replace(/_/g, ' ');
  }

  // Clean URL format: /hindu_vs_muslim
  // Remove leading slash and convert underscores to spaces
  const topic = path.slice(1).replace(/_/g, ' ');

  // Capitalize each word properly: "hindu vs muslim" → "Hindu vs Muslim"
  return topic.split(' ').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
}

/**
 * MainRouter Component
 *
 * Handles navigation between different pages of the application.
 * Uses React state to track which page to display, avoiding the need
 * for a heavy routing library like React Router.
 */
function MainRouter() {
  /**
   * Page state - determines which component to render
   *
   * Structure:
   * - { type: 'home' } - Show debate topics list
   * - { type: 'debate', topic: 'Sanatan vs Islam' } - Show specific debate
   * - { type: 'contact' } - Show contact page
   * - { type: 'guidelines' } - Show guidelines
   * - { type: 'faq' } - Show FAQ
   */
  const [page, setPage] = useState(() => {
    // Initialize based on URL - if URL contains a debate topic, go directly to it
    const topic = getDebateTopicFromUrl();
    if (topic) return { type: 'debate', topic };
    return { type: 'home' };
  });

  // Admin authentication state
  // TODO: Replace with session-based auth from backend API
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Check for admin route in URL
  useEffect(() => {
    if (window.location.pathname.includes('/admin')) {
      setPage({ type: 'admin' });
    }
  }, []);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;

      // Determine which page to show based on URL
      if (path === '/' || path === '') {
        setPage({ type: 'home' });
      } else if (path === '/admin') {
        setPage({ type: 'admin' });
      } else if (path === '/contact') {
        setPage({ type: 'contact' });
      } else if (path === '/guidelines') {
        setPage({ type: 'guidelines' });
      } else if (path === '/faq') {
        setPage({ type: 'faq' });
      } else {
        // Assume it's a debate topic URL
        const topic = getDebateTopicFromUrl();
        if (topic) {
          setPage({ type: 'debate', topic });
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
    window.history.pushState({}, '', '/admin');
    setPage({ type: 'admin' });
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
      alert('Unique ID not found on this page.');
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
    onAdmin: () => {
      window.history.pushState({}, '', '/admin');
      setPage({ type: 'admin' });
    },
    active: page.type,
    // Jump feature only available on debate pages
    onJump: page.type === 'debate' ? jumpToUniqueId : undefined
  };

  return (
    <>
      {/* Navigation bar - appears on all pages except admin */}
      {page.type !== 'admin' && (
        <>
          <TopNav {...navProps} />
          <UserProfile />
        </>
      )}

      {/* Login Modal - shown when guest tries protected actions */}
      <LoginModal />

      {/* Render the appropriate page based on current state */}
      {page.type === 'home' && (
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
      )}

      {page.type === 'debate' && (
        <App topic={page.topic} />
      )}

      {page.type === 'contact' && (
        <ContactUs />
      )}

      {page.type === 'guidelines' && (
        <Guidelines />
      )}

      {page.type === 'faq' && (
        <FAQ />
      )}

      {page.type === 'admin' && (
        <>
          {!isAdminLoggedIn ? (
            <AdminLogin onLogin={handleAdminLogin} />
          ) : (
            <AdminDashboard
              onLogout={handleAdminLogout}
              onBackToSite={() => setPage({ type: 'home' })}
            />
          )}
        </>
      )}
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
      </ErrorBoundary>
    </StrictMode>
  );
}

createRoot(document.getElementById('root')).render(<AppRoot />);

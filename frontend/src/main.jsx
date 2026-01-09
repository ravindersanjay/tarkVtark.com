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

/**
 * Extract debate topic from the URL path
 *
 * URL format: /debate_Sanatan_vs_Islam.html
 * Returns: "Sanatan vs Islam"
 *
 * This allows users to navigate directly to a specific debate via URL.
 *
 * @returns {string|null} - The debate topic, or null if not a debate URL
 */
function getDebateTopicFromUrl() {
  const m = window.location.pathname.match(/debate_(.+)\.html$/);
  if (m) {
    // Replace underscores with spaces to get readable topic name
    return m[1].replace(/_/g, ' ');
  }
  return null;
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

  // Admin logout handler
  const handleAdminLogout = () => {
    // TODO: Call backend logout API
    setIsAdminLoggedIn(false);
    setPage({ type: 'home' });
  };

  // Admin login handler
  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
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
   */
  const navProps = {
    onHome: () => setPage({ type: 'home' }),
    onContact: () => setPage({ type: 'contact' }),
    onGuidelines: () => setPage({ type: 'guidelines' }),
    onFAQ: () => setPage({ type: 'faq' }),
    onAdmin: () => setPage({ type: 'admin' }),
    active: page.type,
    // Jump feature only available on debate pages
    onJump: page.type === 'debate' ? jumpToUniqueId : undefined
  };

  return (
    <>
      {/* Navigation bar - appears on all pages except admin */}
      {page.type !== 'admin' && <TopNav {...navProps} />}

      {/* Render the appropriate page based on current state */}
      {page.type === 'home' && (
        <DebateTopics
          onSelectTopic={(topic) => setPage({ type: 'debate', topic })}
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
 * StrictMode is a development tool that:
 * - Identifies components with unsafe lifecycles
 * - Warns about legacy APIs
 * - Detects unexpected side effects
 *
 * It doesn't affect production builds.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <MainRouter />
    </ErrorBoundary>
  </StrictMode>
);

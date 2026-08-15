import React, { useState } from 'react';
import logoFallback from '../assets/react.svg';

// TopNav is a small, presentational component that renders the application
// navigation and the "jump to unique ID" input. The component is intentionally
// simple and receives callbacks via props to keep side-effects outside.

/**
 * TopNav - Main navigation bar for the app, shown on all pages
 * @param {function} onHome - go to home page
 * @param {function} onContact - go to contact page
 * @param {function} onGuidelines - go to guidelines page
 * @param {function} onFAQ - go to FAQ page
 * @param {function} onPrivacy - go to privacy policy page
 * @param {function} onAdmin - go to admin panel
 * @param {string} active - which nav item is active
 * @param {function} onJump - callback for unique ID jump
 * @param {boolean} isAdminLoggedIn - whether admin is logged in
 * @param {function} onAdminLogin - callback to go to admin login
 * @param {function} onAdminLogout - callback to logout admin
 * @param {boolean} isUserLoggedIn - whether user is logged in
 * @param {function} onUserLogin - callback to show user login modal
 * @param {function} onUserLogout - callback to logout user
 * @param {object} user - current user object
 */
const TopNav = ({ onHome, onContact, onGuidelines, onFAQ, onPrivacy, onAdmin, active, onJump, isAdminLoggedIn, onAdminLogin, onAdminLogout, isUserLoggedIn, onUserLogin, onUserLogout, user }) => {
  const [jumpId, setJumpId] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavClick = (callback) => {
    callback();
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="topnav">
      <div className="topnav-inner">
        {/* logo: prefers /tarkVtark_Logo.jpg in public, falls back to bundled asset */}
        <img
          src="/tarkVtark_Logo.png"
          alt="tarkVtark logo"
          className="nav-logo"
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = logoFallback; }}
          onClick={onHome}
        />
        {/* Navigation links - desktop */}
        <span className={`topnav-link${active === 'home' ? ' active' : ''}`} onClick={onHome}>Home</span>
        <span className={`topnav-link${active === 'guidelines' ? ' active' : ''}`} onClick={onGuidelines}>Guidelines</span>
        <span className={`topnav-link${active === 'faq' ? ' active' : ''}`} onClick={onFAQ}>FAQ</span>
        <span className={`topnav-link${active === 'privacy' ? ' active' : ''}`} onClick={onPrivacy}>Privacy Policy</span>
        <span className={`topnav-link${active === 'contact' ? ' active' : ''}`} onClick={onContact}>Contact Us</span>
        {/* User Login/Logout button */}
        {isUserLoggedIn && user ? (
          <span className="topnav-link user-info" onClick={onUserLogout}>
            {user.profilePicture && (
              <img src={user.profilePicture} alt={user.name} className="nav-user-avatar" />
            )}
            <span className="nav-user-name">{user.name}</span>
            <span className="nav-logout">Logout</span>
          </span>
        ) : (
          <span className="topnav-link" onClick={onUserLogin}>Login</span>
        )}
        <span className={`topnav-link${active === 'admin' ? ' active' : ''}`} onClick={onAdmin}>Admin Login</span>
        {/* Jump to Unique ID - desktop */}
        <div className="topnav-jump">
          <input
            type="text"
            className="jump-input"
            placeholder="Jump to Unique ID..."
            value={jumpId}
            onChange={e => setJumpId(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && onJump) onJump(jumpId.trim()); }}
          />
          <button className="btn primary" style={{ marginLeft: 4 }} onClick={() => onJump && onJump(jumpId.trim())}>Go</button>
        </div>
        {/* Hamburger menu button - mobile */}
        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
          ☰
        </button>
      </div>
      {/* Mobile menu dropdown */}
      <div className={`mobile-menu${isMobileMenuOpen ? ' open' : ''}`}>
        <a className={`mobile-menu-link${active === 'home' ? ' active' : ''}`} onClick={() => handleNavClick(onHome)}>Home</a>
        <a className={`mobile-menu-link${active === 'guidelines' ? ' active' : ''}`} onClick={() => handleNavClick(onGuidelines)}>Guidelines</a>
        <a className={`mobile-menu-link${active === 'faq' ? ' active' : ''}`} onClick={() => handleNavClick(onFAQ)}>FAQ</a>
        <a className={`mobile-menu-link${active === 'privacy' ? ' active' : ''}`} onClick={() => handleNavClick(onPrivacy)}>Privacy Policy</a>
        <a className={`mobile-menu-link${active === 'contact' ? ' active' : ''}`} onClick={() => handleNavClick(onContact)}>Contact Us</a>
        {isUserLoggedIn && user ? (
          <a className="mobile-menu-link" onClick={() => handleNavClick(onUserLogout)}>
            {user.name} (Logout)
          </a>
        ) : (
          <a className="mobile-menu-link" onClick={() => handleNavClick(onUserLogin)}>Login</a>
        )}
        <a className={`mobile-menu-link${active === 'admin' ? ' active' : ''}`} onClick={() => handleNavClick(onAdmin)}>Admin Login</a>
      </div>
    </nav>
  );
};

export default TopNav;

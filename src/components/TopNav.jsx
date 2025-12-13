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
 * @param {function} onAdmin - go to admin panel
 * @param {string} active - which nav item is active
 * @param {function} onJump - callback for unique ID jump
 */
const TopNav = ({ onHome, onContact, onGuidelines, onFAQ, onAdmin, active, onJump }) => {
  const [jumpId, setJumpId] = useState('');
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
        {/* Navigation links */}
        <span className={`topnav-link${active === 'home' ? ' active' : ''}`} onClick={onHome}>Home</span>
        <span className={`topnav-link${active === 'guidelines' ? ' active' : ''}`} onClick={onGuidelines}>Guidelines</span>
        <span className={`topnav-link${active === 'faq' ? ' active' : ''}`} onClick={onFAQ}>FAQ</span>
        <span className={`topnav-link${active === 'contact' ? ' active' : ''}`} onClick={onContact}>Contact Us</span>
        <span className={`topnav-link${active === 'admin' ? ' active' : ''}`} onClick={onAdmin}>Admin</span>
        {/* Jump to Unique ID */}
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
      </div>
    </nav>
  );
};

export default TopNav;

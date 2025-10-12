
import React, { useState } from 'react';

/**
 * TopNav - Main navigation bar for the app, shown on all pages
 * @param {function} onHome - go to home page
 * @param {function} onContact - go to contact page
 * @param {function} onGuidelines - go to guidelines page
 * @param {function} onFAQ - go to FAQ page
 * @param {string} active - which nav item is active
 * @param {function} onJump - callback for unique ID jump
 */
const TopNav = ({ onHome, onContact, onGuidelines, onFAQ, active, onJump }) => {
  const [jumpId, setJumpId] = useState('');
  return (
    <nav className="topnav">
      {/* Navigation links */}
  <span className={`topnav-link${active === 'home' ? ' active' : ''}`} onClick={onHome}>Home</span>
  <span className={`topnav-link${active === 'guidelines' ? ' active' : ''}`} onClick={onGuidelines}>Guidelines</span>
  <span className={`topnav-link${active === 'faq' ? ' active' : ''}`} onClick={onFAQ}>FAQ</span>
  <span className={`topnav-link${active === 'contact' ? ' active' : ''}`} onClick={onContact}>Contact Us</span>
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
    </nav>
  );
};

export default TopNav;

// Guidelines component styles are now modularized in styles/guidelines.css
import '../styles/guidelines.css';
import React, { useState, useEffect } from 'react';

const Guidelines = ({ onBack }) => {
  const [guidelines, setGuidelines] = useState([]);

  // Load guidelines from admin-managed data or use defaults
  useEffect(() => {
    const adminGuidelines = localStorage.getItem('admin_guidelines');
    if (adminGuidelines) {
      setGuidelines(JSON.parse(adminGuidelines));
    } else {
      // Default guidelines
      setGuidelines([
        'Be respectful and constructive in your arguments.',
        'No hate speech, personal attacks, or discrimination.',
        'Support your points with evidence where possible.',
        'Stay on topic and avoid spamming.',
        'Report inappropriate content to moderators.'
      ]);
    }
  }, []);

  return (
    <>
      <div className="breadcrumb">Home &gt; Guidelines</div>
      <div className="guidelines-container content-card">
        <header className="header">
        </header>
        <div className="main-content">
          <div className="guidelines-section">
            <h2>Community Guidelines</h2>
            <ul className="guidelines-list">
              {guidelines.map((guideline, idx) => (
                <li key={idx}>{guideline}</li>
              ))}
            </ul>
            <button className="add-btn" onClick={onBack}>Back</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Guidelines;

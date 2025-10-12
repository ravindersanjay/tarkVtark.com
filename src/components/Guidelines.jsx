
// Guidelines component styles are now modularized in styles/guidelines.css
import '../styles/guidelines.css';
import React from 'react';

const Guidelines = ({ onBack }) => (
  <div className="guidelines-container">
    <header className="header">
      <div className="brand">Debate Arena</div>
    </header>
    <div className="breadcrumb">Home &gt; Guidelines</div>
    <div className="main-content">
      <div className="guidelines-section">
        <h2>Community Guidelines</h2>
        <ul className="guidelines-list">
          <li>Be respectful and constructive in your arguments.</li>
          <li>No hate speech, personal attacks, or discrimination.</li>
          <li>Support your points with evidence where possible.</li>
          <li>Stay on topic and avoid spamming.</li>
          <li>Report inappropriate content to moderators.</li>
        </ul>
        <button className="add-btn" onClick={onBack}>Back</button>
      </div>
    </div>
  </div>
);

export default Guidelines;

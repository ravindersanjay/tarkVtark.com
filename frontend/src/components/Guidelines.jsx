// Guidelines component styles are now modularized in styles/guidelines.css
import '../styles/guidelines.css';
import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/apiService.js';

const Guidelines = ({ onBack }) => {
  const [guidelines, setGuidelines] = useState([]);

  // Load guidelines from backend API
  useEffect(() => {
    // TODO: Fetch from backend when API is ready
    // For now, use default guidelines
    setGuidelines([
      'सवाल : आपने चोरी की है क्या?',
      'सही जवाब : मैने चोरी नहीं की ✅',
      'सही जवाब : हां मैने चोरी  की  है✅',
      'सही जवाब : आपको लगता है मैंने चोरी की है तो सबूत दिखाओै✅',
      'गलत जवाब : आप ने भी तो चोरी की है❌',
      'गलत जवाब : नेता और अधिकारी भी तो चोरी करते है।❌',
      'गलत जवाब : किसी भ्रष्ट धनवान से धन चुराकर किसी निर्धन की सहायता करने में क्या गलत है ❌',
      'Be respectful and constructive in your arguments.',
      'No hate speech, personal attacks, or discrimination.',
      'Support your points with evidence where possible.',
      'Stay on topic and avoid spamming.',
      'Report inappropriate content to moderators.'
    ]);

    // Uncomment when backend is ready:
    // adminAPI.getGuidelines()
    //   .then(setGuidelines)
    //   .catch(err => console.error('Failed to load guidelines:', err));
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
          </div>
        </div>
      </div>
    </>
  );
};

export default Guidelines;

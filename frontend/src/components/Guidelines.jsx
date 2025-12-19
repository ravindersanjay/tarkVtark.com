// Guidelines component styles are now modularized in styles/guidelines.css
import '../styles/guidelines.css';
import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/apiService.js';

const Guidelines = ({ onBack }) => {
  const [guidelines, setGuidelines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load guidelines from backend API
  useEffect(() => {
    const fetchGuidelines = async () => {
      try {
        setLoading(true);
        const data = await adminAPI.getGuidelines();
        setGuidelines(data);
      } catch (error) {
        console.error('Failed to load guidelines:', error);
        // Use default guidelines on error
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
      } finally {
        setLoading(false);
      }
    };

    fetchGuidelines();
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
            {loading ? (
              <p>Loading guidelines...</p>
            ) : (
              <ul className="guidelines-list">
                {guidelines.map((guideline, idx) => (
                  <li key={idx}>{guideline}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Guidelines;

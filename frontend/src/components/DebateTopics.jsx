import React, { useState, useEffect } from 'react';
import { topicsAPI } from '../services/apiService.js';

/**
 * =====================================================================
 * DebateTopics Component - Home Page
 * =====================================================================
 *
 * This is the home page that displays a list of debate topics.
 * Users can click a topic to navigate to that debate, or add new topics.
 *
 * FEATURES:
 * - Display list of debate topics from PostgreSQL database (via API)
 * - Click a topic to navigate to that debate
 * - Add new topics (format: "X vs Y")
 * - Topics persist in database
 *
 * @param {Function} onSelectTopic - Callback when a topic is clicked: (topic: string) => void
 * @param {Function} onContact - Optional callback for Contact Us navigation
 */
const DebateTopics = ({ onSelectTopic, onContact }) => {
  // Load topics from backend API
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTopic, setNewTopic] = useState('');

  // Fetch topics from backend on mount
  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch topics from backend API
      const data = await topicsAPI.getAll();
      setTopics(data.map(t => t.topic));
    } catch (err) {
      console.error('Failed to load topics:', err);
      setError('Failed to load topics. Please make sure the backend is running.');
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Add a new debate topic to the list
   * Validates format (must be "X vs Y") and checks for duplicates
   */
  const addTopic = async () => {
    const t = newTopic.trim();

    // Validate format
    if (!t || !/^.+ vs .+$/.test(t)) return alert('Enter topic as "x vs y"');

    // Check for duplicates
    if (topics.includes(t)) return alert('Topic already exists');

    try {
      // Parse topic to extract labels
      const parts = t.split(/\s+vs\s+/i);
      const leftLabel = parts[0].trim();
      const rightLabel = parts[1].trim();

      // Save to backend database
      await topicsAPI.create({
        topic: t,
        leftLabel,
        rightLabel,
        description: '',
        isActive: true
      });

      // Clear input
      setNewTopic('');

      // Reload from backend to ensure sync
      await loadTopics();

      alert('Topic added successfully!');
    } catch (err) {
      console.error('Failed to add topic:', err);
      alert('Failed to add topic. Please try again.');
    }
  };

  return (
    <>
      <div className="breadcrumb">Home</div>
      <div className="home-container content-card">
        <header className="header">
          {onContact && <button className="btn" onClick={onContact}>Contact</button>}
        </header>
        <div className="main-content">
          <div className="topics-section">
            <h2>Debate Topics</h2>

            {/* Show loading/error states */}
            {loading && <p>Loading topics...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* List of debate topics */}
            <ul className="topics-list">
              {topics.length === 0 && !loading && !error && (
                <li style={{ color: '#666', fontStyle: 'italic' }}>
                  No topics yet. Add one below to get started!
                </li>
              )}
              {topics.map((t) => (
                <li key={t}>
                  {/* Click to navigate to debate - calls onSelectTopic callback */}
                  <button className="topic-btn" onClick={() => onSelectTopic(t.trim())}>
                    {t}
                  </button>
                </li>
              ))}
            </ul>

            {/* Form to add new topics */}
            <div className="add-topic-form">
              <input
                type="text"
                placeholder="Add topic (e.g. Cats vs Dogs)"
                value={newTopic}
                onChange={e => setNewTopic(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTopic();
                  }
                }}
                className="topic-input"
              />
              <button className="add-btn" onClick={addTopic}>Add Topic</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DebateTopics;

import React, { useState } from 'react';

const TOPICS_KEY = 'debate_topics_list';

/**
 * =====================================================================
 * DebateTopics Component - Home Page
 * =====================================================================
 *
 * This is the home page that displays a list of debate topics.
 * Users can click a topic to navigate to that debate, or add new topics.
 *
 * FEATURES:
 * - Display list of debate topics from localStorage
 * - Click a topic to navigate to that debate
 * - Add new topics (format: "X vs Y")
 * - Topics persist in localStorage
 *
 * @param {Function} onSelectTopic - Callback when a topic is clicked: (topic: string) => void
 * @param {Function} onContact - Optional callback for Contact Us navigation
 */
const DebateTopics = ({ onSelectTopic, onContact }) => {
  // Load topics from localStorage on mount
  const [topics, setTopics] = useState(() => {
    const s = localStorage.getItem(TOPICS_KEY);
    if (s) {
      try { return JSON.parse(s); } catch (e) { return []; }
    }
    return [];
  });

  const [newTopic, setNewTopic] = useState('');

  /**
   * Add a new debate topic to the list
   * Validates format (must be "X vs Y") and checks for duplicates
   */
  const addTopic = () => {
    const t = newTopic.trim();

    // Validate format
    if (!t || !/^.+ vs .+$/.test(t)) return alert('Enter topic as "x vs y"');

    // Check for duplicates
    if (topics.includes(t)) return alert('Topic already exists');

    // Add to list and save
    const updated = [...topics, t];
    setTopics(updated);
    localStorage.setItem(TOPICS_KEY, JSON.stringify(updated));
    setNewTopic('');
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

            {/* List of debate topics */}
            <ul className="topics-list">
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

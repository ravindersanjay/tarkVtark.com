import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { topicsAPI } from '../services/apiService.js';
import { useAuth } from '../contexts/AuthContext.jsx';

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
 * - Add new topics (format: "X vs Y") - requires authentication
 * - Topics persist in database
 *
 * @param {Function} onSelectTopic - Callback when a topic is clicked: (topic: string) => void
 * @param {Function} onContact - Optional callback for Contact Us navigation
 */
const DebateTopics = ({ onSelectTopic, onContact }) => {
  const { isAuthenticated, showLoginModal } = useAuth();

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
      setTopics(data);
      // Clear error state on successful load
      setError(null);
    } catch (err) {
      console.error('Failed to load topics:', err);

      // Handle different error types
      if (err.isRateLimit) {
        setError(err.message);
      } else if (err.isDuplicate) {
        setError('Request already in progress. Please wait.');
      } else {
        setError('Failed to load topics. Please make sure the backend is running.');
      }
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Add a new debate topic to the list
   * Validates format (must be "X vs Y") and checks for duplicates
   * Requires authentication
   */
  const addTopic = async () => {
    // Check authentication first
    if (!isAuthenticated) {
      showLoginModal('create a new debate topic');
      return;
    }

    const t = newTopic.trim();

    // Validate format
    if (!t || !/^.+ vs .+$/.test(t)) return toast.error('Enter topic as "x vs y"');

    // Check for duplicates
    if (topics.some(topic => topic.topic === t)) return toast.error('Topic already exists');

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

      toast.success('Topic added successfully!');
    } catch (err) {
      console.error('Failed to add topic:', err);
      toast.error('Failed to add topic. Please try again.');
    }
  };

  return (
    <>
      <div className="breadcrumb" data-testid="home-breadcrumb">Home</div>
      <div className="home-container content-card" data-testid="home-container">
        <header className="header" data-testid="home-header">
          {onContact && <button className="btn" onClick={onContact} data-testid="home-contact-button">Contact</button>}
        </header>
        <div className="main-content" data-testid="home-main-content">
          <div className="topics-section" data-testid="topics-section">
            <h2 data-testid="topics-heading">Debate Topics({topics.length})</h2>

            {/* Show loading/error states */}
            {loading && <p data-testid="topics-loading">Loading topics...</p>}
            {error && <p data-testid="topics-error" style={{ color: 'red' }}>{error}</p>}

            {/* List of debate topics */}
            <ul className="topics-list" data-testid="topics-list">
              {topics.length === 0 && !loading && !error && (
                <li data-testid="topics-empty" style={{ color: '#666', fontStyle: 'italic' }}>
                  No topics yet. Add one below to get started!
                </li>
              )}
              {topics.map((t) => (
                <li key={t.id} data-testid="topic-list-item" data-topic-id={t.id}>
                  {/* Click to navigate to debate - calls onSelectTopic callback */}
                  <button className="topic-btn" data-testid={`topic-button-${t.id}`} onClick={() => onSelectTopic(t.topic.trim())}>
                    {t.topic}
                    <span className="question-count" data-testid={`topic-question-count-${t.id}`}>
                      {t.questionCount !== undefined ? `${t.questionCount} questions` : ''}
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            {/* Form to add new topics */}
            <div className="add-topic-form" data-testid="add-topic-form">
              <input
                type="text"
                data-testid="topic-input"
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
              <button className="add-btn" data-testid="add-topic-button" onClick={addTopic}>Add Topic</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DebateTopics;

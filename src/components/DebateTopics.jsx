import React, { useState } from 'react';

const TOPICS_KEY = 'debate_topics_list';

const getTopicFileName = (topic) => {
  // Replace spaces and special chars for filename
  return 'debate_' + topic.replace(/\s+/g, '_').replace(/[^\w_]/g, '') + '.html';
};


/**
 * DebateTopics - Home page for listing and adding debate topics
 * @param {function} onTopicClick - callback when a topic is selected
 */
/**
 * DebateTopics - Home page for listing and adding debate topics
 * @param {function} onTopicClick - callback when a topic is selected
 * @param {function} onContact - callback for Contact Us navigation (optional)
 */
const DebateTopics = ({ onTopicClick, onContact }) => {
  const [topics, setTopics] = useState(() => {
    const s = localStorage.getItem(TOPICS_KEY);
    if (s) {
      try { return JSON.parse(s); } catch (e) { return []; }
    }
    return [];
  });
  const [newTopic, setNewTopic] = useState('');

  // Add a new debate topic to the list
  const addTopic = () => {
    const t = newTopic.trim();
    if (!t || !/^.+ vs .+$/.test(t)) return alert('Enter topic as "x vs y"');
    if (topics.includes(t)) return alert('Topic already exists');
    const updated = [...topics, t];
    setTopics(updated);
    localStorage.setItem(TOPICS_KEY, JSON.stringify(updated));
    setNewTopic('');
  };

  return (
    <div className="home-container">
      <header className="header">
        <div className="brand">Debate Arena</div>
        {onContact && (
          <nav className="nav">
            <button className="nav-btn" onClick={onContact}>Contact Us</button>
          </nav>
        )}
      </header>
      <div className="breadcrumb">Home</div>
      <div className="main-content">
        <div className="topics-section">
          <h2>Debate Topics</h2>
          <ul className="topics-list">
            {topics.map((t) => (
              <li key={t}>
                <button className="topic-btn" onClick={() => onTopicClick(t.trim())}>{t}</button>
              </li>
            ))}
          </ul>
          <div className="add-topic-form">
            <input
              type="text"
              placeholder="Add topic (e.g. Cats vs Dogs)"
              value={newTopic}
              onChange={e => setNewTopic(e.target.value)}
              className="topic-input"
            />
            <button className="add-btn" onClick={addTopic}>Add Topic</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebateTopics;

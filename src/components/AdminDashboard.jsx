import React, { useState, useEffect } from 'react';
import '../styles/admin.css';

const TOPICS_KEY = 'debate_topics_list';
const MESSAGES_KEY = 'contact_messages';
const REPORTS_KEY = 'reported_posts';

/**
 * AdminDashboard Component
 * Central hub for moderating all aspects of the debate application
 */
const AdminDashboard = ({ onLogout, onBackToSite }) => {
  const [activeTab, setActiveTab] = useState('debates');
  const [topics, setTopics] = useState([]);
  const [messages, setMessages] = useState([]);
  const [reports, setReports] = useState([]);
  const [faqItems, setFaqItems] = useState([]);
  const [guidelines, setGuidelines] = useState([]);

  // Edit states
  const [editingTopic, setEditingTopic] = useState(null);
  const [editingFaq, setEditingFaq] = useState(null);
  const [editingGuideline, setEditingGuideline] = useState(null);

  // Form states
  const [newFaq, setNewFaq] = useState({ q: '', a: '' });
  const [newGuideline, setNewGuideline] = useState('');

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Load topics
    const topicsData = localStorage.getItem(TOPICS_KEY);
    setTopics(topicsData ? JSON.parse(topicsData) : []);

    // Load messages
    const messagesData = localStorage.getItem(MESSAGES_KEY);
    setMessages(messagesData ? JSON.parse(messagesData) : []);

    // Load reports
    const reportsData = localStorage.getItem(REPORTS_KEY);
    setReports(reportsData ? JSON.parse(reportsData) : []);

    // Load FAQ items (from localStorage or default)
    const faqData = localStorage.getItem('admin_faq_items');
    setFaqItems(faqData ? JSON.parse(faqData) : [
      { q: 'How do I add a new debate topic?', a: 'Go to the Home page and use the "Add Topic" form. Enter your topic in the format "X vs Y".' },
      { q: 'How do I participate in a debate?', a: 'Click on any debate topic to view and reply to questions and answers.' },
      { q: 'Can I report inappropriate content?', a: 'Yes, please use the Contact Us page to report any issues or inappropriate content.' },
      { q: 'How are replies organized?', a: 'Replies to answers can be promoted to new questions, creating a branching debate structure.' },
      { q: 'Is my data saved?', a: 'All debates and topics are saved in your browser local storage.' }
    ]);

    // Load guidelines
    const guidelinesData = localStorage.getItem('admin_guidelines');
    setGuidelines(guidelinesData ? JSON.parse(guidelinesData) : [
      'Be respectful and constructive in your arguments.',
      'No hate speech, personal attacks, or discrimination.',
      'Support your points with evidence where possible.',
      'Stay on topic and avoid spamming.',
      'Report inappropriate content to moderators.'
    ]);
  };

  // Topic Management
  const deleteTopic = (topic) => {
    if (window.confirm(`Delete debate "${topic}"? This will also delete all questions and answers.`)) {
      const updated = topics.filter(t => t !== topic);
      setTopics(updated);
      localStorage.setItem(TOPICS_KEY, JSON.stringify(updated));
      // Also delete the debate data
      localStorage.removeItem(`debate_data_${topic}`);
    }
  };

  const updateTopic = (oldTopic, newTopic) => {
    const updated = topics.map(t => t === oldTopic ? newTopic : t);
    setTopics(updated);
    localStorage.setItem(TOPICS_KEY, JSON.stringify(updated));

    // Move debate data to new key
    const oldData = localStorage.getItem(`debate_data_${oldTopic}`);
    if (oldData) {
      localStorage.setItem(`debate_data_${newTopic}`, oldData);
      localStorage.removeItem(`debate_data_${oldTopic}`);
    }
    setEditingTopic(null);
  };

  // Question/Answer Management (from specific debate)
  const [selectedDebate, setSelectedDebate] = useState(null);
  const [debateQuestions, setDebateQuestions] = useState([]);

  const loadDebateData = (topic) => {
    setSelectedDebate(topic);
    const data = localStorage.getItem(`debate_data_${topic}`);
    if (data) {
      const parsed = JSON.parse(data);
      setDebateQuestions(parsed.questions || []);
    } else {
      setDebateQuestions([]);
    }
  };

  const deleteQuestion = (questionId) => {
    if (window.confirm('Delete this question and all its replies?')) {
      const updated = debateQuestions.filter(q => q.id !== questionId);
      setDebateQuestions(updated);
      const debateData = { topic: selectedDebate, questions: updated };
      localStorage.setItem(`debate_data_${selectedDebate}`, JSON.stringify(debateData));
    }
  };

  const deleteReply = (questionId, replyId) => {
    if (window.confirm('Delete this reply?')) {
      const updated = debateQuestions.map(q => {
        if (q.id === questionId) {
          return { ...q, replies: q.replies.filter(r => r.id !== replyId) };
        }
        return q;
      });
      setDebateQuestions(updated);
      const debateData = { topic: selectedDebate, questions: updated };
      localStorage.setItem(`debate_data_${selectedDebate}`, JSON.stringify(debateData));
    }
  };

  // FAQ Management
  const saveFaqItems = (items) => {
    setFaqItems(items);
    localStorage.setItem('admin_faq_items', JSON.stringify(items));
  };

  const addFaq = () => {
    if (newFaq.q.trim() && newFaq.a.trim()) {
      saveFaqItems([...faqItems, { ...newFaq }]);
      setNewFaq({ q: '', a: '' });
    }
  };

  const updateFaq = (index, updatedFaq) => {
    const updated = [...faqItems];
    updated[index] = updatedFaq;
    saveFaqItems(updated);
    setEditingFaq(null);
  };

  const deleteFaq = (index) => {
    if (window.confirm('Delete this FAQ item?')) {
      saveFaqItems(faqItems.filter((_, i) => i !== index));
    }
  };

  // Guidelines Management
  const saveGuidelines = (items) => {
    setGuidelines(items);
    localStorage.setItem('admin_guidelines', JSON.stringify(items));
  };

  const addGuideline = () => {
    if (newGuideline.trim()) {
      saveGuidelines([...guidelines, newGuideline]);
      setNewGuideline('');
    }
  };

  const updateGuideline = (index, text) => {
    const updated = [...guidelines];
    updated[index] = text;
    saveGuidelines(updated);
    setEditingGuideline(null);
  };

  const deleteGuideline = (index) => {
    if (window.confirm('Delete this guideline?')) {
      saveGuidelines(guidelines.filter((_, i) => i !== index));
    }
  };

  // Reports Management
  const deleteReport = (index) => {
    const updated = reports.filter((_, i) => i !== index);
    setReports(updated);
    localStorage.setItem(REPORTS_KEY, JSON.stringify(updated));
  };

  const clearAllReports = () => {
    if (window.confirm('Clear all reports?')) {
      setReports([]);
      localStorage.setItem(REPORTS_KEY, JSON.stringify([]));
    }
  };

  // Messages Management
  const deleteMessage = (index) => {
    const updated = messages.filter((_, i) => i !== index);
    setMessages(updated);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(updated));
  };

  const clearAllMessages = () => {
    if (window.confirm('Clear all messages?')) {
      setMessages([]);
      localStorage.setItem(MESSAGES_KEY, JSON.stringify([]));
    }
  };

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-header-actions">
          <button className="btn" onClick={onBackToSite}>Back to Site</button>
          <button className="btn" onClick={onLogout}>Logout</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'debates' ? 'active' : ''}`}
          onClick={() => setActiveTab('debates')}
        >
          Debates ({topics.length})
        </button>
        <button
          className={`admin-tab ${activeTab === 'questions' ? 'active' : ''}`}
          onClick={() => setActiveTab('questions')}
        >
          Questions & Answers
        </button>
        <button
          className={`admin-tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Reports ({reports.length})
        </button>
        <button
          className={`admin-tab ${activeTab === 'faq' ? 'active' : ''}`}
          onClick={() => setActiveTab('faq')}
        >
          FAQ ({faqItems.length})
        </button>
        <button
          className={`admin-tab ${activeTab === 'guidelines' ? 'active' : ''}`}
          onClick={() => setActiveTab('guidelines')}
        >
          Guidelines ({guidelines.length})
        </button>
        <button
          className={`admin-tab ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          Messages ({messages.length})
        </button>
      </div>

      {/* Content */}
      <div className="admin-content">
        {/* Debates Tab */}
        {activeTab === 'debates' && (
          <div className="admin-section">
            <h2>Manage Debate Topics</h2>
            <div className="admin-list">
              {topics.length === 0 ? (
                <p className="empty-state">No debate topics yet.</p>
              ) : (
                topics.map((topic, index) => (
                  <div key={index} className="admin-item">
                    {editingTopic === topic ? (
                      <div className="edit-form">
                        <input
                          type="text"
                          defaultValue={topic}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateTopic(topic, e.target.value);
                            } else if (e.key === 'Escape') {
                              setEditingTopic(null);
                            }
                          }}
                          autoFocus
                          className="edit-input"
                        />
                        <button className="btn" onClick={() => setEditingTopic(null)}>Cancel</button>
                      </div>
                    ) : (
                      <>
                        <span className="item-text">{topic}</span>
                        <div className="item-actions">
                          <button className="btn btn-small" onClick={() => setEditingTopic(topic)}>Edit</button>
                          <button className="btn btn-small btn-danger" onClick={() => deleteTopic(topic)}>Delete</button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Questions & Answers Tab */}
        {activeTab === 'questions' && (
          <div className="admin-section">
            <h2>Manage Questions & Answers</h2>
            {!selectedDebate ? (
              <div>
                <p>Select a debate to manage its questions and answers:</p>
                <div className="debate-selector">
                  {topics.map((topic, index) => (
                    <button
                      key={index}
                      className="topic-btn"
                      onClick={() => loadDebateData(topic)}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div className="section-header">
                  <h3>{selectedDebate}</h3>
                  <button className="btn" onClick={() => setSelectedDebate(null)}>Back to Topics</button>
                </div>

                {debateQuestions.length === 0 ? (
                  <p className="empty-state">No questions in this debate yet.</p>
                ) : (
                  <div className="questions-list">
                    {debateQuestions.map((question) => (
                      <div key={question.id} className="question-item">
                        <div className="question-header">
                          <span className="question-tag">[{question.tag}]</span>
                          <span className="question-author">{question.author}</span>
                          <span className="question-id">ID: {question.uniqueId}</span>
                        </div>
                        <div className="question-text">{question.text}</div>
                        <div className="question-actions">
                          <button
                            className="btn btn-small btn-danger"
                            onClick={() => deleteQuestion(question.id)}
                          >
                            Delete Question
                          </button>
                        </div>

                        {/* Replies */}
                        {question.replies && question.replies.length > 0 && (
                          <div className="replies-section">
                            <h4>Replies ({question.replies.length})</h4>
                            {question.replies.map((reply) => (
                              <div key={reply.id} className="reply-item">
                                <div className="reply-author">{reply.author}</div>
                                <div className="reply-text">{reply.text}</div>
                                <button
                                  className="btn btn-small btn-danger"
                                  onClick={() => deleteReply(question.id, reply.id)}
                                >
                                  Delete Reply
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="admin-section">
            <div className="section-header">
              <h2>Reported Posts</h2>
              {reports.length > 0 && (
                <button className="btn btn-danger" onClick={clearAllReports}>Clear All</button>
              )}
            </div>
            <div className="admin-list">
              {reports.length === 0 ? (
                <p className="empty-state">No reported posts.</p>
              ) : (
                reports.map((report, index) => (
                  <div key={index} className="admin-item report-item">
                    <div className="report-details">
                      <div><strong>Post ID:</strong> {report.postId}</div>
                      <div><strong>Reported by:</strong> {report.reporter}</div>
                      <div><strong>Reason:</strong> {report.reason}</div>
                      <div><strong>Date:</strong> {report.timestamp}</div>
                    </div>
                    <button className="btn btn-small btn-danger" onClick={() => deleteReport(index)}>
                      Dismiss
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <div className="admin-section">
            <h2>Manage FAQ</h2>

            {/* Add New FAQ */}
            <div className="add-form">
              <h3>Add New FAQ</h3>
              <input
                type="text"
                placeholder="Question"
                value={newFaq.q}
                onChange={(e) => setNewFaq({ ...newFaq, q: e.target.value })}
                className="form-input"
              />
              <textarea
                placeholder="Answer"
                value={newFaq.a}
                onChange={(e) => setNewFaq({ ...newFaq, a: e.target.value })}
                className="form-textarea"
                rows="3"
              />
              <button className="add-btn" onClick={addFaq}>Add FAQ</button>
            </div>

            {/* FAQ List */}
            <div className="admin-list">
              {faqItems.map((faq, index) => (
                <div key={index} className="admin-item faq-item">
                  {editingFaq === index ? (
                    <div className="edit-form">
                      <input
                        type="text"
                        defaultValue={faq.q}
                        className="edit-input"
                        id={`faq-q-${index}`}
                      />
                      <textarea
                        defaultValue={faq.a}
                        className="edit-textarea"
                        rows="3"
                        id={`faq-a-${index}`}
                      />
                      <div className="form-actions">
                        <button
                          className="btn"
                          onClick={() => {
                            const q = document.getElementById(`faq-q-${index}`).value;
                            const a = document.getElementById(`faq-a-${index}`).value;
                            updateFaq(index, { q, a });
                          }}
                        >
                          Save
                        </button>
                        <button className="btn" onClick={() => setEditingFaq(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="faq-content">
                        <div className="faq-q"><strong>Q:</strong> {faq.q}</div>
                        <div className="faq-a"><strong>A:</strong> {faq.a}</div>
                      </div>
                      <div className="item-actions">
                        <button className="btn btn-small" onClick={() => setEditingFaq(index)}>Edit</button>
                        <button className="btn btn-small btn-danger" onClick={() => deleteFaq(index)}>Delete</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Guidelines Tab */}
        {activeTab === 'guidelines' && (
          <div className="admin-section">
            <h2>Manage Guidelines</h2>

            {/* Add New Guideline */}
            <div className="add-form">
              <h3>Add New Guideline</h3>
              <input
                type="text"
                placeholder="Enter guideline text"
                value={newGuideline}
                onChange={(e) => setNewGuideline(e.target.value)}
                className="form-input"
              />
              <button className="add-btn" onClick={addGuideline}>Add Guideline</button>
            </div>

            {/* Guidelines List */}
            <div className="admin-list">
              {guidelines.map((guideline, index) => (
                <div key={index} className="admin-item">
                  {editingGuideline === index ? (
                    <div className="edit-form">
                      <input
                        type="text"
                        defaultValue={guideline}
                        className="edit-input"
                        id={`guideline-${index}`}
                      />
                      <div className="form-actions">
                        <button
                          className="btn"
                          onClick={() => {
                            const text = document.getElementById(`guideline-${index}`).value;
                            updateGuideline(index, text);
                          }}
                        >
                          Save
                        </button>
                        <button className="btn" onClick={() => setEditingGuideline(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="item-text">{guideline}</span>
                      <div className="item-actions">
                        <button className="btn btn-small" onClick={() => setEditingGuideline(index)}>Edit</button>
                        <button className="btn btn-small btn-danger" onClick={() => deleteGuideline(index)}>Delete</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="admin-section">
            <div className="section-header">
              <h2>Contact Messages</h2>
              {messages.length > 0 && (
                <button className="btn btn-danger" onClick={clearAllMessages}>Clear All</button>
              )}
            </div>
            <div className="admin-list">
              {messages.length === 0 ? (
                <p className="empty-state">No messages received yet.</p>
              ) : (
                messages.map((message, index) => (
                  <div key={index} className="admin-item message-item">
                    <div className="message-details">
                      <div><strong>From:</strong> {message.name} ({message.email})</div>
                      <div><strong>Date:</strong> {message.timestamp}</div>
                      <div className="message-text"><strong>Message:</strong> {message.message}</div>
                    </div>
                    <button className="btn btn-small btn-danger" onClick={() => deleteMessage(index)}>
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;


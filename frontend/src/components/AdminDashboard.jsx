import React, { useState, useEffect } from 'react';
import '../styles/admin.css';
import { topicsAPI, questionsAPI, repliesAPI } from '../services/apiService.js';

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

  const loadData = async () => {
    // Load topics from backend API (store full objects, not just names)
    try {
      const topicsData = await topicsAPI.getAll();
      setTopics(topicsData); // Store full topic objects with IDs
    } catch (err) {
      console.error('Failed to load topics from backend:', err);
      setTopics([]);
    }

    // Load messages (still from localStorage for now)
    const messagesData = localStorage.getItem(MESSAGES_KEY);
    setMessages(messagesData ? JSON.parse(messagesData) : []);

    // Load reports (still from localStorage for now)
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
  const deleteTopic = async (topicObj) => {
    const topicName = typeof topicObj === 'string' ? topicObj : topicObj.topic;
    const topicId = typeof topicObj === 'object' ? topicObj.id : null;

    if (!topicId) {
      alert('Cannot delete: Topic ID not found');
      return;
    }

    if (window.confirm(`Delete debate "${topicName}"? This will also delete all questions and answers.`)) {
      try {
        // Delete from backend
        await topicsAPI.delete(topicId);

        // Reload from backend to sync
        await loadData();

        alert('Topic deleted successfully!');
      } catch (err) {
        console.error('Failed to delete topic:', err);
        alert('Failed to delete topic. Please try again.');
      }
    }
  };

  const updateTopic = async (oldTopicObj, newTopicName) => {
    const topicId = typeof oldTopicObj === 'object' ? oldTopicObj.id : null;

    if (!topicId) {
      alert('Cannot update: Topic ID not found');
      return;
    }

    try {
      // Parse new topic name to extract labels
      const parts = newTopicName.split(/\s+vs\s+/i);
      const leftLabel = parts[0]?.trim() || oldTopicObj.leftLabel;
      const rightLabel = parts[1]?.trim() || oldTopicObj.rightLabel;

      // Update in backend
      await topicsAPI.update(topicId, {
        topic: newTopicName,
        leftLabel,
        rightLabel,
        description: oldTopicObj.description || '',
        isActive: oldTopicObj.isActive !== false
      });

      setEditingTopic(null);

      // Reload from backend to sync
      await loadData();

      alert('Topic updated successfully!');
    } catch (err) {
      console.error('Failed to update topic:', err);
      alert('Failed to update topic. Please try again.');
    }
  };

  // Question/Answer Management (from specific debate)
  const [selectedDebate, setSelectedDebate] = useState(null);
  const [selectedDebateTopic, setSelectedDebateTopic] = useState(null);
  const [debateQuestions, setDebateQuestions] = useState([]);

  const loadDebateData = async (topicObj) => {
    setSelectedDebate(topicObj.topic);
    setSelectedDebateTopic(topicObj);

    try {
      const questions = await questionsAPI.getByTopic(topicObj.id);
      setDebateQuestions(questions || []);
    } catch (err) {
      console.error('Failed to load questions from backend:', err);
      setDebateQuestions([]);
    }
  };


  const deleteQuestion = async (questionId) => {
    if (window.confirm('Delete this question and all its replies?')) {
      try {
        await questionsAPI.delete(questionId);
        await loadDebateData(selectedDebateTopic);
        await loadData(); // Reload to update reports
        alert('Question deleted successfully!');
      } catch (err) {
        console.error('Failed to delete question:', err);
        alert('Failed to delete question. Please try again.');
      }
    }
  };

  const deleteReply = async (replyId) => {
    if (window.confirm('Delete this reply and all its sub-replies?')) {
      try {
        await repliesAPI.delete(replyId);
        await loadDebateData(selectedDebateTopic);
        await loadData(); // Reload to update reports
        alert('Reply deleted successfully!');
      } catch (err) {
        console.error('Failed to delete reply:', err);
        alert('Failed to delete reply. Please try again.');
      }
    }
  };

  // Edit question/reply text
  const [editingPost, setEditingPost] = useState(null);

  const updatePost = async (postId, newText, isQuestion) => {
    try {
      if (isQuestion) {
        // Update question
        await questionsAPI.update(postId, { text: newText });
      } else {
        // Update reply
        await repliesAPI.update(postId, { text: newText });
      }

      await loadDebateData(selectedDebateTopic);
      setEditingPost(null);
      alert('Updated successfully!');
    } catch (err) {
      console.error('Failed to update:', err);
      alert('Failed to update. Please try again.');
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

  // Reports Management - Enhanced with aggregation
  const getAggregatedReports = () => {
    const aggregated = {};

    reports.forEach((report) => {
      const postId = report.postId;
      if (!aggregated[postId]) {
        aggregated[postId] = {
          postId: report.postId,
          postText: report.postText,
          reporters: [],
          reasons: [],
          firstReportDate: report.timestamp,
          totalCount: 0
        };
      }
      aggregated[postId].reporters.push({
        name: report.reporter,
        reason: report.reason,
        timestamp: report.timestamp
      });
      aggregated[postId].reasons.push(report.reason);
      aggregated[postId].totalCount++;
    });

    // Convert to array and sort by report count (highest first)
    return Object.values(aggregated).sort((a, b) => b.totalCount - a.totalCount);
  };

  const deleteReport = (index) => {
    const updated = reports.filter((_, i) => i !== index);
    setReports(updated);
    localStorage.setItem(REPORTS_KEY, JSON.stringify(updated));
  };

  const deleteAllReportsForPost = (postId) => {
    if (window.confirm('Dismiss all reports for this post?')) {
      const updated = reports.filter(r => r.postId !== postId);
      setReports(updated);
      localStorage.setItem(REPORTS_KEY, JSON.stringify(updated));
    }
  };

  const deleteReportedPost = (postId) => {
    if (window.confirm('Delete this reported post from all debates?')) {
      // Search through all debates and remove the post
      let found = false;
      topics.forEach(topic => {
        const storageKey = `debate_threads_${topic.replace(/\s+/g, '_')}`;
        const data = localStorage.getItem(storageKey);
        if (data) {
          const parsed = JSON.parse(data);
          const originalLength = JSON.stringify(parsed).length;

          // Remove from questions
          parsed.questions = parsed.questions.filter(q => q.uniqueId !== postId);

          // Remove from nested replies recursively
          const removeFromReplies = (items) => {
            return items.map(item => {
              if (item.replies && item.replies.length > 0) {
                item.replies = removeFromReplies(item.replies.filter(r => r.uniqueId !== postId));
              }
              return item;
            });
          };

          parsed.questions = removeFromReplies(parsed.questions);

          if (JSON.stringify(parsed).length !== originalLength) {
            localStorage.setItem(storageKey, JSON.stringify(parsed));
            found = true;
          }
        }
      });

      if (found) {
        // Remove all reports for this post
        deleteAllReportsForPost(postId);
        alert('Post deleted successfully from all debates.');
        loadData();
      } else {
        alert('Post not found in any debate.');
      }
    }
  };

  const warnReporters = (postId) => {
    const postReports = reports.filter(r => r.postId === postId);
    if (postReports.length > 0) {
      const reporterNames = [...new Set(postReports.map(r => r.reporter))].join(', ');
      alert(`Warning sent to: ${reporterNames}\n\nNote: In production, this would send actual warnings to users.`);
    }
  };

  const editReportedPost = (postId) => {
    const newText = prompt('Enter new text for this post:');
    if (newText && newText.trim()) {
      let found = false;
      topics.forEach(topic => {
        const storageKey = `debate_threads_${topic.replace(/\s+/g, '_')}`;
        const data = localStorage.getItem(storageKey);
        if (data) {
          const parsed = JSON.parse(data);

          // Update in questions
          const updateInItems = (items) => {
            return items.map(item => {
              if (item.uniqueId === postId) {
                item.text = newText.trim();
                found = true;
              }
              if (item.replies && item.replies.length > 0) {
                item.replies = updateInItems(item.replies);
              }
              return item;
            });
          };

          parsed.questions = updateInItems(parsed.questions);

          if (found) {
            localStorage.setItem(storageKey, JSON.stringify(parsed));
          }
        }
      });

      if (found) {
        alert('Post edited successfully. Consider dismissing the reports.');
        loadData();
      } else {
        alert('Post not found in any debate.');
      }
    }
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

  // Analytics - Top 10 Questions and Answers
  const getTop10Stats = () => {
    const allPosts = [];

    topics.forEach(topicObj => {
      const topicName = topicObj.topic || topicObj;
      const storageKey = `debate_threads_${topicName.replace(/\s+/g, '_')}`;
      const data = localStorage.getItem(storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        const collectPosts = (items, isQuestion = false) => {
          items.forEach(item => {
            allPosts.push({
              ...item,
              topic: topicName,
              type: isQuestion ? 'question' : 'answer',
              totalLikes: (item.votes?.up || 0)
            });
            if (item.replies && item.replies.length > 0) {
              collectPosts(item.replies, false);
            }
          });
        };
        if (parsed.questions) {
          collectPosts(parsed.questions, true);
        }
      }
    });

    const questions = allPosts.filter(p => p.type === 'question')
      .sort((a, b) => b.totalLikes - a.totalLikes)
      .slice(0, 10);

    const answers = allPosts.filter(p => p.type === 'answer')
      .sort((a, b) => b.totalLikes - a.totalLikes)
      .slice(0, 10);

    return { questions, answers };
  };

  // Flatten all replies for display
  const flattenReplies = (replies, depth = 1) => {
    const result = [];
    replies.forEach(reply => {
      result.push({ ...reply, depth });
      if (reply.replies && reply.replies.length > 0) {
        result.push(...flattenReplies(reply.replies, depth + 1));
      }
    });
    return result;
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
          className={`admin-tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Top 10 Analytics
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
                topics.map((topicObj, index) => (
                  <div key={topicObj.id || index} className="admin-item">
                    {editingTopic === topicObj.topic ? (
                      <div className="edit-form">
                        <input
                          type="text"
                          defaultValue={topicObj.topic}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateTopic(topicObj, e.target.value);
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
                        <span className="item-text">{topicObj.topic}</span>
                        <div className="item-actions">
                          <button className="btn btn-small" onClick={() => setEditingTopic(topicObj.topic)}>Edit</button>
                          <button className="btn btn-small btn-danger" onClick={() => deleteTopic(topicObj)}>Delete</button>
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
                  {topics.map((topicObj, index) => (
                    <button
                      key={topicObj.id || index}
                      className="topic-btn"
                      onClick={() => loadDebateData(topicObj)}
                    >
                      {topicObj.topic}
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

                        {/* Question Text - Editable */}
                        {editingPost === question.id ? (
                          <div className="edit-form">
                            <textarea
                              id={`edit-${question.id}`}
                              defaultValue={question.text}
                              className="edit-textarea"
                              rows="4"
                            />
                            <div className="form-actions">
                              <button
                                className="btn btn-small"
                                onClick={() => {
                                  const newText = document.getElementById(`edit-${question.id}`).value;
                                  if (newText.trim()) {
                                    updatePost(question.id, newText.trim());
                                  }
                                }}
                              >
                                Save
                              </button>
                              <button className="btn btn-small" onClick={() => setEditingPost(null)}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="question-text">{question.text}</div>
                            <div className="question-actions">
                              <button
                                className="btn btn-small"
                                onClick={() => setEditingPost(question.id)}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-small btn-danger"
                                onClick={() => deleteQuestion(question.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </>
                        )}

                        {/* Replies */}
                        {question.replies && question.replies.length > 0 && (
                          <div className="replies-section">
                            <h4>Replies ({question.replies.length})</h4>
                            {flattenReplies(question.replies).map((reply) => (
                              <div key={reply.id} className="reply-item" style={{ marginLeft: `${reply.depth * 20}px` }}>
                                <div className="reply-header">
                                  <span className="reply-author">{reply.author}</span>
                                  <span className="reply-id">ID: {reply.uniqueId}</span>
                                  {reply.depth > 1 && <span className="reply-depth">↳ Level {reply.depth}</span>}
                                </div>

                                {/* Reply Text - Editable */}
                                {editingPost === reply.id ? (
                                  <div className="edit-form">
                                    <textarea
                                      id={`edit-${reply.id}`}
                                      defaultValue={reply.text}
                                      className="edit-textarea"
                                      rows="3"
                                    />
                                    <div className="form-actions">
                                      <button
                                        className="btn btn-small"
                                        onClick={() => {
                                          const newText = document.getElementById(`edit-${reply.id}`).value;
                                          if (newText.trim()) {
                                            updatePost(reply.id, newText.trim(), false); // false = isReply
                                          }
                                        }}
                                      >
                                        Save
                                      </button>
                                      <button className="btn btn-small" onClick={() => setEditingPost(null)}>Cancel</button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="reply-text">{reply.text}</div>
                                    <div className="reply-actions">
                                      <button
                                        className="btn btn-small"
                                        onClick={() => setEditingPost(reply.id)}
                                      >
                                        Edit
                                      </button>
                                      <button
                                        className="btn btn-small btn-danger"
                                        onClick={() => deleteReply(reply.id)}
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </>
                                )}
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
                getAggregatedReports().map((report, index) => (
                  <div key={index} className="admin-item report-item">
                    <div className="report-details">
                      <div><strong>Post ID:</strong> {report.postId}</div>
                      <div><strong>Reported by:</strong> {report.reporters.map(r => r.name).join(', ')}</div>
                      <div><strong>Reasons:</strong> {report.reasons.join(', ')}</div>
                      <div><strong>Date:</strong> {report.firstReportDate}</div>
                      <div><strong>Total Reports:</strong> {report.totalCount}</div>
                    </div>
                    <div className="report-actions">
                      <button className="btn btn-small" onClick={() => deleteAllReportsForPost(report.postId)}>Dismiss All</button>
                      <button className="btn btn-small" onClick={() => deleteReportedPost(report.postId)}>Delete Post</button>
                      <button className="btn btn-small" onClick={() => warnReporters(report.postId)}>Warn Reporters</button>
                      <button className="btn btn-small" onClick={() => editReportedPost(report.postId)}>Edit Post</button>
                    </div>
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

        {/* Analytics Tab - Top 10 Most Liked Questions and Answers */}
        {activeTab === 'analytics' && (
          <div className="admin-section">
            <h2>📊 Top 10 Analytics - Most Liked Content</h2>
            <div className="analytics-grid">
              {/* Top 10 Questions */}
              <div className="analytics-section">
                <h3>🏆 Top 10 Questions</h3>
                {(() => {
                  const stats = getTop10Stats();
                  return stats.questions.length === 0 ? (
                    <p className="empty-state">No questions available yet.</p>
                  ) : (
                    <div className="top-list">
                      {stats.questions.map((question, index) => (
                        <div key={index} className="top-item">
                          <div className="rank">{index + 1}</div>
                          <div className="top-content">
                            <div className="top-topic">{question.topic}</div>
                            <div className="top-text">{question.text}</div>
                            <div className="top-meta">
                              <span className="top-author">By: {question.author}</span>
                              <span className="top-id">ID: {question.uniqueId}</span>
                              <span className="top-tag">[{question.tag}]</span>
                            </div>
                          </div>
                          <div className="top-likes">
                            <div className="likes-count">{question.totalLikes}</div>
                            <div className="likes-label">👍 Likes</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Top 10 Answers */}
              <div className="analytics-section">
                <h3>🏆 Top 10 Answers</h3>
                {(() => {
                  const stats = getTop10Stats();
                  return stats.answers.length === 0 ? (
                    <p className="empty-state">No answers available yet.</p>
                  ) : (
                    <div className="top-list">
                      {stats.answers.map((answer, index) => (
                        <div key={index} className="top-item">
                          <div className="rank">{index + 1}</div>
                          <div className="top-content">
                            <div className="top-topic">{answer.topic}</div>
                            <div className="top-text">{answer.text}</div>
                            <div className="top-meta">
                              <span className="top-author">By: {answer.author}</span>
                              <span className="top-id">ID: {answer.uniqueId}</span>
                            </div>
                          </div>
                          <div className="top-likes">
                            <div className="likes-count">{answer.totalLikes}</div>
                            <div className="likes-label">👍 Likes</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;


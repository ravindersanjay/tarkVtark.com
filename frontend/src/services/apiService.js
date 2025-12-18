/**
 * =====================================================================
 * API Service - Backend Communication
 * =====================================================================
 *
 * This module handles all communication with the backend API.
 * All data will come from PostgreSQL database instead of localStorage.
 *
 * Base URL: http://localhost:8080/api/v1
 *
 * ENDPOINTS:
 * - GET  /topics - Get all debate topics
 * - GET  /topics/{id} - Get a specific topic with questions
 * - POST /topics - Create new topic
 * - GET  /questions/{topicId} - Get all questions for a topic
 * - POST /questions - Create new question
 * - POST /replies - Create new reply
 * - PUT  /votes/{postId} - Vote on a post
 * - GET  /admin/guidelines - Get guidelines
 * - GET  /admin/faq - Get FAQ items
 */

// API base URL - will be served by Spring Boot backend
const API_BASE_URL = 'http://localhost:8080/api/v1';

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch(url, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// =====================================================================
// DEBATE TOPICS API
// =====================================================================

export const topicsAPI = {
  /**
   * Get all debate topics
   * @returns {Promise<Array>} Array of topic objects
   */
  getAll: async () => {
    return await apiFetch('/topics');
  },

  /**
   * Get a specific topic by ID with all its questions and replies
   * @param {string} topicId - UUID of the topic
   * @returns {Promise<Object>} Topic object with nested questions
   */
  getById: async (topicId) => {
    return await apiFetch(`/topics/${topicId}`);
  },

  /**
   * Get a topic by name (for URL-based navigation)
   * @param {string} topicName - Name like "Sanatan vs Islam"
   * @returns {Promise<Object>} Topic object
   */
  getByName: async (topicName) => {
    const topics = await apiFetch('/topics');
    return topics.find(t => t.topic === topicName);
  },

  /**
   * Create a new debate topic
   * @param {Object} topicData - { topic, leftLabel, rightLabel, description }
   * @returns {Promise<Object>} Created topic object
   */
  create: async (topicData) => {
    return await apiFetch('/topics', {
      method: 'POST',
      body: JSON.stringify(topicData),
    });
  },
};

// =====================================================================
// QUESTIONS API
// =====================================================================

export const questionsAPI = {
  /**
   * Get all questions for a topic
   * @param {string} topicId - UUID of the topic
   * @returns {Promise<Array>} Array of question objects with nested replies
   */
  getByTopic: async (topicId) => {
    return await apiFetch(`/questions/topic/${topicId}`);
  },

  /**
   * Create a new question
   * @param {Object} questionData - { debateTopicId, text, tag, side, author }
   * @returns {Promise<Object>} Created question object
   */
  create: async (questionData) => {
    return await apiFetch('/questions', {
      method: 'POST',
      body: JSON.stringify(questionData),
    });
  },

  /**
   * Vote on a question
   * @param {string} questionId - UUID of the question
   * @param {string} voteType - 'up' or 'down'
   * @returns {Promise<Object>} Updated question with new vote counts
   */
  vote: async (questionId, voteType) => {
    return await apiFetch(`/questions/${questionId}/vote`, {
      method: 'PUT',
      body: JSON.stringify({ voteType }),
    });
  },
};

// =====================================================================
// REPLIES API
// =====================================================================

export const repliesAPI = {
  /**
   * Create a new reply to a question or another reply
   * @param {Object} replyData - { questionId?, parentReplyId?, text, side, author, depth }
   * @returns {Promise<Object>} Created reply object
   */
  create: async (replyData) => {
    return await apiFetch('/replies', {
      method: 'POST',
      body: JSON.stringify(replyData),
    });
  },

  /**
   * Vote on a reply
   * @param {string} replyId - UUID of the reply
   * @param {string} voteType - 'up' or 'down'
   * @returns {Promise<Object>} Updated reply with new vote counts
   */
  vote: async (replyId, voteType) => {
    return await apiFetch(`/replies/${replyId}/vote`, {
      method: 'PUT',
      body: JSON.stringify({ voteType }),
    });
  },
};

// =====================================================================
// ADMIN API
// =====================================================================

export const adminAPI = {
  /**
   * Get guidelines content
   * @returns {Promise<Array>} Array of guideline strings
   */
  getGuidelines: async () => {
    try {
      return await apiFetch('/admin/guidelines');
    } catch (error) {
      // Return default guidelines if API fails
      return [
        'Be respectful and constructive in your arguments.',
        'No hate speech, personal attacks, or discrimination.',
        'Support your points with evidence where possible.',
        'Stay on topic and avoid spamming.',
        'Report inappropriate content to moderators.'
      ];
    }
  },

  /**
   * Get FAQ items
   * @returns {Promise<Array>} Array of { q, a } objects
   */
  getFAQ: async () => {
    try {
      return await apiFetch('/admin/faq');
    } catch (error) {
      // Return default FAQ if API fails
      return [
        {
          q: 'How do I participate in a debate?',
          a: 'Click on any debate topic to view and reply to questions and answers.'
        },
        {
          q: 'Can I report inappropriate content?',
          a: 'Yes, please use the Contact Us page to report any issues.'
        }
      ];
    }
  },

  /**
   * Login to admin panel
   * @param {Object} credentials - { username, password }
   * @returns {Promise<Object>} { token, user }
   */
  login: async (credentials) => {
    return await apiFetch('/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
};

// =====================================================================
// CONTACT API
// =====================================================================

export const contactAPI = {
  /**
   * Send a contact message
   * @param {Object} messageData - { name, email, subject, message }
   * @returns {Promise<Object>} Confirmation object
   */
  send: async (messageData) => {
    return await apiFetch('/contact', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  },
};

export default {
  topics: topicsAPI,
  questions: questionsAPI,
  replies: repliesAPI,
  admin: adminAPI,
  contact: contactAPI,
};


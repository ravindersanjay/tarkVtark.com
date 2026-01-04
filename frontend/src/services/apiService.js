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

import logger from '../utils/logger.js';

// API base URL - will be served by Spring Boot backend
const API_BASE_URL = 'http://localhost:8080/api/v1';

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch(url, options = {}) {
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const method = options.method || 'GET';

  // Log to both console and file
  logger.group(`🌐 API Request [${requestId}]`);
  logger.log('📍 Endpoint:', `${method} ${API_BASE_URL}${url}`);
  logger.log('📦 Options:', options);
  if (options.body) {
    try {
      logger.log('📤 Request Body:', JSON.parse(options.body));
    } catch (e) {
      logger.log('📤 Request Body (raw):', options.body);
    }
  }
  logger.groupEnd();

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    logger.group(`📨 API Response [${requestId}]`);
    logger.log('📍 Endpoint:', `${method} ${API_BASE_URL}${url}`);
    logger.log('✅ Status:', response.status, response.statusText);
    logger.log('📋 Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      logger.error('❌ HTTP Error:', response.status, response.statusText);
      logger.groupEnd();
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Handle 204 No Content (DELETE operations)
    if (response.status === 204) {
      logger.log('✅ 204 No Content - Request successful');
      logger.groupEnd();
      return null;
    }

    // Only try to parse JSON if there's content
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      logger.log('📥 Response Data:', data);
      logger.groupEnd();
      return data;
    }

    logger.log('ℹ️ No JSON content to parse');
    logger.groupEnd();
    return null;
  } catch (error) {
    logger.group(`❌ API Error [${requestId}]`);
    logger.error('📍 Endpoint:', `${method} ${API_BASE_URL}${url}`);
    logger.error('💥 Error Type:', error.name);
    logger.error('📝 Error Message:', error.message);
    logger.error('🔍 Full Error:', error);
    logger.error('📚 Stack Trace:', error.stack);
    logger.groupEnd();
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
    console.log('🏷️ topicsAPI.getAll() - Fetching all topics');
    const result = await apiFetch('/topics');
    console.log('🏷️ topicsAPI.getAll() - Result:', result?.length || 0, 'topics');
    return result;
  },

  /**
   * Get a specific topic by ID with all its questions and replies
   * @param {string} topicId - UUID of the topic
   * @returns {Promise<Object>} Topic object with nested questions
   */
  getById: async (topicId) => {
    console.log('🏷️ topicsAPI.getById() - Fetching topic:', topicId);
    const result = await apiFetch(`/topics/${topicId}`);
    console.log('🏷️ topicsAPI.getById() - Result:', result);
    return result;
  },

  /**
   * Get a topic by name (for URL-based navigation)
   * @param {string} topicName - Name like "Sanatan vs Islam"
   * @returns {Promise<Object>} Topic object
   */
  getByName: async (topicName) => {
    console.log('🏷️ topicsAPI.getByName() - Fetching topic:', topicName);
    const topics = await apiFetch('/topics');
    const result = topics.find(t => t.topic === topicName);
    console.log('🏷️ topicsAPI.getByName() - Found:', result ? 'Yes' : 'No');
    return result;
  },

  /**
   * Create a new debate topic
   * @param {Object} topicData - { topic, leftLabel, rightLabel, description }
   * @returns {Promise<Object>} Created topic object
   */
  create: async (topicData) => {
    console.log('🏷️ topicsAPI.create() - Creating topic:', topicData);
    const result = await apiFetch('/topics', {
      method: 'POST',
      body: JSON.stringify(topicData),
    });
    console.log('🏷️ topicsAPI.create() - Created:', result);
    return result;
  },

  /**
   * Update an existing debate topic
   * @param {string} topicId - UUID of the topic
   * @param {Object} topicData - { topic, leftLabel, rightLabel, description, isActive }
   * @returns {Promise<Object>} Updated topic object
   */
  update: async (topicId, topicData) => {
    console.log('🏷️ topicsAPI.update() - Updating topic:', topicId, topicData);
    const result = await apiFetch(`/topics/${topicId}`, {
      method: 'PUT',
      body: JSON.stringify(topicData),
    });
    console.log('🏷️ topicsAPI.update() - Updated:', result);
    return result;
  },

  /**
   * Delete a debate topic
   * @param {string} topicId - UUID of the topic
   * @returns {Promise<void>}
   */
  delete: async (topicId) => {
    console.log('🏷️ topicsAPI.delete() - Deleting topic:', topicId);
    await apiFetch(`/topics/${topicId}`, {
      method: 'DELETE',
    });
    console.log('🏷️ topicsAPI.delete() - Deleted successfully');
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
    console.log('❓ questionsAPI.getByTopic() - Fetching questions for topic:', topicId);
    const result = await apiFetch(`/questions/topic/${topicId}`);
    console.log('❓ questionsAPI.getByTopic() - Result:', result?.length || 0, 'questions');
    return result;
  },

  /**
   * Create a new question
   * @param {Object} questionData - { debateTopicId, text, tag, side, author }
   * @returns {Promise<Object>} Created question object
   */
  create: async (questionData) => {
    console.log('❓ questionsAPI.create() - Creating question:', questionData);
    const result = await apiFetch('/questions', {
      method: 'POST',
      body: JSON.stringify(questionData),
    });
    console.log('❓ questionsAPI.create() - Created:', result);
    return result;
  },

  /**
   * Update an existing question
   * @param {string} questionId - UUID of the question
   * @param {Object} questionData - { text, tag, side }
   * @returns {Promise<Object>} Updated question object
   */
  update: async (questionId, questionData) => {
    console.log('❓ questionsAPI.update() - Updating question:', questionId, questionData);
    const result = await apiFetch(`/questions/${questionId}`, {
      method: 'PUT',
      body: JSON.stringify(questionData),
    });
    console.log('❓ questionsAPI.update() - Updated:', result);
    return result;
  },

  /**
   * Delete a question
   * @param {string} questionId - UUID of the question
   * @returns {Promise<void>}
   */
  delete: async (questionId) => {
    console.log('❓ questionsAPI.delete() - Deleting question:', questionId);
    await apiFetch(`/questions/${questionId}`, {
      method: 'DELETE',
    });
    console.log('❓ questionsAPI.delete() - Deleted successfully');
  },

  /**
   * Vote on a question
   * @param {string} questionId - UUID of the question
   * @param {string} voteType - 'up' or 'down'
   * @returns {Promise<Object>} Updated question with new vote counts
   */
  vote: async (questionId, voteType) => {
    console.log('❓ questionsAPI.vote() - Voting on question:', questionId, voteType);
    const result = await apiFetch(`/questions/${questionId}/vote`, {
      method: 'PUT',
      body: JSON.stringify({ voteType }),
    });
    console.log('❓ questionsAPI.vote() - Vote recorded:', result);
    return result;
  },
};

// =====================================================================
// REPLIES API
// =====================================================================

export const repliesAPI = {
  /**
   * Get all replies for a question
   * @param {string} questionId - UUID of the question
   * @returns {Promise<Array>} Array of reply objects
   */
  getByQuestion: async (questionId) => {
    console.log('💬 repliesAPI.getByQuestion() - Fetching replies for question:', questionId);
    const result = await apiFetch(`/replies/question/${questionId}`);
    console.log('💬 repliesAPI.getByQuestion() - Result:', result?.length || 0, 'replies');
    return result;
  },

  /**
   * Create a new reply to a question or another reply
   * @param {Object} replyData - { questionId?, parentReplyId?, text, side, author, depth }
   * @returns {Promise<Object>} Created reply object
   */
  create: async (replyData) => {
    console.log('💬 repliesAPI.create() - Creating reply:', replyData);
    const result = await apiFetch('/replies', {
      method: 'POST',
      body: JSON.stringify(replyData),
    });
    console.log('💬 repliesAPI.create() - Created:', result);
    return result;
  },

  /**
   * Update an existing reply
   * @param {string} replyId - UUID of the reply
   * @param {Object} replyData - { text, side, author }
   * @returns {Promise<Object>} Updated reply object
   */
  update: async (replyId, replyData) => {
    console.log('💬 repliesAPI.update() - Updating reply:', replyId, replyData);
    const result = await apiFetch(`/replies/${replyId}`, {
      method: 'PUT',
      body: JSON.stringify(replyData),
    });
    console.log('💬 repliesAPI.update() - Updated:', result);
    return result;
  },

  /**
   * Delete a reply
   * @param {string} replyId - UUID of the reply
   * @returns {Promise<void>}
   */
  delete: async (replyId) => {
    console.log('💬 repliesAPI.delete() - Deleting reply:', replyId);
    await apiFetch(`/replies/${replyId}`, {
      method: 'DELETE',
    });
    console.log('💬 repliesAPI.delete() - Deleted successfully');
  },

  /**
   * Vote on a reply
   * @param {string} replyId - UUID of the reply
   * @param {string} voteType - 'up' or 'down'
   * @returns {Promise<Object>} Updated reply with new vote counts
   */
  vote: async (replyId, voteType) => {
    console.log('💬 repliesAPI.vote() - Voting on reply:', replyId, voteType);
    const result = await apiFetch(`/replies/${replyId}/vote`, {
      method: 'PUT',
      body: JSON.stringify({ voteType }),
    });
    console.log('💬 repliesAPI.vote() - Vote recorded:', result);
    return result;
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
    console.log('👨‍💼 adminAPI.getGuidelines() - Fetching guidelines');
    try {
      const result = await apiFetch('/admin/guidelines');
      console.log('👨‍💼 adminAPI.getGuidelines() - Success:', result?.length || 0, 'guidelines');
      return result;
    } catch (error) {
      console.warn('👨‍💼 adminAPI.getGuidelines() - Failed, using defaults:', error.message);
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
   * Get all guidelines including inactive (for admin management)
   * @returns {Promise<Array>} Array of guideline objects
   */
  getAllGuidelines: async () => {
    console.log('👨‍💼 adminAPI.getAllGuidelines() - Fetching all guidelines');
    const result = await apiFetch('/admin/guidelines/all');
    console.log('👨‍💼 adminAPI.getAllGuidelines() - Success:', result?.length || 0, 'guidelines');
    return result;
  },

  /**
   * Create a new guideline
   * @param {string} text - Guideline text
   * @returns {Promise<Object>} Created guideline object
   */
  createGuideline: async (text) => {
    console.log('👨‍💼 adminAPI.createGuideline() - Creating guideline:', text);
    const result = await apiFetch('/admin/guidelines', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
    console.log('👨‍💼 adminAPI.createGuideline() - Created:', result);
    return result;
  },

  /**
   * Update an existing guideline
   * @param {number} id - Guideline ID
   * @param {Object} data - { text, isActive, displayOrder }
   * @returns {Promise<Object>} Updated guideline object
   */
  updateGuideline: async (id, data) => {
    console.log('👨‍💼 adminAPI.updateGuideline() - Updating guideline:', id, data);
    const result = await apiFetch(`/admin/guidelines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    console.log('👨‍💼 adminAPI.updateGuideline() - Updated:', result);
    return result;
  },

  /**
   * Delete a guideline
   * @param {number} id - Guideline ID
   * @returns {Promise<void>}
   */
  deleteGuideline: async (id) => {
    console.log('👨‍💼 adminAPI.deleteGuideline() - Deleting guideline:', id);
    await apiFetch(`/admin/guidelines/${id}`, {
      method: 'DELETE',
    });
    console.log('👨‍💼 adminAPI.deleteGuideline() - Deleted successfully');
  },

  /**
   * Get FAQ items
   * @returns {Promise<Array>} Array of { q, a } objects
   */
  getFAQ: async () => {
    console.log('👨‍💼 adminAPI.getFAQ() - Fetching FAQ');
    try {
      const result = await apiFetch('/admin/faq');
      console.log('👨‍💼 adminAPI.getFAQ() - Success:', result?.length || 0, 'FAQ items');
      return result;
    } catch (error) {
      console.warn('👨‍💼 adminAPI.getFAQ() - Failed, using defaults:', error.message);
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
    console.log('👨‍💼 adminAPI.login() - Attempting login for user:', credentials.username);
    const result = await apiFetch('/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    console.log('👨‍💼 adminAPI.login() - Login successful');
    return result;
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
    console.log('📧 contactAPI.send() - Sending message from:', messageData.email);
    const result = await apiFetch('/contact', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
    console.log('📧 contactAPI.send() - Message sent successfully');
    return result;
  },
};

/**
 * =====================================================================
 * FILES API - File Upload & Evidence Management
 * =====================================================================
 */
const filesAPI = {
  /**
   * Upload a file attachment
   * @param {File} file - The file to upload
   * @param {string} questionId - UUID of question (optional)
   * @param {string} replyId - UUID of reply (optional)
   * @param {string} uploadedBy - Name of uploader (optional)
   * @returns {Promise<Object>} AttachmentDTO with storageUrl
   */
  upload: async (file, questionId = null, replyId = null, uploadedBy = 'Anonymous') => {
    const formData = new FormData();
    formData.append('file', file);
    if (questionId) formData.append('questionId', questionId);
    if (replyId) formData.append('replyId', replyId);
    if (uploadedBy) formData.append('uploadedBy', uploadedBy);

    logger.log('📤 filesAPI.upload() - Uploading file:', file.name);

    // Don't use apiFetch for multipart/form-data, use fetch directly
    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: 'POST',
      body: formData, // Don't set Content-Type, browser will set it with boundary
    });

    if (!response.ok) {
      const error = await response.text();
      logger.error('❌ filesAPI.upload() - Upload failed:', error);
      throw new Error(`Upload failed: ${error}`);
    }

    const result = await response.json();
    logger.log('✅ filesAPI.upload() - File uploaded:', result.fileName);
    return result;
  },

  /**
   * Delete an attachment
   * @param {string} id - Attachment UUID
   */
  delete: async (id) => {
    logger.log('🗑️ filesAPI.delete() - Deleting attachment:', id);
    return apiFetch(`/files/${id}`, { method: 'DELETE' });
  },

  /**
   * Add an evidence URL
   * @param {string} url - The URL
   * @param {string} questionId - UUID of question (optional)
   * @param {string} replyId - UUID of reply (optional)
   * @param {string} title - Optional title/description
   * @returns {Promise<Object>} EvidenceUrlDTO
   */
  addEvidenceUrl: async (url, questionId = null, replyId = null, title = null) => {
    const params = new URLSearchParams();
    params.append('url', url);
    if (questionId) params.append('questionId', questionId);
    if (replyId) params.append('replyId', replyId);
    if (title) params.append('title', title);

    logger.log('🔗 filesAPI.addEvidenceUrl() - Adding URL:', url);

    return apiFetch(`/files/evidence-url?${params.toString()}`, {
      method: 'POST',
    });
  },

  /**
   * Delete an evidence URL
   * @param {string} id - Evidence URL UUID
   */
  deleteEvidenceUrl: async (id) => {
    logger.log('🗑️ filesAPI.deleteEvidenceUrl() - Deleting URL:', id);
    return apiFetch(`/files/evidence-url/${id}`, { method: 'DELETE' });
  },

  /**
   * Get attachments for a question or reply
   * @param {string} questionId - UUID of question (optional)
   * @param {string} replyId - UUID of reply (optional)
   * @returns {Promise<Array>} List of AttachmentDTOs
   */
  getAttachments: async (questionId = null, replyId = null) => {
    const params = new URLSearchParams();
    if (questionId) params.append('questionId', questionId);
    if (replyId) params.append('replyId', replyId);

    return apiFetch(`/files/attachments?${params.toString()}`);
  },

  /**
   * Get evidence URLs for a question or reply
   * @param {string} questionId - UUID of question (optional)
   * @param {string} replyId - UUID of reply (optional)
   * @returns {Promise<Array>} List of EvidenceUrlDTOs
   */
  getEvidenceUrls: async (questionId = null, replyId = null) => {
    const params = new URLSearchParams();
    if (questionId) params.append('questionId', questionId);
    if (replyId) params.append('replyId', replyId);

    return apiFetch(`/files/evidence-urls?${params.toString()}`);
  },
};

export default {
  topics: topicsAPI,
  questions: questionsAPI,
  replies: repliesAPI,
  admin: adminAPI,
  contact: contactAPI,
  files: filesAPI,
};

export { topicsAPI, questionsAPI, repliesAPI, adminAPI, contactAPI, filesAPI };

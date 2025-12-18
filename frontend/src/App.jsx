import React, { useState, useEffect, useRef } from 'react';
import { generateUniqueId, deepCopy } from './utils/helpers.js';
import { topicsAPI, questionsAPI, repliesAPI } from './services/apiService.js';
import Card from './components/Card.jsx';
import './styles/app.css';

/**
 * =====================================================================
 * App Component - Main Debate Board Application
 * =====================================================================
 *
 * This is the core component of the debate application. It manages a two-column
 * debate system where questions and replies alternate between left and right sides.
 *
 * CORE CONCEPTS:
 * --------------
 * 1. Two-Column Layout: Questions start on one side (left/right), replies appear on opposite side
 * 2. Parent-Child Pairing: When a post gets a reply, they appear adjacent in the same row
 * 3. Reply Duplication: When a reply gets sub-replied, the parent reply is duplicated in a new row
 * 4. Arrow Indicators: Visual arrows (→ or ←) show the flow from question to answer
 *
 * DATA STRUCTURE:
 * ---------------
 * - debateData: { topic: string, questions: Question[] }
 * - Question: {
 *     id: string,           // Internal unique ID
 *     text: string,         // Question content
 *     tag: string,          // Category tag
 *     side: 'left'|'right', // Which column to display in
 *     author: string,       // Who posted it
 *     timestamp: string,    // When it was posted
 *     replies: Reply[],     // Array of replies to this question
 *     votes: {up, down},    // Vote counts
 *     uniqueId: string      // Human-readable sharing ID
 *   }
 * - Reply: Same structure as Question (replies can have replies - nested structure)
 *
 * STORAGE:
 * --------
 * All debate data is persisted to localStorage and loaded on mount.
 * Each topic has its own storage key to keep debates separate.
 */

// Constant for the current user (in production, this would come from auth)
const CURRENT_USER = 'CurrentUser';

/**
 * Find a post (question or reply) by its ID
 *
 * This function searches through the entire debate tree to find a specific post.
 * It first checks top-level questions, then recursively searches through all replies.
 *
 * @param {string} id - The ID to search for
 * @param {Array} questions - Array of question objects to search in
 * @returns {object|null} - The found post object, or null if not found
 */
const findPostById = (id, questions) => {
  // First, check if it's a top-level question
  const q = Array.isArray(questions) && questions.find(x => x.id === id);
  if (q) return q;

  // Not found at top level, search recursively through all replies
  return findReplyById(id, questions);
};

/**
 * Recursively search through nested replies to find a post by ID
 *
 * This is a depth-first search that traverses the entire reply tree.
 * Each question can have replies, and each reply can have its own replies (nested structure).
 *
 * @param {string} id - The ID to search for
 * @param {Array} arr - Array of posts (questions or replies) to search
 * @returns {object|null} - The found post, or null if not found
 */
const findReplyById = (id, arr) => {
  if (!Array.isArray(arr)) return null;

  // Iterate through each post in the array
  for (const r of arr) {
    // Check if this is the post we're looking for
    if (r.id === id) return r;

    // If this post has replies, search them recursively
    if (Array.isArray(r.replies) && r.replies.length > 0) {
      const found = findReplyById(id, r.replies);
      if (found) return found;
    }
  }
  return null;
};

/**
 * Build a searchable text string from a post for filtering
 *
 * Combines all the metadata and content into a single lowercase string
 * so we can do simple text filtering with a single .includes() call.
 *
 * @param {object} item - The question or reply object
 * @param {boolean} isQuestion - True if this is a question, false if reply
 * @returns {string} - Lowercase searchable text combining all fields
 */
const getLeftText = (item, isQuestion) => {
  // Build metadata string differently for questions vs replies
  const meta = isQuestion
    ? `Question • ${item.author || ''} • ${item.timestamp || ''} • ${item.uniqueId} • ${item.replies?.length || 0} Replies [${item.tag || ''}]`
    : `${item.author || ''} replied • ${item.timestamp || ''} • ${item.uniqueId} • ${item.replies?.length || 0} Replies`;

  // Combine metadata and content, convert to lowercase for case-insensitive search
  return (meta + ' ' + (item.text || '')).toLowerCase();
};


const App = ({ topic }) => {
  // =====================================================================
  // STATE MANAGEMENT
  // =====================================================================

  /**
   * Main debate data state
   * Will be loaded from backend API instead of localStorage
   * Structure: { topic: string, questions: Question[] }
   */
  const [debateData, setDebateData] = useState({
    topic: topic || 'Sanatan vs Islam',
    questions: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form inputs for adding a new question
  const [newTag, setNewTag] = useState('');           // Category tag input
  const [newQuestionText, setNewQuestionText] = useState(''); // Question text
  const [newQuestionSide, setNewQuestionSide] = useState(''); // Which side (left/right)
  const [newQuestionFiles, setNewQuestionFiles] = useState([]); // Evidence files for new question
  const [newQuestionUrls, setNewQuestionUrls] = useState([]); // Evidence URLs for new question
  const [newQuestionUrlInput, setNewQuestionUrlInput] = useState(''); // URL input field

  // Search/filter state
  const [filterTag, setFilterTag] = useState(''); // Filter posts by tag/text

  // Reply form management
  const [drafts, setDrafts] = useState({});    // Draft text for each reply form (keyed by post ID)
  const [openForms, setOpenForms] = useState({}); // Track which reply forms are open (keyed by post ID)
  const [evidenceFiles, setEvidenceFiles] = useState({}); // Evidence files for each reply form
  const [evidenceUrls, setEvidenceUrls] = useState({}); // Evidence URLs for each reply form

  // UI feedback state
  const [copied, setCopied] = useState({});    // Track which uniqueIds were recently copied

  // Vote tracking (in-memory only, prevents double-voting during this session)
  const voteSet = useRef(new Set()); // Set of "postId-username" strings

  // Track the last opened form for auto-focus behavior
  const lastOpenedFormRef = useRef(null);

  /**
   * Parse the topic string to extract left and right labels
   * Example: "Sanatan vs Islam" -> leftLabel="Sanatan", rightLabel="Islam"
   */
  const parts = (topic || '').split(/\s+vs\.?\s+/i);
  const leftLabel = parts[0] ? parts[0].trim() : 'Left';
  const rightLabel = parts[1] ? parts[1].trim() : 'Right';

  // =====================================================================
  // SIDE EFFECTS
  // =====================================================================

  /**
   * Load debate data from backend API when component mounts
   */
  useEffect(() => {
    const loadDebateData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get all topics to find the matching one
        const topics = await topicsAPI.getAll();
        const topicData = topics.find(t => t.topic === topic);

        if (topicData) {
          const questions = await questionsAPI.getByTopic(topicData.id);
          setDebateData({
            topic: topicData.topic,
            questions: questions || []
          });
        } else {
          // Topic not found in database
          setDebateData({
            topic: topic || 'Sanatan vs Islam',
            questions: []
          });
          setError(`Topic "${topic}" not found in database.`);
        }
      } catch (err) {
        console.error('Failed to load debate data:', err);
        setError('Failed to load debate. Please make sure the backend is running.');
        setDebateData({
          topic: topic || 'Sanatan vs Islam',
          questions: []
        });
      } finally {
        setLoading(false);
      }
    };

    loadDebateData();
  }, [topic]);

  /**
   * Auto-focus the textarea when a reply form is opened
   * This improves UX by allowing users to immediately start typing
   */
  useEffect(() => {
    const id = lastOpenedFormRef.current;
    if (!id) return;

    // Small timeout to ensure DOM has updated
    setTimeout(() => {
      const form = document.getElementById(`replyform-${id}`);
      if (form) {
        const ta = form.querySelector('textarea');
        if (ta) {
          ta.focus();
          // Move cursor to end of existing text
          const val = ta.value || '';
          try {
            ta.setSelectionRange(val.length, val.length);
          } catch (err) {
            console.error(err);
          }
        }
      }
      lastOpenedFormRef.current = null;
    }, 30);
  }, [openForms]);

  // =====================================================================
  // EVENT HANDLERS
  // =====================================================================


  /**
   * Copy a uniqueId to clipboard and show confirmation message
   *
   * @param {string} id - The uniqueId to copy
   */
  const copyUniqueId = (id) => {
    navigator.clipboard.writeText(id).then(() => {
      // Show "Copied" message
      setCopied(prev => ({ ...prev, [id]: true }));

      // Hide message after 2 seconds
      setTimeout(() => {
        setCopied(prev => {
          const np = { ...prev };
          delete np[id];
          return np;
        });
      }, 2000);
    }).catch(err => console.error('Failed to copy: ', err));
  };

  /**
   * Toggle a reply form open/closed
   *
   * @param {string} id - The ID of the post whose reply form to toggle
   */
  const toggleForm = (id) => {
    const willOpen = !(openForms[id] || false);
    setOpenForms(prev => ({ ...prev, [id]: willOpen }));

    // Track which form was opened for auto-focus
    if (willOpen) lastOpenedFormRef.current = id;
  };

  /**
   * Add a new top-level question to the debate
   *
   * Validates inputs, creates a new question object, and adds it to the debate data.
   * The question is added to the array and will appear at the bottom of the board.
   */
  const addNewQuestion = async () => {
    try {
      const text = newQuestionText.trim();
      const tag = newTag.trim();

      // Validation
      if (!text) return alert('Enter question');
      if (!newQuestionSide) return alert('Please select a side (left or right) before adding a question');

      // Convert files to base64 data URLs for storage
      const processedFiles = await Promise.all(
        newQuestionFiles.map(file => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              resolve({
                name: file.name,
                size: file.size,
                type: file.type,
                dataUrl: e.target.result
              });
            };
            reader.onerror = () => {
              resolve({
                name: file.name,
                size: file.size,
                type: file.type,
                dataUrl: null
              });
            };
            reader.readAsDataURL(file);
          });
        })
      );

      // Create new question object
      const newQ = {
        id: `q-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // Unique ID
        text,
        tag,
        side: newQuestionSide || 'left', // Which column to display in
        author: CURRENT_USER,
        timestamp: new Date().toLocaleString(),
        replies: [], // Start with no replies
        votes: { up: 0, down: 0 },
        uniqueId: `q-${Date.now()}-${Math.floor(Math.random() * 1000)}` // Shareable ID
      };

      // Save to backend API
      const topics = await topicsAPI.getAll();
      const topicData = topics.find(t => t.topic === topic);

      if (!topicData) {
        alert(`Topic "${topic}" not found in database. Please create it first.`);
        return;
      }

      const savedQuestion = await questionsAPI.create({
        debateTopic: { id: topicData.id }, // Send as object with id
        text,
        tag,
        side: newQuestionSide,
        author: CURRENT_USER,
        uniqueId: `q-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      });

      // Add to debate data (local state) using the saved question from database
      setDebateData(prev => {
        try {
          const newData = { ...prev, questions: [...(prev.questions || []), savedQuestion] };
          return newData;
        } catch (innerErr) {
          console.error('Failed to add question', innerErr);
          alert('Failed to add question — check console');
          return prev;
        }
      });

      // Clear form inputs
      setNewQuestionText('');
      setNewTag('');
      setNewQuestionSide('');
      setNewQuestionFiles([]);
      setNewQuestionUrls([]);
      setNewQuestionUrlInput('');

      alert('Question added successfully!');
    } catch (err) {
      console.error('addNewQuestion error', err);
      alert('Unexpected error when adding question — check console');
    }
  };

  /**
   * Post a reply to a question or another reply
   *
   * This function:
   * 1. Finds the parent post in the debate tree
   * 2. Creates a new reply object
   * 3. Sets the reply's side to the OPPOSITE of the parent (for alternating columns)
   * 4. Adds the reply to the parent's replies array
   * 5. Attaches evidence (files and URLs) if provided
   * 6. Converts files to base64 data URLs for download/viewing
   *
   * @param {string} parentId - The ID of the post being replied to
   */
  const postReply = async (parentId) => {
    const text = drafts[parentId] || '';
    if (!text.trim()) return alert('Enter reply');

    // Get evidence for this reply
    const files = evidenceFiles[parentId] || [];
    const urls = evidenceUrls[parentId] || [];

    // Convert files to base64 data URLs for storage
    const processedFiles = await Promise.all(
      files.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              name: file.name,
              size: file.size,
              type: file.type,
              dataUrl: e.target.result // base64 data URL
            });
          };
          reader.onerror = () => {
            resolve({
              name: file.name,
              size: file.size,
              type: file.type,
              dataUrl: null
            });
          };
          reader.readAsDataURL(file);
        });
      })
    );

    // Find the parent post to determine if it's a question or reply
    const parent = findPostById(parentId, debateData.questions);
    if (!parent) {
      alert('Parent post not found');
      return;
    }

    try {
      // Determine the opposite side
      const replySide = parent.side === 'left' ? 'right' : 'left';

      // Save to backend API
      const savedReply = await repliesAPI.create({
        question: parent.id.startsWith('q-') ? { id: parent.id } : null,
        parentReply: parent.id.startsWith('r-') ? { id: parent.id } : null,
        text: text.trim(),
        side: replySide,
        author: CURRENT_USER,
        depth: parent.id.startsWith('q-') ? 0 : (parent.depth || 0) + 1,
        uniqueId: generateUniqueId('r')
      });

      // Update local state with the saved reply
      setDebateData(prev => {
        const newData = deepCopy(prev);
        const parentInState = findPostById(parentId, newData.questions);

        if (parentInState) {
          parentInState.replies = parentInState.replies || [];
          parentInState.replies.push(savedReply);
        }

        return newData;
      });

      // Clear the draft, evidence, and close the form
      setDrafts(prev => ({ ...prev, [parentId]: '' }));
      setEvidenceFiles(prev => ({ ...prev, [parentId]: [] }));
      setEvidenceUrls(prev => ({ ...prev, [parentId]: [] }));
      setOpenForms(prev => ({ ...prev, [parentId]: false }));

      alert('Reply posted successfully!');
    } catch (err) {
      console.error('Failed to save reply:', err);
      alert('Failed to post reply. Please try again.');
    }
  };

  /**
   * Handle voting (upvote or downvote)
   *
   * Prevents duplicate voting by the same user on the same post during this session.
   * In production, this would be enforced server-side.
   *
   * @param {'up'|'down'} type - Type of vote
   * @param {string} id - ID of the post being voted on
   */
  const handleVote = async (type, id) => {
    const key = id + '-' + CURRENT_USER;

    // Check if user already voted on this post
    if (voteSet.current.has(key)) return alert('Already voted');

    // Send vote to backend API
    try {
      const isQuestion = id.startsWith('q-') || debateData.questions.some(q => q.id === id);

      if (isQuestion) {
        await questionsAPI.vote(id, type);
      } else {
        await repliesAPI.vote(id, type);
      }
    } catch (err) {
      console.error('Failed to vote:', err);
      alert('Failed to register vote');
      return;
    }

    setDebateData(prev => {
      const newData = deepCopy(prev);
      const target = findPostById(id, newData.questions);

      if (target) {
        target.votes = target.votes || { up: 0, down: 0 };
        target.votes[type]++; // Increment the vote count
      }

      return newData;
    });

    // Mark this vote to prevent duplicates
    voteSet.current.add(key);
  };

  // =====================================================================
  // RENDERING HELPERS
  // =====================================================================

  /**
   * Render a Card component for a given node
   *
   * This is a wrapper that passes all necessary props to the Card component.
   *
   * @param {object} node - The question or reply to render
   * @param {number} depth - How deep in the tree (0 = question, 1+ = reply)
   * @returns {JSX.Element} - Card component
   */
  const renderCardForNode = (node, depth) => (
    <Card
      node={node}
      depth={depth}
      copied={copied}
      toggleForm={toggleForm}
      openForms={openForms}
      drafts={drafts}
      setDrafts={setDrafts}
      postReply={postReply}
      handleVote={handleVote}
      copyUniqueId={copyUniqueId}
      leftLabel={leftLabel}
      rightLabel={rightLabel}
      evidenceFiles={evidenceFiles}
      setEvidenceFiles={setEvidenceFiles}
      evidenceUrls={evidenceUrls}
      setEvidenceUrls={setEvidenceUrls}
    />
  );

  /**
   * Build a flattened list of all nodes in a question thread
   *
   * This performs a depth-first traversal of the question and all its nested replies,
   * returning a flat array where each item has { node, depth }.
   *
   * Example tree:
   *   Question (depth 0)
   *     ├─ Reply1 (depth 1)
   *     │   └─ Reply1.1 (depth 2)
   *     └─ Reply2 (depth 1)
   *
   * Returns: [{node: Question, depth: 0}, {node: Reply1, depth: 1}, {node: Reply1.1, depth: 2}, {node: Reply2, depth: 1}]
   *
   * @param {object} question - The root question object
   * @returns {Array} - Flattened array of {node, depth} objects
   */
  const buildThreadRows = (question) => {
    const rows = [];

    // Recursive depth-first search
    const dfs = (node, depth) => {
      rows.push({ node, depth });

      // Recursively add all replies
      if (Array.isArray(node.replies) && node.replies.length > 0) {
        for (const r of node.replies) {
          dfs(r, depth + 1);
        }
      }
    };

    dfs(question, 0);
    return rows;
  };

  /**
   * =====================================================================
   * CORE RENDERING LOGIC - renderQuestion()
   * =====================================================================
   *
   * This is the most complex function in the app. It determines how to display
   * a question and all its replies in a two-column layout with parent-child pairing.
   *
   * KEY ALGORITHM:
   * --------------
   * 1. When a post has replies, it gets DUPLICATED in a new row alongside its first reply
   * 2. Additional sibling replies appear in separate rows
   * 3. This creates the pattern:
   *    Row 1: Question (left) → Answer1 (right)
   *    Row 2: Answer2 (right) [alone]
   *    Row 3: Answer1 (right) → SubAnswer (left)  <- Answer1 is DUPLICATED here
   *
   * @param {object} q - The question object to render
   * @returns {JSX.Element} - The rendered question section
   */
  const renderQuestion = (q) => {
    // Step 1: Build flat list of all nodes in this thread
    const allRows = buildThreadRows(q);

    // Step 2: Apply filter if user is searching
    const filter = (filterTag || '').trim().toLowerCase();
    const rowsToRender = filter
      ? allRows.filter(r => getLeftText(r.node, r.depth === 0).includes(filter))
      : allRows;

    // If filtering hides everything, don't render this question at all
    if (filter && rowsToRender.length === 0) return null;

    // Step 3: Build render rows with pairing logic
    const renderRows = [];
    const processedAsChild = new Set(); // Track which nodes have been shown as children

    /**
     * Recursive function to process a node and its children
     *
     * This function implements the pairing logic:
     * - If a node has children, pair it with each child in separate rows
     * - First child always gets paired with parent
     * - Additional siblings shown alone (unless they also have children)
     *
     * @param {object} nodeRow - {node, depth} object
     * @param {boolean} isFirstOccurrence - True if this is the first time showing this node
     */
    const processNode = (nodeRow, isFirstOccurrence = true) => {
      const { node, depth } = nodeRow;

      // Find all direct children of this node
      const directChildren = rowsToRender.filter(r =>
        r.depth === depth + 1 &&
        node.replies &&
        node.replies.some(reply => reply.id === r.node.id)
      );

      if (directChildren.length > 0) {
        // This node has children - create paired rows
        for (let i = 0; i < directChildren.length; i++) {
          const child = directChildren[i];

          if (i === 0 || !isFirstOccurrence) {
            // Pair parent with child in same row
            // This creates rows like: [Parent] → [Child]
            renderRows.push({
              type: 'paired',
              parent: nodeRow,
              child: child
            });
            processedAsChild.add(child.node.id);

            // Recursively process the child (it might have its own children)
            // Mark as NOT first occurrence since it's already shown
            processNode(child, false);
          } else {
            // Additional sibling - show alone
            if (!processedAsChild.has(child.node.id)) {
              renderRows.push({
                type: 'single',
                row: child
              });
              processedAsChild.add(child.node.id);
            }

            // Still process recursively in case it has children
            processNode(child, false);
          }
        }
      } else {
        // No children - show alone (only if first occurrence and not already shown)
        if (isFirstOccurrence && !processedAsChild.has(node.id)) {
          renderRows.push({
            type: 'single',
            row: nodeRow
          });
        }
      }
    };

    // Step 4: Start processing from the root question
    if (rowsToRender.length > 0 && rowsToRender[0].depth === 0) {
      processNode(rowsToRender[0], true);
    }

    // Step 5: Render the rows
    return (
      <div key={`q-${q.id}`} className={`question-section ${q.side || 'left'}`} data-uniqueid={q.uniqueId} style={{ marginBottom: '14px' }}>
        {renderRows.map((item, idx) => {
          if (item.type === 'paired') {
            // PAIRED ROW: Parent and child in same row
            const { parent, child } = item;

            // Determine arrow direction based on parent's side
            // If parent is on left, arrow points right (→)
            // If parent is on right, arrow points left (←)
            const arrowDirection = parent.node.side === 'left' ? 'right' : 'left';

            return (
              <div
                key={`row-${parent.node.id}-${child.node.id}-${idx}`}
                className="thread-row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  alignItems: 'center',
                  marginBottom: '8px',
                  position: 'relative'
                }}
              >
                {/* Left column */}
                <div className="left-cell">
                  {parent.node.side === 'left'
                    ? renderCardForNode(parent.node, parent.depth)
                    : (child.node.side === 'left' ? renderCardForNode(child.node, child.depth) : null)
                  }
                </div>

                {/* Arrow indicator in the center */}
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '32px',
                  color: '#3b82f6',
                  fontWeight: 'bold',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  zIndex: 10,
                  pointerEvents: 'none' // Don't block clicks
                }}>
                  {arrowDirection === 'right' ? '→' : '←'}
                </div>

                {/* Right column */}
                <div className="right-cell">
                  {parent.node.side === 'right'
                    ? renderCardForNode(parent.node, parent.depth)
                    : (child.node.side === 'right' ? renderCardForNode(child.node, child.depth) : null)
                  }
                </div>
              </div>
            );
          } else {
            // SINGLE ROW: Node without children (or sibling)
            const { row } = item;

            return (
              <div
                key={`row-${row.node.id}-${idx}`}
                className="thread-row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  alignItems: 'start',
                  marginBottom: '8px'
                }}
              >
                <div className="left-cell">
                  {row.node.side === 'left' ? renderCardForNode(row.node, row.depth) : null}
                </div>
                <div className="right-cell">
                  {row.node.side === 'right' ? renderCardForNode(row.node, row.depth) : null}
                </div>
              </div>
            );
          }
        })}
      </div>
    );
  };

  // =====================================================================
  // MAIN RENDER
  // =====================================================================

  /**
   * Board content - either show questions or empty state
   */
  const boardContent = debateData.questions.length === 0 ? (
    <div style={{ color: '#666', margin: '10px' }}>
      <i>No questions yet. Add one below to start a debate!</i>
    </div>
  ) : (
    <div className="board-full">
      {/* Render each question thread */}
      {debateData.questions.map((q) => (
        <React.Fragment key={`thread-${q.id}`}>
          <hr className="question-sep" />
          {renderQuestion(q)}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <>
      {/* Main container with top padding for spacing from navbar */}
      <div className="container" style={{ paddingTop: '24px' }}>
        {/* Search/filter input */}
        <input
          id="tagSearch"
          placeholder="Search by tag"
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value)}
          style={{ marginBottom: '12px', marginTop: '8px', padding: '6px', width: '300px', borderRadius: '4px', border: '1px solid #d1d5db' }}
        />

        {/* Column headers showing left and right labels */}
        <div className="columns-header" style={{ marginBottom: '8px' }}>
          <div className="header-left">{leftLabel}</div>
          <div className="header-right">{rightLabel}</div>
        </div>

        {/* Main debate board */}
        <div id="board">{boardContent}</div>

        {/* Form to add new question */}
        <div className="add-question">
          <h3>Add New Question</h3>

          {/* Side selector (left/right radio buttons) */}
          <div className="side-selector" style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
            <label
              className={`side-option left ${newQuestionSide === 'left' ? 'selected' : ''}`}
              onClick={() => setNewQuestionSide('left')}
            >
              <input
                type="radio"
                name="side"
                value="left"
                checked={newQuestionSide === 'left'}
                onChange={() => setNewQuestionSide('left')}
              />
              <span className="option-name">{leftLabel}</span>
            </label>
            <label
              className={`side-option right ${newQuestionSide === 'right' ? 'selected' : ''}`}
              onClick={() => setNewQuestionSide('right')}
            >
              <input
                type="radio"
                name="side"
                value="right"
                checked={newQuestionSide === 'right'}
                onChange={() => setNewQuestionSide('right')}
              />
              <span className="option-name">{rightLabel}</span>
            </label>
          </div>

          {/* Question text input */}
          <textarea
            id="newQuestionText"
            placeholder="Type your question"
            value={newQuestionText}
            onChange={(e) => setNewQuestionText(e.target.value)}
          />

          {/* Tag input */}
          <input
            id="newTag"
            placeholder="Tag"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
          />

          {/* Evidence section */}
          <div style={{ marginTop: '12px', padding: '12px', background: '#f0f9ff', borderRadius: '6px', border: '1px solid #bae6fd' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#0c4a6e' }}>
              Evidence (optional):
            </label>

            {/* File upload */}
            <div style={{ marginBottom: '12px' }}>
              <input
                type="file"
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                multiple
                onChange={(e) => {
                  const newFiles = Array.from(e.target.files);
                  if (newFiles.length > 0) {
                    setNewQuestionFiles(prev => [...prev, ...newFiles]);
                  }
                  // Reset the input so the same file can be selected again if needed
                  e.target.value = '';
                }}
                style={{ marginBottom: '4px' }}
              />
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                Accepted: Images, Videos, Audio, PDF, Documents
              </div>

              {/* Display selected files */}
              {newQuestionFiles.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  {newQuestionFiles.map((file, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 8px',
                      background: '#fff',
                      borderRadius: '4px',
                      marginBottom: '4px',
                      border: '1px solid #e0f2fe'
                    }}>
                      <span style={{ fontSize: '16px' }}>📎</span>
                      <span style={{ flex: 1, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                      <button
                        type="button"
                        onClick={() => setNewQuestionFiles(prev => prev.filter((_, i) => i !== idx))}
                        style={{
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '2px 8px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* URL input */}
            <div>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                <input
                  type="text"
                  placeholder="Paste URL evidence (e.g., YouTube, articles, sources)"
                  value={newQuestionUrlInput}
                  onChange={(e) => setNewQuestionUrlInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newQuestionUrlInput.trim()) {
                        setNewQuestionUrls(prev => [...prev, newQuestionUrlInput.trim()]);
                        setNewQuestionUrlInput('');
                      }
                    }
                  }}
                  style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newQuestionUrlInput.trim()) {
                      setNewQuestionUrls(prev => [...prev, newQuestionUrlInput.trim()]);
                      setNewQuestionUrlInput('');
                    }
                  }}
                  style={{
                    background: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Add URL
                </button>
              </div>

              {/* Display added URLs */}
              {newQuestionUrls.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  {newQuestionUrls.map((url, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 8px',
                      background: '#fff',
                      borderRadius: '4px',
                      marginBottom: '4px',
                      border: '1px solid #e0f2fe'
                    }}>
                      <span style={{ fontSize: '16px' }}>🔗</span>
                      <span style={{ flex: 1, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#2563eb' }}>
                        {url}
                      </span>
                      <button
                        type="button"
                        onClick={() => setNewQuestionUrls(prev => prev.filter((_, i) => i !== idx))}
                        style={{
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '2px 8px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit button */}
          <button
            className="btn primary"
            onClick={addNewQuestion}
            style={{ marginTop: '8px' }}
          >
            Add Question
          </button>
        </div>
      </div>
    </>
  );
};

export default App;

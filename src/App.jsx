import React, { useState, useEffect, useRef } from 'react';
import { generateUniqueId, deepCopy } from './utils/helpers.js';
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
   * Storage key - unique per topic to keep different debates separate
   * Example: "debate_threads_Sanatan_vs_Islam"
   */
  const STORAGE_KEY = topic ? `debate_threads_${topic.replace(/\s+/g, '_')}` : 'debate_threads_default';

  /**
   * Main debate data state
   * Initialized from localStorage if available, otherwise empty
   * Structure: { topic: string, questions: Question[] }
   */
  const [debateData, setDebateData] = useState(() => {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) {
      try {
        const data = JSON.parse(s);

        // Ensure all posts have uniqueIds (for older data that might not have them)
        const ensureUniqueIds = (items) => {
          if (Array.isArray(items)) {
            items.forEach(item => {
              if (!item.uniqueId && item.id) {
                item.uniqueId = generateUniqueId(item.id[0]);
              }
              // Recursively ensure uniqueIds for all nested replies
              ensureUniqueIds(item.replies);
            });
          }
        };
        ensureUniqueIds(data.questions);
        return data;
      } catch {
        // If parsing fails, return empty debate
        return { topic: topic || 'Sanatan vs Islam', questions: [] };
      }
    }
    // No saved data, start fresh
    return { topic: topic || 'Sanatan vs Islam', questions: [] };
  });

  // Form inputs for adding a new question
  const [newTag, setNewTag] = useState('');           // Category tag input
  const [newQuestionText, setNewQuestionText] = useState(''); // Question text
  const [newQuestionSide, setNewQuestionSide] = useState(''); // Which side (left/right)

  // Search/filter state
  const [filterTag, setFilterTag] = useState(''); // Filter posts by tag/text

  // Reply form management
  const [drafts, setDrafts] = useState({});    // Draft text for each reply form (keyed by post ID)
  const [openForms, setOpenForms] = useState({}); // Track which reply forms are open (keyed by post ID)

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
   * Auto-save to localStorage whenever debateData changes
   * This ensures data persists across page refreshes
   */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(debateData));
  }, [debateData, STORAGE_KEY]);

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
   * Manual save function (auto-save happens via useEffect, but this is here for explicit calls)
   */
  const saveData = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(debateData));
  };

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
  const addNewQuestion = () => {
    try {
      const text = newQuestionText.trim();
      const tag = newTag.trim();

      // Validation
      if (!text) return alert('Enter question');
      if (!newQuestionSide) return alert('Please select a side (left or right) before adding a question');

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

      // Add to debate data
      setDebateData(prev => {
        try {
          const newData = { ...prev, questions: [...(prev.questions || []), newQ] };

          // Also save to localStorage immediately
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
          } catch (err) {
            console.error('localStorage set failed', err);
          }

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
   *
   * @param {string} parentId - The ID of the post being replied to
   */
  const postReply = (parentId) => {
    const text = drafts[parentId] || '';
    if (!text.trim()) return alert('Enter reply');

    setDebateData(prev => {
      // Use deepCopy to avoid mutating state directly
      const newData = deepCopy(prev);

      // Find the parent post (could be a question or a reply)
      const parent = findPostById(parentId, newData.questions);
      if (!parent) return newData;

      // Create new reply object
      // KEY: The reply's side is OPPOSITE of the parent's side
      // This creates the alternating left-right pattern
      const newReply = {
        id: generateUniqueId('r'),
        text: text.trim(),
        author: CURRENT_USER,
        timestamp: new Date().toLocaleString(),
        votes: { up: 0, down: 0 },
        replies: [], // This reply can itself be replied to
        uniqueId: generateUniqueId('r'),
        side: parent.side === 'left' ? 'right' : 'left' // OPPOSITE side!
      };

      // Add reply to parent's replies array
      parent.replies = parent.replies || [];
      parent.replies.push(newReply);

      return newData;
    });

    // Clear the draft and close the form
    setDrafts(prev => ({ ...prev, [parentId]: '' }));
    setOpenForms(prev => ({ ...prev, [parentId]: false }));
    saveData();
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
  const handleVote = (type, id) => {
    const key = id + '-' + CURRENT_USER;

    // Check if user already voted on this post
    if (voteSet.current.has(key)) return alert('Already voted');

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
    saveData();
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

          {/* Tag input */}
          <input
            id="newTag"
            placeholder="Tag"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
          />

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

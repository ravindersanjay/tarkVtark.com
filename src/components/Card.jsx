import React from 'react';
import ReplyForm from './ReplyForm';

/**
 * Card Component
 * ==============
 * This is the main presentational component that displays a single question or reply card.
 * It handles rendering the metadata, content, voting controls, and embedded reply form.
 *
 * Key Features:
 * - Displays question/reply metadata (author, timestamp, uniqueId)
 * - Shows the post content (question text or reply text)
 * - Provides interactive controls: Reply button, Report, Vote (up/down), Copy
 * - Embeds a ReplyForm that can be toggled on/off
 * - Applies different styling based on side (left-card vs right-card)
 *
 * @param {Object} node - The question or reply data object containing:
 *   - id: unique identifier
 *   - text: the content of the post
 *   - author: who posted it
 *   - timestamp: when it was posted
 *   - uniqueId: human-readable unique ID for sharing
 *   - side: 'left' or 'right' - determines which column to display in
 *   - votes: object with up/down vote counts
 *   - tag: (for questions only) category tag
 * @param {number} depth - How deep in the thread tree (0 = question, 1+ = replies)
 * @param {Object} copied - State object tracking which uniqueIds have been copied (for showing "Copied" message)
 * @param {Function} toggleForm - Callback to show/hide the reply form for this card
 * @param {Object} openForms - State object tracking which reply forms are currently open
 * @param {Object} drafts - State object storing draft reply text for each card
 * @param {Function} setDrafts - Callback to update draft text
 * @param {Function} postReply - Callback to submit a reply
 * @param {Function} handleVote - Callback to handle voting (up/down)
 * @param {Function} copyUniqueId - Callback to copy the uniqueId to clipboard
 * @param {string} leftLabel - Label for left side (e.g., "Hindu", "Sanatan")
 * @param {string} rightLabel - Label for right side (e.g., "Muslim", "Islam")
 */
const Card = ({
  node,
  depth = 0,
  copied = {},
  toggleForm,
  openForms = {},
  drafts = {},
  setDrafts = () => {},
  postReply = () => {},
  handleVote = () => {},
  copyUniqueId = () => {},
  leftLabel,
  rightLabel
}) => {
  // Determine if this is a top-level question (depth 0) or a reply (depth > 0)
  const isQuestion = depth === 0;

  // Build the metadata text that appears at the top of the card
  // Format: "Question • Author • Timestamp • " or "Author replied • Timestamp • "
  const metaText = isQuestion
    ? `Question • ${node.author || ''} • ${node.timestamp || ''} • `
    : `${node.author || ''} replied • ${node.timestamp || ''} • `;

  return (
    // Main card container - CSS class determines background color based on side
    // Left cards have blue background, right cards have orange/cream background
    <div
      data-uniqueid={node.uniqueId}
      className={node.side === 'left' ? 'left-card' : 'right-card'}
      style={{ marginLeft: depth > 0 ? depth * 10 : 0 }} // Indent nested replies slightly
    >
      {/* Metadata section - shows author, timestamp, uniqueId, and tag */}
      <div className="meta">
        {metaText}
        {/* Clickable uniqueId - clicking copies it to clipboard */}
        <span style={{ cursor: 'pointer' }} onClick={() => copyUniqueId(node.uniqueId)}>
          {node.uniqueId}
        </span>
        {/* Show tag only for questions (not replies) */}
        {isQuestion && <span className="tag">[ {node.tag || ''} ]</span>}
        {/* "Copied" confirmation message - shown temporarily after copying uniqueId */}
        <span className="copy-msg" style={{ display: copied[node.uniqueId] ? 'inline' : 'none' }}>
          Copied
        </span>
      </div>

      {/* Main content area - displays the question or reply text */}
      <div className="content">{node.text}</div>

      {/* Control buttons section */}
      <div className="controls">
        {/* Reply button - toggles the reply form for this card */}
        <button className="btn" onClick={() => toggleForm(node.id)}>
          Reply this {node.side === 'left' ? leftLabel : rightLabel} question
        </button>

        {/* Report button - shows alert (in real app, would report to moderators) */}
        <button className="btn" onClick={() => alert('Thank you for reporting. Our moderators will review this.')}>
          Report
        </button>

        {/* Upvote button and count */}
        <button className="btn vote" onClick={() => handleVote('up', node.id)}>👍</button>
        <span className="vote-count">{node.votes?.up || 0}</span>

        {/* Downvote button and count */}
        <button className="btn vote" onClick={() => handleVote('down', node.id)}>👎</button>
        <span className="vote-count">{node.votes?.down || 0}</span>

        {/* Copy button - copies the post text to clipboard */}
        <button className="btn" onClick={() => { navigator.clipboard.writeText(node.text || ''); }}>
          Copy
        </button>
      </div>

      {/*
        Embedded reply form component
        - Shown/hidden based on openForms state
        - Manages its own textarea with draft text
        - Calls postReply callback when submitted
      */}
      <ReplyForm
        id={node.id}
        value={drafts[node.id] || ''}
        onChange={(v) => setDrafts(prev => ({ ...prev, [node.id]: v }))}
        onPost={() => postReply(node.id)}
        open={!!openForms[node.id]}
      />
    </div>
  );
};

export default Card;

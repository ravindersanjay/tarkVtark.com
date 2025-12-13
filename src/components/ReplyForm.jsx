import React from 'react';

/**
 * =====================================================================
 * ReplyForm Component
 * =====================================================================
 *
 * A small, reusable form component for posting replies to questions and answers.
 * This form is embedded inside each Card component and can be toggled on/off.
 *
 * FEATURES:
 * - Text input for reply content
 * - Optional file upload for evidence
 * - Optional URL field for linking to evidence
 * - Visibility toggled by parent component
 *
 * USAGE:
 * The parent Card component controls:
 * - When the form is visible (via 'open' prop)
 * - The draft text content (via 'value' and 'onChange')
 * - What happens when submitted (via 'onPost')
 *
 * @param {string} id - The ID of the parent post (used for DOM element ID)
 * @param {string} value - Current draft text
 * @param {Function} onChange - Callback when text changes: (newValue) => void
 * @param {Function} onPost - Callback when form is submitted (Post Reply clicked)
 * @param {boolean} open - Whether the form should be visible
 *
 * @example
 * <ReplyForm
 *   id={post.id}
 *   value={drafts[post.id] || ''}
 *   onChange={(text) => setDrafts(prev => ({...prev, [post.id]: text}))}
 *   onPost={() => postReply(post.id)}
 *   open={openForms[post.id] || false}
 * />
 */
const ReplyForm = ({
  id,
  value = '',
  onChange = () => {},
  onPost = () => {},
  open = false
}) => {
  // Don't render anything if form is closed
  if (!open) return <div style={{ display: 'none' }} />;

  return (
    <div
      className="reply-form"
      id={`replyform-${id}`}  // ID used by auto-focus logic in App.jsx
      style={{ display: open ? 'block' : 'none' }}
    >
      {/* Main text input for reply content */}
      <textarea
        placeholder="Reply..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      {/* Evidence section - file upload and URL (optional features) */}
      <div className="evidence-row">
        {/* File upload for evidence (e.g., images, PDFs) */}
        <input
          type="file"
          className="evidence-file"
        />

        {/* URL input for linking to online evidence */}
        <input
          type="text"
          className="evidence-link"
          placeholder="Paste URL evidence (optional)"
        />
      </div>

      {/* Submit button - calls onPost callback which handles the actual posting */}
      <button
        className="btn primary"
        onClick={onPost}
        style={{ marginTop: '6px' }}
      >
        Post Reply
      </button>
    </div>
  );
};

export default ReplyForm;

import React from 'react';
import { toast } from 'react-toastify';
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
  rightLabel,
  evidenceFiles = {},
  setEvidenceFiles = () => {},
  evidenceUrls = {},
  setEvidenceUrls = () => {},
  user = null,
  onEdit = () => {},
  onEditingChange = () => {},
  onDeleteAttachment = () => {},
  onDeleteEvidenceUrl = () => {},
  userVotes = {}
}) => {
  // Local state to track if the Copy button was clicked (separate from uniqueId copy)
  const [textCopied, setTextCopied] = React.useState(false);

  // Local state for edit mode
  const [isEditing, setIsEditing] = React.useState(false);
  const [editText, setEditText] = React.useState(node.text || '');
  const [editTag, setEditTag] = React.useState(node.tag || '');
  const [editFiles, setEditFiles] = React.useState([]);
  const [editUrls, setEditUrls] = React.useState([]);
  const [editUrlInput, setEditUrlInput] = React.useState('');

  // Local state for text expansion (Read more/Less)
  const [isTextExpanded, setIsTextExpanded] = React.useState(false);

  // Notify parent when editing mode changes
  React.useEffect(() => {
    onEditingChange(node.id, isEditing);
  }, [isEditing, node.id, onEditingChange]);

  // Determine if this is a top-level question (depth 0) or a reply (depth > 0)
  const isQuestion = depth === 0;

  // Build the metadata text that appears at the top of the card
  // Format: "Question • Author • Timestamp • " or "Author replied • Timestamp • "
  const metaText = isQuestion
    ? `Question • ${node.author || ''} • ${node.timestamp || ''} • `
    : `${node.author || ''} replied • ${node.timestamp || ''} • `;

  // Handler for Copy button - copies text and shows confirmation message
  const handleCopyText = () => {
    navigator.clipboard.writeText(node.text || '');
    setTextCopied(true);
    setTimeout(() => setTextCopied(false), 2000); // Hide message after 2 seconds
  };

  // Handler for edit button
  const handleEdit = () => {
    setEditText(node.text || '');
    setEditTag(node.tag || '');
    setEditFiles([]);
    setEditUrls([]);
    setEditUrlInput('');
    setIsEditing(true);
  };

  // Handler for saving edit
  const handleSaveEdit = async () => {
    if (!editText.trim()) {
      toast.error('Text cannot be empty');
      return;
    }
    try {
      await onEdit(node.id, editText.trim(), depth === 0 ? 'question' : 'reply', {
        tag: editTag,
        files: editFiles,
        urls: editUrls
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save edit:', err);
      // Don't close edit form on error
    }
  };

  // Handler for canceling edit
  const handleCancelEdit = () => {
    setEditText(node.text || '');
    setEditTag(node.tag || '');
    setEditFiles([]);
    setEditUrls([]);
    setEditUrlInput('');
    setIsEditing(false);
  };

  // Check if current user is the author of this post
  const canEdit = user && node.author === user.email;

  // Check if user has voted on this post
  const voteKey = node.id + '-' + (user?.email || 'Anonymous');
  const currentUserVote = userVotes[voteKey]; // 'up', 'down', or undefined

  // Text truncation logic
  const MAX_CHARS = 300; // Maximum characters before truncating
  const text = node.text || '';
  const shouldTruncate = text.length > MAX_CHARS && !isTextExpanded;
  const displayText = shouldTruncate ? text.substring(0, MAX_CHARS) + '...' : text;
  
  // Debug logging
  console.log('Card Edit Check:', {
    nodeId: node.id,
    nodeAuthor: node.author,
    userEmail: user?.email,
    userName: user?.name,
    canEdit,
    isAuthenticated: !!user
  });

  // Handler to open evidence files in a new tab properly
  const openFileInNewTab = (file, e) => {
    e.preventDefault();

    if (!file.dataUrl) {
      toast.error('File data is not available');
      return;
    }

    // Check if dataUrl is an HTTP URL (from server) or a data URL (base64)
    const isHttpUrl = file.dataUrl.startsWith('http://') || file.dataUrl.startsWith('https://');

    if (isHttpUrl) {
      // For HTTP URLs, simply open them directly in a new tab
      window.open(file.dataUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    // For base64 data URLs, create custom HTML wrapper
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      const fileType = file.type || '';

      if (fileType.startsWith('image/')) {
        // For images, create an HTML page with the image
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${file.name}</title>
              <style>
                body { margin: 0; padding: 20px; background: #1a1a1a; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                img { max-width: 100%; max-height: 100vh; object-fit: contain; box-shadow: 0 4px 6px rgba(0,0,0,0.3); }
              </style>
            </head>
            <body>
              <img src="${file.dataUrl}" alt="${file.name}" />
            </body>
          </html>
        `);
        newWindow.document.close();
      } else if (fileType === 'application/pdf') {
        // For PDFs, embed the PDF viewer
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${file.name}</title>
              <style>
                body { margin: 0; padding: 0; }
                embed, iframe { width: 100%; height: 100vh; border: none; }
              </style>
            </head>
            <body>
              <embed src="${file.dataUrl}" type="application/pdf" width="100%" height="100%" />
            </body>
          </html>
        `);
        newWindow.document.close();
      } else if (fileType.startsWith('video/')) {
        // For videos
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${file.name}</title>
              <style>
                body { margin: 0; padding: 20px; background: #000; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                video { max-width: 100%; max-height: 100vh; }
              </style>
            </head>
            <body>
              <video controls autoplay>
                <source src="${file.dataUrl}" type="${fileType}">
                Your browser does not support the video tag.
              </video>
            </body>
          </html>
        `);
        newWindow.document.close();
      } else if (fileType.startsWith('audio/')) {
        // For audio
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${file.name}</title>
              <style>
                body { margin: 0; padding: 40px; background: #f3f4f6; display: flex; justify-content: center; align-items: center; min-height: 100vh; flex-direction: column; }
                h2 { color: #374151; margin-bottom: 20px; }
                audio { width: 100%; max-width: 500px; }
              </style>
            </head>
            <body>
              <h2>🎵 ${file.name}</h2>
              <audio controls autoplay>
                <source src="${file.dataUrl}" type="${fileType}">
                Your browser does not support the audio tag.
              </audio>
            </body>
          </html>
        `);
        newWindow.document.close();
      } else {
        // For other file types, try direct navigation
        newWindow.location.href = file.dataUrl;
      }
    } else {
      toast.error('Pop-up blocked. Please allow pop-ups for this site.');
    }
  };

  return (
    // Main card container - CSS class determines background color based on side
    // Left cards have blue background, right cards have orange/cream background
    <div
      data-uniqueid={node.uniqueId}
      data-timestamp={node.timestamp}
      data-testid={`card-${node.id}`}
      className={node.side === 'left' ? 'left-card' : 'right-card'}
      style={{ marginLeft: depth > 0 ? depth * 10 : 0 }} // Indent nested replies slightly
    >
      {/* Metadata section - shows author, timestamp, uniqueId, and tag */}
      <div className="meta" data-testid={`card-meta-${node.id}`}>
        {metaText}
        {/* Clickable uniqueId - clicking copies URL to clipboard */}
        <span style={{ cursor: 'pointer' }} data-testid={`card-uniqueid-${node.id}`} onClick={() => copyUniqueId(node.timestamp, node.uniqueId)}>
          {node.uniqueId}
        </span>
        {/* Show tags only for questions (not replies) */}
        {isQuestion && node.tag && (
          <div data-testid={`card-tags-${node.id}`} style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginLeft: '8px' }}>
            {node.tag.split(',').map((tag, idx) => (
              tag.trim() && (
                <span
                  key={idx}
                  data-testid={`card-tag-${node.id}-${idx}`}
                  className="tag"
                  style={{
                    display: 'inline-block',
                    padding: '2px 6px',
                    background: '#e0e7ff',
                    color: '#3730a3',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '500'
                  }}
                >
                  {tag.trim()}
                </span>
              )
            ))}
          </div>
        )}
        {/* "Copied" confirmation message - shown temporarily after copying */}
        <span className="copy-msg" data-testid={`card-copy-msg-${node.id}`} style={{ display: copied[node.timestamp || node.uniqueId] ? 'inline' : 'none' }}>
          Copied
        </span>
      </div>

      {/* Main content area - displays the question or reply text or edit form */}
      {isEditing ? (
        <div data-testid={`card-edit-form-${node.id}`} style={{ marginTop: '8px' }}>
          {/* Tag input for questions */}
          {isQuestion && (
            <div data-testid={`card-edit-tag-section-${node.id}`} style={{ marginBottom: '8px' }}>
              <label data-testid={`card-edit-tag-label-${node.id}`} style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#4b5563' }}>
                Tags (comma-separated):
              </label>
              <input
                type="text"
                data-testid={`card-edit-tag-input-${node.id}`}
                value={editTag}
                onChange={(e) => setEditTag(e.target.value)}
                placeholder="e.g., politics, religion, history"
                style={{
                  width: '100%',
                  padding: '6px',
                  borderRadius: '4px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px'
                }}
              />
            </div>
          )}
          
          <textarea
            data-testid={`card-edit-textarea-${node.id}`}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            style={{
              width: '100%',
              minHeight: '80px',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
              fontFamily: 'inherit'
            }}
          />
          
          {/* Existing Attachments */}
          {node.evidence?.files && node.evidence.files.length > 0 && (
            <div data-testid={`card-edit-existing-attachments-${node.id}`} style={{ marginTop: '12px', padding: '8px', background: '#f9fafb', borderRadius: '4px' }}>
              <label data-testid={`card-edit-attachments-label-${node.id}`} style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '13px' }}>Existing Attachments:</label>
              {node.evidence.files.map((file, idx) => (
                <div key={idx} data-testid={`card-edit-attachment-item-${node.id}-${idx}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', background: '#fff', marginBottom: '4px', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                  <span data-testid={`card-edit-attachment-name-${node.id}-${idx}`} style={{ fontSize: '12px' }}>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                  <button
                    type="button"
                    className="btn btn-small btn-danger"
                    data-testid={`card-edit-attachment-delete-${node.id}-${idx}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onDeleteAttachment(file.id);
                    }}
                    style={{ padding: '2px 8px', fontSize: '11px' }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}

           {/* New File Upload */}
           <div data-testid={`card-edit-new-files-${node.id}`} style={{ marginTop: '8px' }}>
              <label data-testid={`card-edit-new-files-label-${node.id}`} style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '13px' }}>Add New Attachments:</label>
              <input
                type="file"
                data-testid={`card-edit-file-input-${node.id}`}
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                multiple
                onChange={(e) => {
                  const newFiles = Array.from(e.target.files);
                  if (newFiles.length > 0) {
                    setEditFiles(prev => [...prev, ...newFiles]);
                  }
                  e.target.value = '';
                }}
              />
              {editFiles.length > 0 && (
                <div data-testid={`card-edit-new-files-list-${node.id}`} style={{ marginTop: '8px', padding: '8px', background: '#fef3c7', borderRadius: '4px', border: '1px solid #fcd34d' }}>
                  <label data-testid={`card-edit-new-files-label2-${node.id}`} style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '12px', color: '#92400e' }}>New files to upload:</label>
                  {editFiles.map((file, idx) => (
                    <div key={idx} data-testid={`card-edit-new-file-item-${node.id}-${idx}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', background: '#fff', marginBottom: '4px', borderRadius: '4px', border: '1px solid #fcd34d' }}>
                      <span data-testid={`card-edit-new-file-name-${node.id}-${idx}`} style={{ fontSize: '12px' }}>📄 {file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                      <button
                        type="button"
                        className="btn btn-small btn-danger"
                        data-testid={`card-edit-new-file-remove-${node.id}-${idx}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setEditFiles(prev => prev.filter((_, i) => i !== idx));
                        }}
                        style={{ padding: '2px 8px', fontSize: '11px' }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          {/* Existing URLs */}
          {node.evidence?.urls && node.evidence.urls.length > 0 && (
            <div data-testid={`card-edit-existing-urls-${node.id}`} style={{ marginTop: '12px', padding: '8px', background: '#f9fafb', borderRadius: '4px' }}>
              <label data-testid={`card-edit-urls-label-${node.id}`} style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '13px' }}>Existing URLs:</label>
              {node.evidence.urls.map((url, idx) => (
                <div key={idx} data-testid={`card-edit-url-item-${node.id}-${idx}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', background: '#fff', marginBottom: '4px', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                  <a data-testid={`card-edit-url-link-${node.id}-${idx}`} href={url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#2563eb', textDecoration: 'none' }}>{url}</a>
                  <button
                    type="button"
                    className="btn btn-small btn-danger"
                    data-testid={`card-edit-url-delete-${node.id}-${idx}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onDeleteEvidenceUrl(url, node.id, depth === 0 ? 'question' : 'reply');
                    }}
                    style={{ padding: '2px 8px', fontSize: '11px' }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* New URL Input */}
          <div data-testid={`card-edit-new-urls-${node.id}`} style={{ marginTop: '8px' }}>
            <label data-testid={`card-edit-new-urls-label-${node.id}`} style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '13px' }}>Add New URL:</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                data-testid={`card-edit-url-input-${node.id}`}
                placeholder="https://example.com"
                value={editUrlInput}
                onChange={(e) => setEditUrlInput(e.target.value)}
                style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db' }}
              />
              <button
                type="button"
                className="btn btn-small"
                data-testid={`card-edit-url-add-${node.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (editUrlInput.trim()) {
                    setEditUrls(prev => [...prev, editUrlInput.trim()]);
                    setEditUrlInput('');
                  }
                }}
                style={{ padding: '6px 12px' }}
              >
                Add
              </button>
            </div>
            {editUrls.length > 0 && (
              <div data-testid={`card-edit-new-urls-list-${node.id}`} style={{ marginTop: '4px' }}>
                {editUrls.map((url, idx) => (
                  <div key={idx} data-testid={`card-edit-new-url-item-${node.id}-${idx}`} style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>
                    + {url}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div data-testid={`card-edit-actions-${node.id}`} style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
            <button className="btn primary" data-testid={`card-edit-save-${node.id}`} onClick={handleSaveEdit}>
              Save
            </button>
            <button className="btn" data-testid={`card-edit-cancel-${node.id}`} onClick={handleCancelEdit}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="content" data-testid={`card-content-${node.id}`}>
          {displayText}
          {text.length > MAX_CHARS && (
            <button
              data-testid={`card-read-more-${node.id}`}
              onClick={() => setIsTextExpanded(!isTextExpanded)}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                cursor: 'pointer',
                padding: '0',
                marginLeft: '4px',
                fontSize: '14px',
                fontWeight: '500',
                textDecoration: 'underline'
              }}
            >
              {isTextExpanded ? 'Read less' : 'Read more'}
            </button>
          )}
        </div>
      )}

       {/* Display evidence if available */}
       {node.evidence && (node.evidence.files?.length > 0 || node.evidence.urls?.length > 0) && (
         <div className="evidence-container" data-testid={`card-evidence-${node.id}`}>
           <div className="evidence-title" data-testid={`card-evidence-title-${node.id}`}>📚 Evidence Attached:</div>

           {/* Display file evidence */}
           {node.evidence.files && node.evidence.files.length > 0 && (
             <div data-testid={`card-evidence-files-${node.id}`}>
               {node.evidence.files.map((file, idx) => (
                 <div key={idx} className="evidence-item" data-testid={`card-evidence-file-${node.id}-${idx}`}>
                   <span className="evidence-icon" data-testid={`card-evidence-file-icon-${node.id}-${idx}`}>📎</span>
                   {file.dataUrl ? (
                     <a
                       data-testid={`card-evidence-file-link-${node.id}-${idx}`}
                       href={file.dataUrl}
                       target="_blank"
                       rel="noopener noreferrer"
                       onClick={(e) => openFileInNewTab(file, e)}
                     >
                       {file.name} ({(file.size / 1024).toFixed(1)} KB)
                     </a>
                   ) : (
                     <span data-testid={`card-evidence-file-name-${node.id}-${idx}`} style={{ fontSize: '13px', color: '#6b7280' }}>
                       {file.name} ({(file.size / 1024).toFixed(1)} KB)
                     </span>
                   )}
                 </div>
               ))}
             </div>
           )}

           {/* Display URL evidence */}
           {node.evidence.urls && node.evidence.urls.length > 0 && (
             <div data-testid={`card-evidence-urls-${node.id}`}>
               {node.evidence.urls.map((url, idx) => (
                 <div key={idx} className="evidence-item" data-testid={`card-evidence-url-${node.id}-${idx}`}>
                   <span className="evidence-icon" data-testid={`card-evidence-url-icon-${node.id}-${idx}`}>🔗</span>
                   <a
                     data-testid={`card-evidence-url-link-${node.id}-${idx}`}
                     href={url}
                     target="_blank"
                     rel="noopener noreferrer"
                   >
                     {url}
                   </a>
                 </div>
               ))}
             </div>
           )}
         </div>
       )}

      {/* Control buttons section */}
      <div className="controls" data-testid={`card-controls-${node.id}`}>
        {/* Edit button - only shown if user is the author */}
        {canEdit && !isEditing && (
          <button 
            className="btn" 
            data-testid={`card-edit-button-${node.id}`}
            onClick={handleEdit}
            style={{ backgroundColor: '#10b981', color: 'white', fontWeight: 'bold' }}
          >
            ✏️ Edit
          </button>
        )}
        
        {/* Debug: Show if canEdit is false */}
        {!canEdit && (
          <span data-testid={`card-not-author-${node.id}`} style={{ fontSize: '10px', color: '#999' }}>Not your post</span>
        )}

        {/* Reply button - toggles the reply form for this card */}
        <button className="btn" data-testid={`card-reply-button-${node.id}`} onClick={() => toggleForm(node.id)}>
          Reply this {node.side === 'left' ? leftLabel : rightLabel} question
        </button>

        {/* Report button - saves report to localStorage for admin review */}
        <button className="btn report" data-testid={`card-report-button-${node.id}`} onClick={() => {
          const reason = prompt('Please provide a reason for reporting this post:');
          if (reason && reason.trim()) {
            const reports = JSON.parse(localStorage.getItem('reported_posts') || '[]');
            reports.push({
              postId: node.uniqueId,
              postText: node.text,
              reporter: node.author || 'Anonymous',
              reason: reason.trim(),
              timestamp: new Date().toLocaleString()
            });
            localStorage.setItem('reported_posts', JSON.stringify(reports));
            toast.success('Report submitted. Thank you! Our moderators will review this.');
          }
        }}>
          Report
        </button>

        {/* Upvote button and count */}
        <button
          className="btn vote"
          data-testid={`card-upvote-button-${node.id}`}
          onClick={() => handleVote('up', node.id)}
          style={{
            backgroundColor: currentUserVote === 'up' ? '#2563eb' : '#fff',
            color: currentUserVote === 'up' ? '#fff' : '#374151',
            borderColor: currentUserVote === 'up' ? '#2563eb' : '#e5e7eb'
          }}
        >
          👍
        </button>
        <span className="vote-count" data-testid={`card-upvote-count-${node.id}`}>{node.votes?.up || 0}</span>

        {/* Downvote button and count */}
        <button
          className="btn vote"
          data-testid={`card-downvote-button-${node.id}`}
          onClick={() => handleVote('down', node.id)}
          style={{
            backgroundColor: currentUserVote === 'down' ? '#dc2626' : '#fff',
            color: currentUserVote === 'down' ? '#fff' : '#374151',
            borderColor: currentUserVote === 'down' ? '#dc2626' : '#e5e7eb'
          }}
        >
          👎
        </button>
        <span className="vote-count" data-testid={`card-downvote-count-${node.id}`}>{node.votes?.down || 0}</span>

        {/* Copy button - copies the post text to clipboard */}
        <button className="btn" data-testid={`card-copy-button-${node.id}`} onClick={handleCopyText}>
          Copy
        </button>
        {/* "Copied!!" confirmation message - shown temporarily after copying text */}
        <span className="copy-msg" data-testid={`card-text-copied-${node.id}`} style={{ display: textCopied ? 'inline' : 'none' }}>
          Copied!!
        </span>
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
        evidenceFiles={evidenceFiles[node.id] || []}
        onFilesChange={(files) => setEvidenceFiles(prev => ({ ...prev, [node.id]: files }))}
        evidenceUrls={evidenceUrls[node.id] || []}
        onUrlsChange={(urls) => setEvidenceUrls(prev => ({ ...prev, [node.id]: urls }))}
      />
    </div>
  );
};

export default Card;

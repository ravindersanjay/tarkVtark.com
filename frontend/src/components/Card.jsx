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
  rightLabel,
  evidenceFiles = {},
  setEvidenceFiles = () => {},
  evidenceUrls = {},
  setEvidenceUrls = () => {}
}) => {
  // Local state to track if the Copy button was clicked (separate from uniqueId copy)
  const [textCopied, setTextCopied] = React.useState(false);

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

  // Handler to open evidence files in a new tab properly
  const openFileInNewTab = (file, e) => {
    e.preventDefault();

    if (!file.dataUrl) {
      alert('File data is not available');
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
      alert('Pop-up blocked. Please allow pop-ups for this site.');
    }
  };

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

      {/* Display evidence if available */}
      {node.evidence && (node.evidence.files?.length > 0 || node.evidence.urls?.length > 0) && (
        <div style={{ marginTop: '8px', padding: '10px', background: '#f0f9ff', borderRadius: '6px', border: '1px solid #bae6fd' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#0c4a6e', marginBottom: '8px' }}>
            📚 Evidence Attached:
          </div>

          {/* Display file evidence */}
          {node.evidence.files && node.evidence.files.length > 0 && (
            <div style={{ marginBottom: '8px' }}>
              {node.evidence.files.map((file, idx) => (
                <div key={idx} style={{
                  padding: '6px 10px',
                  background: '#fff',
                  borderRadius: '4px',
                  marginBottom: '4px',
                  border: '1px solid #e0f2fe',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '16px' }}>📎</span>
                  {file.dataUrl ? (
                    <a
                      href={file.dataUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#2563eb',
                        textDecoration: 'underline',
                        fontSize: '13px',
                        flex: 1,
                        cursor: 'pointer'
                      }}
                      onClick={(e) => openFileInNewTab(file, e)}
                    >
                      {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </a>
                  ) : (
                    <span style={{ fontSize: '13px', color: '#6b7280', flex: 1 }}>
                      {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Display URL evidence */}
          {node.evidence.urls && node.evidence.urls.length > 0 && (
            <div>
              {node.evidence.urls.map((url, idx) => (
                <div key={idx} style={{
                  padding: '6px 10px',
                  background: '#fff',
                  borderRadius: '4px',
                  marginBottom: '4px',
                  border: '1px solid #e0f2fe',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '16px' }}>🔗</span>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#2563eb',
                      textDecoration: 'underline',
                      fontSize: '13px',
                      flex: 1,
                      wordBreak: 'break-all',
                      cursor: 'pointer'
                    }}
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
      <div className="controls">
        {/* Reply button - toggles the reply form for this card */}
        <button className="btn" onClick={() => toggleForm(node.id)}>
          Reply this {node.side === 'left' ? leftLabel : rightLabel} question
        </button>

        {/* Report button - saves report to localStorage for admin review */}
        <button className="btn report" onClick={() => {
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
            alert('Report submitted. Thank you! Our moderators will review this.');
          }
        }}>
          Report
        </button>

        {/* Upvote button and count */}
        <button className="btn vote" onClick={() => handleVote('up', node.id)}>👍</button>
        <span className="vote-count">{node.votes?.up || 0}</span>

        {/* Downvote button and count */}
        <button className="btn vote" onClick={() => handleVote('down', node.id)}>👎</button>
        <span className="vote-count">{node.votes?.down || 0}</span>

        {/* Copy button - copies the post text to clipboard */}
        <button className="btn" onClick={handleCopyText}>
          Copy
        </button>
        {/* "Copied!!" confirmation message - shown temporarily after copying text */}
        <span className="copy-msg" style={{ display: textCopied ? 'inline' : 'none' }}>
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

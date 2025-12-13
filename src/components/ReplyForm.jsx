import React, { useState } from 'react';

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
 * - Multiple file uploads for evidence (images, videos, audio, PDFs)
 * - Multiple URL fields for linking to evidence
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
 * @param {Array} evidenceFiles - Array of selected files
 * @param {Function} onFilesChange - Callback when files change
 * @param {Array} evidenceUrls - Array of URLs
 * @param {Function} onUrlsChange - Callback when URLs change
 */
const ReplyForm = ({
  id,
  value = '',
  onChange = () => {},
  onPost = () => {},
  open = false,
  evidenceFiles = [],
  onFilesChange = () => {},
  evidenceUrls = [],
  onUrlsChange = () => {}
}) => {
  // Local state for URL input field
  const [currentUrl, setCurrentUrl] = useState('');

  // Don't render anything if form is closed
  if (!open) return <div style={{ display: 'none' }} />;

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      onFilesChange([...evidenceFiles, ...files]);
    }
  };

  // Remove a file from the list
  const removeFile = (index) => {
    const newFiles = evidenceFiles.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  // Add URL to the list
  const addUrl = () => {
    const url = currentUrl.trim();
    if (url) {
      onUrlsChange([...evidenceUrls, url]);
      setCurrentUrl('');
    }
  };

  // Remove URL from the list
  const removeUrl = (index) => {
    const newUrls = evidenceUrls.filter((_, i) => i !== index);
    onUrlsChange(newUrls);
  };

  return (
    <div
      className="reply-form"
      id={`replyform-${id}`}
      style={{ display: open ? 'block' : 'none' }}
    >
      {/* Main text input for reply content */}
      <textarea
        placeholder="Reply..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      {/* Evidence section - file upload and URL */}
      <div style={{ marginTop: '8px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
          Evidence (optional):
        </label>

        {/* File upload section */}
        <div style={{ marginBottom: '8px' }}>
          <input
            type="file"
            className="evidence-file"
            onChange={handleFileSelect}
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
            multiple
            style={{ marginBottom: '4px' }}
          />
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
            Accepted: Images, Videos, Audio, PDF, Documents
          </div>

          {/* Display selected files */}
          {evidenceFiles.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              {evidenceFiles.map((file, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 8px',
                  background: '#f3f4f6',
                  borderRadius: '4px',
                  marginBottom: '4px',
                  fontSize: '13px'
                }}>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    📎 {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
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

        {/* URL input section */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
            <input
              type="text"
              className="evidence-link"
              placeholder="Paste URL evidence (e.g., YouTube, articles, sources)"
              value={currentUrl}
              onChange={(e) => setCurrentUrl(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addUrl();
                }
              }}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={addUrl}
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
          {evidenceUrls.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              {evidenceUrls.map((url, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 8px',
                  background: '#eff6ff',
                  borderRadius: '4px',
                  marginBottom: '4px',
                  fontSize: '13px'
                }}>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#2563eb' }}>
                    🔗 {url}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeUrl(idx)}
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
        onClick={onPost}
        style={{ marginTop: '6px' }}
      >
        Post Reply
      </button>
    </div>
  );
};

export default ReplyForm;

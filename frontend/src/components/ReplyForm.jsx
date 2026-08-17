import React, { useState } from 'react';
import RichTextInput from './RichTextInput';

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
      data-testid={`reply-form-${id}`}
      style={{ display: open ? 'block' : 'none' }}
    >
      {/* Main text input for reply content */}
      <RichTextInput
        data-testid={`reply-textarea-${id}`}
        placeholder="Reply..."
        value={value}
        onChange={onChange}
      />

      {/* Evidence section - file upload and URL */}
      <div style={{ marginTop: '8px' }} data-testid={`reply-evidence-section-${id}`}>
        <label data-testid={`reply-evidence-label-${id}`} style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
          Evidence (optional):
        </label>

        {/* File upload section */}
        <div style={{ marginBottom: '8px' }} data-testid={`reply-file-upload-section-${id}`}>
          <input
            type="file"
            data-testid={`reply-file-input-${id}`}
            className="evidence-file"
            onChange={handleFileSelect}
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
            multiple
            style={{ marginBottom: '4px' }}
          />
          <div data-testid={`reply-file-accept-text-${id}`} style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
            Accepted: Images, Videos, Audio, PDF, Documents
          </div>

          {/* Display selected files */}
          {evidenceFiles.length > 0 && (
            <div data-testid={`reply-files-list-${id}`} style={{ marginTop: '8px' }}>
              {evidenceFiles.map((file, idx) => (
                <div key={idx} data-testid={`reply-file-item-${id}-${idx}`} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 8px',
                  background: '#f3f4f6',
                  borderRadius: '4px',
                  marginBottom: '4px',
                  fontSize: '13px'
                }}>
                  <span data-testid={`reply-file-name-${id}-${idx}`} style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    📎 {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                  <button
                    type="button"
                    data-testid={`reply-file-remove-${id}-${idx}`}
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
        <div data-testid={`reply-url-section-${id}`} style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
            <input
              type="text"
              data-testid={`reply-url-input-${id}`}
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
              data-testid={`reply-add-url-${id}`}
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
            <div data-testid={`reply-urls-list-${id}`} style={{ marginTop: '8px' }}>
              {evidenceUrls.map((url, idx) => (
                <div key={idx} data-testid={`reply-url-item-${id}-${idx}`} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 8px',
                  background: '#eff6ff',
                  borderRadius: '4px',
                  marginBottom: '4px',
                  fontSize: '13px'
                }}>
                  <span data-testid={`reply-url-link-${id}-${idx}`} style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#2563eb' }}>
                    🔗 {url}
                  </span>
                  <button
                    type="button"
                    data-testid={`reply-url-remove-${id}-${idx}`}
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
        data-testid={`reply-post-button-${id}`}
        onClick={onPost}
        style={{ marginTop: '6px' }}
      >
        Post Reply
      </button>
    </div>
  );
};

export default ReplyForm;

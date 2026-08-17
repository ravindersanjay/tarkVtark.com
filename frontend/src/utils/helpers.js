/**
 * =====================================================================
 * UTILITY HELPERS FOR DEBATE APPLICATION
 * =====================================================================
 *
 * This file contains small, dependency-free utility functions used throughout
 * the debate application. These helpers handle:
 * - Generating unique IDs for posts
 * - HTML escaping for security (though React handles this automatically)
 * - Deep copying objects to maintain immutability
 *
 * All functions are pure and have no side effects.
 */

/**
 * Generate a pseudo-unique ID for posts (questions and replies)
 *
 * Creates an ID by combining:
 * - A prefix (e.g., 'q' for question, 'r' for reply)
 * - Current timestamp (milliseconds since epoch)
 * - Random number (0-999)
 *
 * Example output: "q-1702475844123-456" or "r-1702475844567-789"
 *
 * NOTE: This is NOT cryptographically secure. It's designed for UI/local usage only.
 * For production, you'd want server-generated UUIDs or a more robust ID system.
 *
 * The combination of timestamp + random makes collisions extremely unlikely for
 * a single-user application, but wouldn't be suitable for a multi-user system
 * where IDs need to be globally unique.
 *
 * @param {string} prefix - Prefix for the ID (defaults to 'id')
 * @returns {string} - Generated unique ID
 *
 * @example
 * generateUniqueId('q')  // Returns: "q-1702475844123-456"
 * generateUniqueId('r')  // Returns: "r-1702475844567-789"
 */
// Helper to pad numbers with leading zeros
const pad = (n, len = 2) => String(n).padStart(len, '0');

// Format timestamp as DD.MM.YYYY.HH.MM.SS.MS
const formatTimestampForId = (date = new Date()) => {
  const dd = pad(date.getDate());
  const mm = pad(date.getMonth() + 1);
  const yyyy = date.getFullYear();
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  const ms = String(date.getMilliseconds());
  return `${dd}.${mm}.${yyyy}.${hh}.${min}.${ss}.${ms}`;
};

/**
 * Generate a pseudo-unique ID for posts using a human-readable timestamp.
 * Example: "r21.06.2026.02.59.12.123-837"
 */
export const generateUniqueId = (prefix = 'id') =>
  `${prefix}${formatTimestampForId(new Date())}-${Math.floor(Math.random() * 1000)}`;

/**
 * Escape HTML special characters to prevent XSS attacks
 *
 * Converts potentially dangerous HTML characters into safe entities:
 * - & becomes &amp;
 * - < becomes &lt;
 * - > becomes &gt;
 *
 * NOTE: In React, this function is actually NOT needed because React automatically
 * escapes text content when you use JSX like {text}. We keep it here for reference,
 * but the Card component doesn't use it anymore.
 *
 * This would only be necessary if you were using dangerouslySetInnerHTML or
 * manipulating the DOM directly outside of React.
 *
 * @param {string} text - The text to escape
 * @returns {string} - HTML-safe text with special characters escaped
 *
 * @example
 * escapeHtml('<script>alert("xss")</script>')
 * // Returns: '&lt;script&gt;alert("xss")&lt;/script&gt;'
 *
 * escapeHtml('Rock & Roll')
 * // Returns: 'Rock &amp; Roll'
 */
export const escapeHtml = (text = '') => {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

/**
 * Create a deep copy of a JSON-serializable object
 *
 * This is used to maintain immutability when updating React state. Instead of
 * mutating the original state object, we create a deep copy, modify the copy,
 * and then set that as the new state.
 *
 * HOW IT WORKS:
 * 1. JSON.stringify() converts the object to a JSON string
 * 2. JSON.parse() converts it back to a new object
 * 3. This creates a completely new object with no references to the original
 *
 * LIMITATIONS:
 * - Only works with JSON-serializable data (no functions, undefined, Date objects, etc.)
 * - Relatively slow for very large objects (but fine for typical debate data)
 * - Loses any non-JSON data (functions, symbols, undefined values, etc.)
 *
 * For this app, it's perfect because our debate data is pure JSON (strings, numbers,
 * arrays, and objects only).
 *
 * IMMUTABILITY EXAMPLE:
 * Without deepCopy:
 *   const newData = prev;           // Same reference!
 *   newData.questions.push(q);      // Mutates original state (BAD!)
 *
 * With deepCopy:
 *   const newData = deepCopy(prev); // New object, no shared references
 *   newData.questions.push(q);      // Only modifies the copy (GOOD!)
 *
 * @param {any} obj - The object to deep copy (must be JSON-serializable)
 * @returns {any} - A deep copy of the object
 *
 * @example
 * const original = { questions: [{id: 1, text: 'Q1'}] };
 * const copy = deepCopy(original);
 * copy.questions.push({id: 2, text: 'Q2'});
 * // original.questions still has only 1 item
 * // copy.questions now has 2 items
 */
export const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));

/**
 * Sanitize HTML by removing dangerous elements and attributes
 * Used when rendering user-generated HTML content safely
 */
export const sanitizeHtml = (html = '') => {
  if (typeof html !== 'string') return '';
  
  const temp = document.createElement('div');
  temp.innerHTML = html;
  
  temp.querySelectorAll('script').forEach(el => el.remove());
  
  temp.querySelectorAll('*').forEach(el => {
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('on')) {
        el.removeAttribute(attr.name);
      }
    });
    if (el.tagName === 'A' && el.href && el.href.trim().toLowerCase().startsWith('javascript:')) {
      el.removeAttribute('href');
    }
    if ((el.tagName === 'IMG' || el.tagName === 'IFRAME' || el.tagName === 'VIDEO') && el.src && el.src.trim().toLowerCase().startsWith('javascript:')) {
      el.removeAttribute('src');
    }
  });
  
  return temp.innerHTML;
};

/**
 * Safely truncate HTML content to a maximum character length
 * Preserves HTML structure by truncating at text nodes
 */
export const truncateHtml = (html, maxLength) => {
  if (!html || typeof html !== 'string') return '';
  if (html.length <= maxLength) return html;
  
  const temp = document.createElement('div');
  temp.innerHTML = html;
  
  let length = 0;
  const walker = document.createTreeWalker(temp, NodeFilter.SHOW_TEXT);
  let node;
  
  while ((node = walker.nextNode())) {
    if (length + node.nodeValue.length > maxLength) {
      node.nodeValue = node.nodeValue.substring(0, maxLength - length) + '...';
      let next = node.nextSibling;
      while (next) {
        const toRemove = next;
        next = next.nextSibling;
        toRemove.remove();
      }
      break;
    }
    length += node.nodeValue.length;
  }
  
  return temp.innerHTML;
};

/**
 * Clean rich text HTML by stripping unnecessary attributes and styles
 * Preserves semantic structure while removing bloat from pasted content
 */
export const cleanRichText = (html = '') => {
  if (typeof html !== 'string') return '';
  
  const temp = document.createElement('div');
  temp.innerHTML = html;
  
  const ALLOWED_TAGS = new Set([
    'P', 'BR', 'B', 'I', 'U', 'STRONG', 'EM', 'A', 'UL', 'OL', 'LI',
    'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'PRE', 'CODE',
    'SPAN', 'DIV', 'TABLE', 'TR', 'TD', 'TH', 'THEAD', 'TBODY'
  ]);
  
  const ALLOWED_ATTRS = new Set(['HREF', 'TARGET', 'REL']);
  
  function cleanNode(node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = node.tagName;
      
      if (!ALLOWED_TAGS.has(tagName)) {
        while (node.firstChild) {
          node.parentNode.insertBefore(node.firstChild, node);
        }
        node.remove();
        return;
      }
      
      Array.from(node.attributes).forEach(attr => {
        if (!ALLOWED_ATTRS.has(attr.name.toUpperCase())) {
          node.removeAttribute(attr.name);
        }
      });
      
      if (tagName === 'A') {
        const href = node.getAttribute('href');
        if (href && href.trim().toLowerCase().startsWith('javascript:')) {
          node.removeAttribute('href');
        } else if (!href) {
          node.removeAttribute('href');
        }
      }
      
      Array.from(node.childNodes).forEach(cleanNode);
    }
  }
  
  Array.from(temp.childNodes).forEach(cleanNode);
  
  let cleaned = temp.innerHTML;
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  cleaned = cleaned.replace(/> <\//g, '><');
  
  return cleaned;
};

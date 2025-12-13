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
export const generateUniqueId = (prefix = 'id') =>
  prefix + Date.now() + '-' + Math.floor(Math.random() * 1000);

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

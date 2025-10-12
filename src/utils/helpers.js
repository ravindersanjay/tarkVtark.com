// Utility helpers for debate app

export const generateUniqueId = (prefix = 'id') => prefix + Date.now() + '-' + Math.floor(Math.random() * 1000);

export const escapeHtml = (text = '') => {
  if (text === null || text === undefined) return '';
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

export const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));

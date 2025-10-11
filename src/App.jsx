import React, { useState, useRef, useEffect } from 'react';


const CURRENT_USER = 'CurrentUser';

const generateUniqueId = (prefix = 'id') => prefix + Date.now() + '-' + Math.floor(Math.random() * 1000);
const escapeHtml = (text = '') => {
  if (text === null || text === undefined) return '';
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));

const findPostById = (id, questions) => {
  const q = questions.find(x => x.id === id);
  if (q) return q;
  return findReplyById(id, questions);
};

const findReplyById = (id, arr) => {
  if (!Array.isArray(arr)) return null;
  for (const r of arr) {
    if (r.id === id) return r;
    if (r.replies) {
      const found = findReplyById(id, r.replies);
      if (found) return found;
    }
  }
  return null;
};

const getLeftText = (item, isQuestion) => {
  const meta = isQuestion
    ? `Question • ${item.author || ''} • ${item.timestamp || ''} • ${item.uniqueId} • ${item.replies?.length || 0} Replies [${item.tag || ''}]`
    : `${item.author || ''} replied • ${item.timestamp || ''} • ${item.uniqueId} • ${item.replies?.length || 0} Replies`;
  return (meta + ' ' + (item.text || '')).toLowerCase();
};


const App = ({ topic }) => {
  // Use topic prop for per-topic storage
  const STORAGE_KEY = topic ? `debate_threads_${topic.replace(/\s+/g, '_')}` : 'debate_threads_default';
  const [debateData, setDebateData] = useState(() => {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) {
      try {
        const data = JSON.parse(s);
        // Ensure uniqueIds are present
        const ensureUniqueIds = (items) => {
          if (Array.isArray(items)) {
            items.forEach(item => {
              if (!item.uniqueId && item.id) {
                item.uniqueId = generateUniqueId(item.id[0]);
              }
              ensureUniqueIds(item.replies);
            });
          }
        };
        ensureUniqueIds(data.questions);
        return data;
      } catch (e) {
        return { topic: topic || 'Sanatan vs Islam', questions: [] };
      }
    }
    return { topic: topic || 'Sanatan vs Islam', questions: [] };
  });

  const [newTag, setNewTag] = useState('');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [drafts, setDrafts] = useState({});
  const [openForms, setOpenForms] = useState({});
  const [copied, setCopied] = useState({});
  const voteSet = useRef(new Set());


  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(debateData));
  }, [debateData, STORAGE_KEY]);


  const saveData = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(debateData));
  };

  const copyUniqueId = (id) => {
    navigator.clipboard.writeText(id).then(() => {
      setCopied(prev => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setCopied(prev => {
          const np = { ...prev };
          delete np[id];
          return np;
        });
      }, 2000);
    }).catch(err => console.error('Failed to copy: ', err));
  };

  const toggleForm = (id) => {
    setOpenForms(prev => ({ ...prev, [id]: !(prev[id] || false) }));
  };

  const addNewQuestion = () => {
    const text = newQuestionText.trim();
    const tag = newTag.trim();
    if (!text) return alert('Enter question');
    const newQ = {
      id: generateUniqueId('q'),
      text,
      tag,
      author: CURRENT_USER,
      timestamp: new Date().toLocaleString(),
      replies: [],
      votes: { up: 0, down: 0 },
      uniqueId: generateUniqueId('q')
    };
    setDebateData(prev => ({ ...prev, questions: [...prev.questions, newQ] }));
    setNewQuestionText('');
    setNewTag('');
    saveData();
  };

  const postReply = (parentId) => {
    const text = drafts[parentId] || '';
    if (!text.trim()) return alert('Enter reply');
    setDebateData(prev => {
      const newData = deepCopy(prev);
      // Find if parent is a question or a reply
      const parent = findPostById(parentId, newData.questions);
      if (!parent) return newData;
      // Always add the reply to the parent (question or answer)
      const newReply = {
        id: generateUniqueId('r'),
        text: text.trim(),
        author: CURRENT_USER,
        timestamp: new Date().toLocaleString(),
        votes: { up: 0, down: 0 },
        replies: [],
        uniqueId: generateUniqueId('r')
      };
      parent.replies = parent.replies || [];
      parent.replies.push(newReply);

      // If parent is a reply (not a top-level question), also copy it as a new question with the new reply as its answer
      const isTopLevel = newData.questions.some(q => q.id === parentId);
      if (!isTopLevel) {
        const promoted = {
          ...deepCopy(parent),
          id: generateUniqueId('q'),
          uniqueId: generateUniqueId('q'),
          tag: '',
          replies: [deepCopy(newReply)] // Only the new reply as answer
        };
        newData.questions.push(promoted);
      }
      return newData;
    });
    setDrafts(prev => ({ ...prev, [parentId]: '' }));
    setOpenForms(prev => ({ ...prev, [parentId]: false }));
    saveData();
  };

  const handleVote = (type, id) => {
    const key = id + '-' + CURRENT_USER;
    if (voteSet.current.has(key)) return alert('Already voted');
    setDebateData(prev => {
      const newData = deepCopy(prev);
      const target = findPostById(id, newData.questions);
      if (target) {
        target.votes = target.votes || { up: 0, down: 0 };
        target.votes[type]++;
      }
      return newData;
    });
    voteSet.current.add(key);
    saveData();
  };

  const buildReplyElements = (replies) => {
    const replyElements = [];
    const subRows = [];
    replies.forEach((r, i) => {
      r.replies = r.replies || [];
      if (!r.uniqueId) r.uniqueId = generateUniqueId('r'); // Fallback, though should be set
      const replyJSX = (
        <div key={`r-${r.id}`} className="reply-wrapper">
          <div className="meta">
            {escapeHtml(r.author || '')} replied • {escapeHtml(r.timestamp || '')} • 
            <span style={{ cursor: 'pointer' }} onClick={() => copyUniqueId(r.uniqueId)}>{r.uniqueId}</span> • {r.replies.length} Replies
            <span className="copy-msg" style={{ display: copied[r.uniqueId] ? 'inline' : 'none' }}>Copied</span>
          </div>
          <div className="content">{escapeHtml(r.text)}</div>
          <div className="controls">
            <button className="btn vote" onClick={() => handleVote('up', r.id)}>👍</button>
            <span className="vote-count">{r.votes?.up || 0}</span>
            <button className="btn vote" onClick={() => handleVote('down', r.id)}>👎</button>
            <span className="vote-count">{r.votes?.down || 0}</span>
            <button className="btn" onClick={() => toggleForm(r.id)}>Reply this Answer</button>
            <button className="btn" onClick={() => {
              navigator.clipboard.writeText(r.text || '');
              setCopied(prev => ({ ...prev, [r.id + '-copy']: true }));
              setTimeout(() => {
                setCopied(prev => {
                  const np = { ...prev };
                  delete np[r.id + '-copy'];
                  return np;
                });
              }, 2000);
            }}>Copy</button>
            <span className="copy-msg" style={{ display: copied[r.id + '-copy'] ? 'inline' : 'none', marginLeft: '4px' }}>Copied</span>
          </div>
          <div className="reply-form" style={{ display: openForms[r.id] ? 'block' : 'none' }}>
            <textarea
              placeholder="Reply..."
              value={drafts[r.id] || ''}
              onChange={(e) => setDrafts(prev => ({ ...prev, [r.id]: e.target.value }))}
            />
            <div className="evidence-row">
              <input type="file" className="evidence-file" />
              <input type="text" className="evidence-link" placeholder="Paste URL evidence (optional)" />
            </div>
            <button className="btn primary" onClick={() => postReply(r.id)} style={{ marginTop: '6px' }}>Post Reply</button>
          </div>
        </div>
      );
      replyElements.push(replyJSX);

      if (r.replies.length > 0) {
        const subLeftText = getLeftText(r, false);
        const subDisplay = subLeftText.includes(filterTag.toLowerCase()) ? 'grid' : 'none';
        const subLeftJSX = (
          <div className="left-card">
            <div className="meta">
              {escapeHtml(r.author || '')} replied • {escapeHtml(r.timestamp || '')} • 
              <span style={{ cursor: 'pointer' }} onClick={() => copyUniqueId(r.uniqueId)}>{r.uniqueId}</span> • {r.replies.length} Replies
              <span className="copy-msg" style={{ display: copied[r.uniqueId] ? 'inline' : 'none' }}>Copied</span>
            </div>
            <div className="content">{escapeHtml(r.text)}</div>
            <div className="controls">
              <button className="btn" onClick={() => toggleForm(r.id)}>Reply this question</button>
            </div>
            <div className="reply-form" id={`replyform-${r.id}`} style={{ display: openForms[r.id] ? 'block' : 'none' }}>
              <textarea
                placeholder="Reply..."
                value={drafts[r.id] || ''}
                onChange={(e) => setDrafts(prev => ({ ...prev, [r.id]: e.target.value }))}
              />
              <div className="evidence-row">
                <input type="file" className="evidence-file" />
                <input type="text" className="evidence-link" placeholder="Paste URL evidence (optional)" />
              </div>
              <button className="btn primary" onClick={() => postReply(r.id)} style={{ marginTop: '6px' }}>Post Reply</button>
            </div>
          </div>
        );
        const { replyElements: subReplyElements, subRows: subSubRows } = buildReplyElements(r.replies);
        const subRow = (
          <div key={`sub-${r.id}`} className="thread-row" style={{ display: subDisplay }}>
            <div className="left-cell">{subLeftJSX}</div>
            <div className="right-cell">
              <div className="right-card">{subReplyElements}</div>
            </div>
          </div>
        );
        subRows.push(subRow);
        subRows.push(...subSubRows);
      }

      if (i < replies.length - 1) {
        replyElements.push(<hr key={`hr-r-${i}`} className="reply-separator" />);
      }
    });
    return { replyElements, subRows };
  };

  const buildBoard = (questions) => {
    const elements = [];
    questions.forEach((q, qidx) => {
      q.replies = q.replies || [];
      q.votes = q.votes || { up: 0, down: 0 };
      if (!q.uniqueId) q.uniqueId = generateUniqueId('q');
      const leftText = getLeftText(q, true);
      const rowDisplay = leftText.includes(filterTag.toLowerCase()) ? 'grid' : 'none';
      const leftJSX = (
        <div className="left-card">
          <div className="meta">
            Question • {escapeHtml(q.author || '')} • {escapeHtml(q.timestamp || '')} • 
            <span style={{ cursor: 'pointer' }} onClick={() => copyUniqueId(q.uniqueId)}>{q.uniqueId}</span> • {q.replies.length} Replies
            <span className="tag">[ {escapeHtml(q.tag || '')} ]</span>
            <span className="copy-msg" style={{ display: copied[q.uniqueId] ? 'inline' : 'none' }}>Copied</span>
          </div>
          <div className="content">{escapeHtml(q.text)}</div>
          <div className="controls">
            <button className="btn" onClick={() => toggleForm(q.id)}>Reply this question</button>
          </div>
          <div className="reply-form" id={`replyform-${q.id}`} style={{ display: openForms[q.id] ? 'block' : 'none' }}>
            <textarea
              placeholder="Reply..."
              value={drafts[q.id] || ''}
              onChange={(e) => setDrafts(prev => ({ ...prev, [q.id]: e.target.value }))}
            />
            <div className="evidence-row">
              <input type="file" className="evidence-file" />
              <input type="text" className="evidence-link" placeholder="Paste URL evidence (optional)" />
            </div>
            <button className="btn primary" onClick={() => postReply(q.id)} style={{ marginTop: '6px' }}>Post Reply</button>
          </div>
        </div>
      );
      const { replyElements, subRows } = buildReplyElements(q.replies);
      const fullRow = (
        <div key={`q-${q.id}`} className="thread-row" data-tag={q.tag || ''} style={{ display: rowDisplay }}>
          <div className="left-cell">{leftJSX}</div>
          <div className="right-cell">
            <div className="right-card">{replyElements}</div>
          </div>
        </div>
      );
      elements.push(fullRow);
      elements.push(...subRows);
      if (qidx < questions.length - 1) {
        elements.push(<hr key={`hr-q-${qidx}`} />);
      }
    });
    return elements;
  };

  const boardContent = debateData.questions.length === 0 ? (
    <div style={{ color: '#666', margin: '10px' }}>
      <i>No questions yet. Add one below to start a debate!</i>
    </div>
  ) : (
    <>{buildBoard(debateData.questions)}</>
  );

  return (
    <>
      <style>{`
        body { font-family: Arial, sans-serif; background: #f4f6f9; margin: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .thread-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 12px; }
        .left-cell, .right-cell { min-height: 60px; }
        .left-card { background: #eef2ff; padding: 12px; border-radius: 8px; border: 1px solid #cbd5e1; }
        .right-card { background: #fff8ed; padding: 12px; border-radius: 8px; border: 1px solid #ffe5d4; }
        .meta { font-size: 12px; color: #6b7280; margin-bottom: 6px; }
        .content { font-size: 15px; line-height: 1.4; }
        .tag { font-size: 12px; color: #2563eb; font-weight: 500; margin-left: 4px; }
        .controls { margin-top: 8px; display: flex; gap: 8px; align-items: center; }
        .btn { padding: 5px 10px; border-radius: 6px; cursor: pointer; border: none; background: #eef2ff; color: #2563eb; }
        .btn.vote { background: #fff; border: 1px solid #e5e7eb; color: #374151; }
        .btn.primary { background: #2563eb; color: #fff; }
        .reply-form { display: none; margin-top: 8px; padding: 8px; border-radius: 6px; background: #fbfdff; border: 1px solid #eef2ff; }
        .reply-form textarea { width: 100%; min-height: 60px; padding: 6px; border-radius: 4px; border: 1px solid #d1d5db; }
        .reply-form input[type=file], .reply-form input[type=text] { margin-top: 4px; padding: 4px; width: 100%; }
        .add-question { margin-top: 20px; padding: 12px; border-radius: 8px; background: #f6fffa; border: 1px solid #ecfdf5; }
        .add-question input, .add-question textarea { width: 100%; padding: 6px; border-radius: 4px; border: 1px solid #d1d5db; margin-top: 6px; }
        .copy-msg { font-size: 11px; color: green; margin-left: 6px; }
        .highlight-reply { background: #fff7b2 !important; transition: background 0.5s; }
        hr.reply-separator { border: none; border-top: 1px solid #e5e7eb; margin: 10px 0; }
        .vote-count { margin: 0 4px; }
        .evidence-row { display: flex; gap: 8px; }
        .evidence-row input { flex: 1; }
      `}</style>
      <div className="container">
        <h2>Topic: {debateData.topic}</h2>
        <input
          id="tagSearch"
          placeholder="Search by tag"
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value)}
          style={{ marginBottom: '12px', padding: '6px', width: '300px', borderRadius: '4px', border: '1px solid #d1d5db' }}
        />
        <div id="board">{boardContent}</div>

        <div className="add-question">
          <h3>Add New Question</h3>
          <input id="newTag" placeholder="Tag" value={newTag} onChange={(e) => setNewTag(e.target.value)} />
          <textarea
            id="newQuestionText"
            placeholder="Type your question"
            value={newQuestionText}
            onChange={(e) => setNewQuestionText(e.target.value)}
          />
          <button className="btn primary" onClick={addNewQuestion} style={{ marginTop: '8px' }}>Add Question</button>
        </div>
      </div>
    </>
  );
};

export default App;
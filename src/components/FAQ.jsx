
// FAQ component styles are now modularized in styles/faq.css
import '../styles/faq.css';
import React, { useState } from 'react';

const FAQ_LIST = [
  {
    q: 'How do I add a new debate topic?',
    a: 'Go to the Home page and use the "Add Topic" form. Enter your topic in the format "X vs Y".'
  },
  {
    q: 'How do I participate in a debate?',
    a: 'Click on any debate topic to view and reply to questions and answers.'
  },
  {
    q: 'Can I report inappropriate content?',
    a: 'Yes, please use the Contact Us page to report any issues or inappropriate content.'
  },
  {
    q: 'How are replies organized?',
    a: 'Replies to answers can be promoted to new questions, creating a branching debate structure.'
  },
  {
    q: 'Is my data saved?',
    a: 'All debates and topics are saved in your browser local storage.'
  }
];

const FAQ = ({ onBack }) => {
  const [open, setOpen] = useState({});
  return (
    <div className="faq-container">
      <header className="header">
        <div className="brand">Debate Arena</div>
      </header>
      <div className="breadcrumb">Home &gt; FAQ</div>
      <div className="main-content">
        <div className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <ul className="faq-list">
            {FAQ_LIST.map((item, idx) => (
              <li key={idx} className="faq-item">
                <div className="faq-q" onClick={() => setOpen(o => ({ ...o, [idx]: !o[idx] }))}>
                  <span className="faq-toggle">{open[idx] ? '▼' : '▶'}</span> {item.q}
                </div>
                {open[idx] && <div className="faq-a">{item.a}</div>}
              </li>
            ))}
          </ul>
          <button className="add-btn" onClick={onBack}>Back</button>
        </div>
      </div>
    </div>
  );
};

export default FAQ;

// FAQ component styles are now modularized in styles/faq.css
import '../styles/faq.css';
import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/apiService.js';

const FAQ = () => {
  const [open, setOpen] = useState({});
  const [faqList, setFaqList] = useState([]);

  // Load FAQ from backend API
  useEffect(() => {
    // TODO: Fetch from backend when API is ready
    // For now, use default FAQ
    setFaqList([
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
        q: 'How many times i can vote a question or an answer?',
        a: 'One question or one answer can be voted only once.'
      }
    ]);

    // Uncomment when backend is ready:
    // adminAPI.getFAQ()
    //   .then(setFaqList)
    //   .catch(err => console.error('Failed to load FAQ:', err));
  }, []);

  return (
    <>
      <div className="breadcrumb">Home &gt; FAQ</div>
      <div className="faq-container content-card">
        <header className="header">
        </header>
        <div className="main-content">
          <div className="faq-section">
            <h2>Frequently Asked Questions</h2>
            <ul className="faq-list">
              {faqList.map((item, idx) => (
                <li key={idx} className="faq-item">
                  <div className="faq-q" onClick={() => setOpen(o => ({ ...o, [idx]: !o[idx] }))}>
                    <span className="faq-toggle">{open[idx] ? '▼' : '▶'}</span> {item.q}
                  </div>
                  {open[idx] && <div className="faq-a">{item.a}</div>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default FAQ;

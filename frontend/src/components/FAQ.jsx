// FAQ component styles are now modularized in styles/faq.css
import '../styles/faq.css';
import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/apiService.js';

const FAQ = ({ onBack }) => {
  const [open, setOpen] = useState({});
  const [faqList, setFaqList] = useState([]);

  // Default FAQ items
  const defaultFaqItems = [
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
      q: 'How many times can I vote a question or an answer?',
      a: 'One question or one answer can be voted only once.'
    }
  ];

  // Load FAQ from localStorage (synchronized with AdminDashboard)
  useEffect(() => {
    const storedFaq = localStorage.getItem('admin_faq_items');
    if (storedFaq) {
      try {
        const parsedFaq = JSON.parse(storedFaq);
        setFaqList(parsedFaq.length > 0 ? parsedFaq : defaultFaqItems);
      } catch (err) {
        console.error('Failed to parse FAQ from localStorage:', err);
        setFaqList(defaultFaqItems);
      }
    } else {
      setFaqList(defaultFaqItems);
    }
  }, []);

  return (
    <>
      <div className="breadcrumb" data-testid="faq-breadcrumb">Home &gt; FAQ</div>
      <div className="faq-container content-card" data-testid="faq-container">
        <header className="header" data-testid="faq-header">
          {onBack && <button className="btn" data-testid="faq-back-button" onClick={onBack}>Back</button>}
        </header>
        <div className="main-content" data-testid="faq-main-content">
          <div className="faq-section" data-testid="faq-section">
            <h2 data-testid="faq-heading">Frequently Asked Questions</h2>
            <ul className="faq-list" data-testid="faq-list">
              {faqList.map((item, idx) => (
                <li key={idx} className="faq-item" data-testid={`faq-item-${idx}`}>
                  <div className="faq-q" data-testid={`faq-question-${idx}`} onClick={() => setOpen(o => ({ ...o, [idx]: !o[idx] }))}>
                    <span className="faq-toggle" data-testid={`faq-toggle-${idx}`}>{open[idx] ? '▼' : '▶'}</span> <span data-testid={`faq-question-text-${idx}`}>{item.q}</span>
                  </div>
                  {open[idx] && <div className="faq-a" data-testid={`faq-answer-${idx}`}>{item.a}</div>}
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
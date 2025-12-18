// ContactUs component styles are now modularized in styles/contact.css
import '../styles/contact.css';
import React, { useState } from 'react';

const MESSAGES_KEY = 'contact_messages';

const ContactUs = ({ onBack }) => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Save message to localStorage for admin review
    const messages = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]');
    const newMessage = {
      ...formData,
      timestamp: new Date().toLocaleString()
    };
    messages.push(newMessage);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));

    // Clear form
    setFormData({ name: '', email: '', message: '' });
    alert('Thank you for contacting us! Your message has been received.');
  };

  return (
    <>
      <div className="breadcrumb">Home &gt; Contact Us</div>
      <div className="contact-container content-card">
        <header className="header">
          {onBack && <button className="btn" onClick={onBack}>Back</button>}
        </header>
        <div className="main-content">
          <div className="contact-section">
            <h2>Contact Us</h2>
            <p>For any queries, suggestions, or support, please email us at <a href="mailto:support@debatearena.com">support@debatearena.com</a> or fill out the form below:</p>
            <form className="contact-form" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Your Name"
                required
                className="contact-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <input
                type="email"
                placeholder="Your Email"
                required
                className="contact-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <textarea
                placeholder="Your Message"
                required
                className="contact-textarea"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
              <button className="add-btn" type="submit">Send</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactUs;

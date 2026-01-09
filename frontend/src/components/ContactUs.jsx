// ContactUs component styles are now modularized in styles/contact.css
import '../styles/contact.css';
import React, { useState } from 'react';
import { contactAPI } from '../services/apiService.js';

const ContactUs = ({ onBack }) => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Send message to backend API
      await contactAPI.send({
        name: formData.name,
        email: formData.email,
        subject: formData.subject || 'General Inquiry',
        message: formData.message
      });

      // Clear form
      setFormData({ name: '', email: '', subject: '', message: '' });
      alert('Thank you for contacting us! Your message has been received.');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
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
              <input
                type="text"
                placeholder="Subject (Optional)"
                className="contact-input"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
              <textarea
                placeholder="Your Message"
                required
                className="contact-textarea"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
              <button className="add-btn" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactUs;

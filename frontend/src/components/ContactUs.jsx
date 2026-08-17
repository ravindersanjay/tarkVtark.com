// ContactUs component styles are now modularized in styles/contact.css
import '../styles/contact.css';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
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
      toast.success('Thank you for contacting us! Your message has been received.');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="breadcrumb" data-testid="contact-breadcrumb">Home &gt; Contact Us</div>
      <div className="contact-container content-card" data-testid="contact-container">
        <header className="header" data-testid="contact-header">
          {onBack && <button className="btn" data-testid="contact-back-button" onClick={onBack}>Back</button>}
        </header>
        <div className="main-content" data-testid="contact-main-content">
          <div className="contact-section" data-testid="contact-section">
            <h2 data-testid="contact-heading">Contact Us</h2>
            <p data-testid="contact-description">For any queries, suggestions, or support, please email us at <a href="mailto:debateManch@gmailcom" data-testid="contact-email-link">debateManch@gmail.com</a> or fill out the form below:</p>
            <form className="contact-form" data-testid="contact-form" onSubmit={handleSubmit}>
              <input
                type="text"
                data-testid="contact-name-input"
                placeholder="Your Name"
                required
                className="contact-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <input
                type="email"
                data-testid="contact-email-input"
                placeholder="Your Email"
                required
                className="contact-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <input
                type="text"
                data-testid="contact-subject-input"
                placeholder="Subject (Optional)"
                className="contact-input"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
              <textarea
                data-testid="contact-message-textarea"
                placeholder="Your Message"
                required
                className="contact-textarea"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
              <button className="add-btn" type="submit" data-testid="contact-submit-button" disabled={isSubmitting}>
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
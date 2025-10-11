import React from 'react';

const ContactUs = ({ onBack }) => (
  <div className="contact-container">
    <header className="header">
      <div className="brand">Debate Arena</div>
      <nav className="nav">
        <button className="nav-btn" onClick={onBack}>Home</button>
      </nav>
    </header>
    <div className="breadcrumb">Home &gt; Contact Us</div>
    <div className="main-content">
      <div className="contact-section">
        <h2>Contact Us</h2>
        <p>For any queries, suggestions, or support, please email us at <a href="mailto:support@debatearena.com">support@debatearena.com</a> or fill out the form below:</p>
        <form className="contact-form" onSubmit={e => { e.preventDefault(); alert('Thank you for contacting us!'); }}>
          <input type="text" placeholder="Your Name" required className="contact-input" />
          <input type="email" placeholder="Your Email" required className="contact-input" />
          <textarea placeholder="Your Message" required className="contact-textarea" />
          <button className="add-btn" type="submit">Send</button>
        </form>
      </div>
    </div>
  </div>
);

export default ContactUs;

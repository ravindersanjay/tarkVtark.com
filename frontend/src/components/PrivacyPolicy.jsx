import React from 'react';

/**
 * PrivacyPolicy Component
 *
 * Displays the privacy policy for the tarkVtark debate platform.
 * This helps build trust with users by being transparent about data collection and usage.
 */
const PrivacyPolicy = ({ onBack }) => {
  return (
    <div className="page-container" data-testid="privacy-policy-container">
      <div className="content-wrapper" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px' }} data-testid="privacy-policy-content">
        {onBack && <button className="btn" data-testid="privacy-back-button" onClick={onBack}>Back</button>}
        <h1 data-testid="privacy-policy-title">Privacy Policy</h1>
        <p className="last-updated" data-testid="privacy-policy-last-updated">Last Updated: August 16, 2026</p>

        <section className="policy-section" data-testid="privacy-section-1">
          <h2 data-testid="privacy-section-1-title">1. Information We Collect</h2>
          <p data-testid="privacy-section-1-desc">We collect information you provide directly to us, such as when you create an account, participate in debates, or contact us. This may include:</p>
          <ul data-testid="privacy-section-1-list">
            <li data-testid="privacy-section-1-item-1"><strong>Account Information:</strong> Name, email address, and profile picture (if you choose to provide one)</li>
            <li data-testid="privacy-section-1-item-2"><strong>Content:</strong> Questions, replies, and comments you post on debates</li>
            <li data-testid="privacy-section-1-item-3"><strong>Voting Data:</strong> Your votes on questions and replies</li>
            <li data-testid="privacy-section-1-item-4"><strong>Evidence Files:</strong> Any files or URLs you attach as evidence to your posts</li>
          </ul>
        </section>

        <section className="policy-section" data-testid="privacy-section-2">
          <h2 data-testid="privacy-section-2-title">2. How We Use Your Information</h2>
          <p data-testid="privacy-section-2-desc">We use the information we collect to:</p>
          <ul data-testid="privacy-section-2-list">
            <li data-testid="privacy-section-2-item-1">Provide, maintain, and improve our debate platform</li>
            <li data-testid="privacy-section-2-item-2">Process and display your contributions in debates</li>
            <li data-testid="privacy-section-2-item-3">Enable user authentication and account management</li>
            <li data-testid="privacy-section-2-item-4">Send you important updates about your account or our service</li>
            <li data-testid="privacy-section-2-item-5">Analyze usage patterns to improve user experience</li>
            <li data-testid="privacy-section-2-item-6">Prevent fraud and ensure platform security</li>
          </ul>
        </section>

        <section className="policy-section" data-testid="privacy-section-3">
          <h2 data-testid="privacy-section-3-title">3. Information Sharing</h2>
          <p data-testid="privacy-section-3-desc">We do not sell your personal information. We may share your information only in the following circumstances:</p>
          <ul data-testid="privacy-section-3-list">
            <li data-testid="privacy-section-3-item-1"><strong>Public Content:</strong> Your debate contributions (questions, replies, votes) are publicly visible on the platform</li>
            <li data-testid="privacy-section-3-item-2"><strong>Service Providers:</strong> With trusted third-party service providers who assist us in operating our platform</li>
            <li data-testid="privacy-section-3-item-3"><strong>Legal Requirements:</strong> When required by law or to protect our rights, property, or safety</li>
            <li data-testid="privacy-section-3-item-4"><strong>Business Transfers:</strong> In connection with any merger, sale of company assets, or acquisition</li>
          </ul>
        </section>

        <section className="policy-section" data-testid="privacy-section-4">
          <h2 data-testid="privacy-section-4-title">4. Data Security</h2>
          <p data-testid="privacy-section-4-desc">We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
        </section>

        <section className="policy-section" data-testid="privacy-section-5">
          <h2 data-testid="privacy-section-5-title">5. Your Rights</h2>
          <p data-testid="privacy-section-5-desc">You have the right to:</p>
          <ul data-testid="privacy-section-5-list">
            <li data-testid="privacy-section-5-item-1">Access your personal information</li>
            <li data-testid="privacy-section-5-item-2">Correct inaccurate information</li>
            <li data-testid="privacy-section-5-item-3">Request deletion of your personal information</li>
            <li data-testid="privacy-section-5-item-4">Opt-out of certain data collection and processing</li>
            <li data-testid="privacy-section-5-item-5">Withdraw consent at any time where consent is the legal basis for processing</li>
          </ul>
          <p data-testid="privacy-section-5-contact">To exercise these rights, please contact us through our Contact Us page.</p>
        </section>

        <section className="policy-section" data-testid="privacy-section-6">
          <h2 data-testid="privacy-section-6-title">6. Third-Party Services</h2>
          <p data-testid="privacy-section-6-desc">Our platform uses third-party services, including:</p>
          <ul data-testid="privacy-section-6-list">
            <li data-testid="privacy-section-6-item-1"><strong>Google OAuth:</strong> For user authentication. Their privacy policy applies to your use of their service.</li>
            <li data-testid="privacy-section-6-item-2"><strong>Cloud Storage:</strong> For storing evidence files and attachments. These services have their own privacy policies.</li>
          </ul>
        </section>

        <section className="policy-section" data-testid="privacy-section-7">
          <h2 data-testid="privacy-section-7-title">7. Cookies and Tracking</h2>
          <p data-testid="privacy-section-7-desc">We use cookies and similar technologies to:</p>
          <ul data-testid="privacy-section-7-list">
            <li data-testid="privacy-section-7-item-1">Keep you logged in to your account</li>
            <li data-testid="privacy-section-7-item-2">Remember your preferences</li>
            <li data-testid="privacy-section-7-item-3">Analyze platform usage and performance</li>
          </ul>
          <p data-testid="privacy-section-7-note">You can control cookies through your browser settings, but disabling cookies may affect your ability to use certain features of our platform.</p>
        </section>

        <section className="policy-section" data-testid="privacy-section-8">
          <h2 data-testid="privacy-section-8-title">8. Children's Privacy</h2>
          <p data-testid="privacy-section-8-desc">Our platform is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it.</p>
        </section>

        <section className="policy-section" data-testid="privacy-section-9">
          <h2 data-testid="privacy-section-9-title">9. Changes to This Privacy Policy</h2>
          <p data-testid="privacy-section-9-desc">We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" date.</p>
        </section>

        <section className="policy-section" data-testid="privacy-section-10">
          <h2 data-testid="privacy-section-10-title">10. Contact Us</h2>
          <p data-testid="privacy-section-10-desc">If you have any questions about this privacy policy or our data practices, please contact us through our Contact Us page.</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

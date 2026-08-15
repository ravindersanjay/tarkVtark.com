import React from 'react';

/**
 * PrivacyPolicy Component
 *
 * Displays the privacy policy for the tarkVtark debate platform.
 * This helps build trust with users by being transparent about data collection and usage.
 */
const PrivacyPolicy = () => {
  return (
    <div className="page-container">
      <div className="content-wrapper" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px' }}>
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last Updated: August 16, 2026</p>

        <section className="policy-section">
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create an account, participate in debates, or contact us. This may include:</p>
          <ul>
            <li><strong>Account Information:</strong> Name, email address, and profile picture (if you choose to provide one)</li>
            <li><strong>Content:</strong> Questions, replies, and comments you post on debates</li>
            <li><strong>Voting Data:</strong> Your votes on questions and replies</li>
            <li><strong>Evidence Files:</strong> Any files or URLs you attach as evidence to your posts</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our debate platform</li>
            <li>Process and display your contributions in debates</li>
            <li>Enable user authentication and account management</li>
            <li>Send you important updates about your account or our service</li>
            <li>Analyze usage patterns to improve user experience</li>
            <li>Prevent fraud and ensure platform security</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>3. Information Sharing</h2>
          <p>We do not sell your personal information. We may share your information only in the following circumstances:</p>
          <ul>
            <li><strong>Public Content:</strong> Your debate contributions (questions, replies, votes) are publicly visible on the platform</li>
            <li><strong>Service Providers:</strong> With trusted third-party service providers who assist us in operating our platform</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights, property, or safety</li>
            <li><strong>Business Transfers:</strong> In connection with any merger, sale of company assets, or acquisition</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>4. Data Security</h2>
          <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
        </section>

        <section className="policy-section">
          <h2>5. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your personal information</li>
            <li>Opt-out of certain data collection and processing</li>
            <li>Withdraw consent at any time where consent is the legal basis for processing</li>
          </ul>
          <p>To exercise these rights, please contact us through our Contact Us page.</p>
        </section>

        <section className="policy-section">
          <h2>6. Third-Party Services</h2>
          <p>Our platform uses third-party services, including:</p>
          <ul>
            <li><strong>Google OAuth:</strong> For user authentication. Their privacy policy applies to your use of their service.</li>
            <li><strong>Cloud Storage:</strong> For storing evidence files and attachments. These services have their own privacy policies.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>7. Cookies and Tracking</h2>
          <p>We use cookies and similar technologies to:</p>
          <ul>
            <li>Keep you logged in to your account</li>
            <li>Remember your preferences</li>
            <li>Analyze platform usage and performance</li>
          </ul>
          <p>You can control cookies through your browser settings, but disabling cookies may affect your ability to use certain features of our platform.</p>
        </section>

        <section className="policy-section">
          <h2>8. Children's Privacy</h2>
          <p>Our platform is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it.</p>
        </section>

        <section className="policy-section">
          <h2>9. Changes to This Privacy Policy</h2>
          <p>We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" date.</p>
        </section>

        <section className="policy-section">
          <h2>10. Contact Us</h2>
          <p>If you have any questions about this privacy policy or our data practices, please contact us through our Contact Us page.</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

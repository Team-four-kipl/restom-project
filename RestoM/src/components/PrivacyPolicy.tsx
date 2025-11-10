import React from 'react';
import { FaShieldAlt } from 'react-icons/fa';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="container py-5" style={{ background: 'linear-gradient(to bottom, #fffaf4, #fff3e0)', minHeight: '100vh' }}>
      <div className="row justify-content-center">
        <div className="col-md-10 col-lg-8">
          {/* Header */}
          <div className="text-center mb-5">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
              style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #FF6A00, #FF9900)',
                color: 'white'
              }}
            >
              <FaShieldAlt size={36} />
            </div>
            <h1 className="display-5 fw-bold mb-4" style={{
              background: 'linear-gradient(90deg, #FF6A00, #FF9900)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Privacy Policy
            </h1>
            <p className="lead text-muted">
              Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
            </p>
          </div>

          {/* Last Updated */}
          <div className="text-center mb-5">
            <p className="text-muted">Last updated: December 2024</p>
          </div>

          {/* Policy Sections */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3">1. Information We Collect</h5>
              <p>We collect information you provide directly to us, such as when you create an account, place an order, or contact us. This may include your name, email address, phone number, delivery address, and payment information.</p>
              <p>We also collect information automatically when you use our services, such as your IP address, device type, browser type, and usage data.</p>
            </div>
          </div>

          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3">2. How We Use Your Information</h5>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your orders and our services</li>
                <li>Improve our services and personalize your experience</li>
                <li>Process payments and prevent fraudulent transactions</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>
          </div>

          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3">3. How We Share Your Information</h5>
              <p>We may share your information with third parties in the following circumstances:</p>
              <ul>
                <li>With service providers who assist us in operating our business (e.g., payment processors, delivery partners)</li>
                <li>To comply with legal requirements or respond to lawful requests</li>
                <li>To protect our rights, property, or safety, or the rights, property, or safety of others</li>
                <li>In connection with a merger, sale, or acquisition of all or part of our business</li>
              </ul>
              <p>We do not sell your personal information to third parties for their marketing purposes.</p>
            </div>
          </div>

          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3">4. Data Security</h5>
              <p>We implement reasonable security measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure.</p>
            </div>
          </div>

          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3">5. Your Choices</h5>
              <p>You can access, update, or delete your personal information by contacting us. You may also opt out of receiving promotional communications from us.</p>
            </div>
          </div>

          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3">6. Contact Us</h5>
              <p>If you have any questions about this Privacy Policy, please contact us at:</p>
              <p className="mb-0">Email: info@kavyainfoweb.com</p>
              <p>Phone: +91 8600346599</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
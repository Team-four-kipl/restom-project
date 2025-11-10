import React from 'react'

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="container py-5" style={{ backgroundColor: 'var(--background-color)', minHeight: '100vh' }}>
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-primary text-white">
              <h1 className="h3 mb-0">Privacy Policy</h1>
            </div>
            <div className="card-body p-4">
              <div className="mb-4">
                <h5>1. Information We Collect</h5>
                <p>We collect information you provide directly to us, such as when you create an account, make an order, or contact us for support.</p>
              </div>

              <div className="mb-4">
                <h5>2. How We Use Your Information</h5>
                <p>We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.</p>
              </div>

              <div className="mb-4">
                <h5>3. Information Sharing</h5>
                <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>
              </div>

              <div className="mb-4">
                <h5>4. Data Security</h5>
                <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
              </div>

              <div className="mb-4">
                <h5>5. Contact Us</h5>
                <p>If you have any questions about this Privacy Policy, please contact us at info@kavyainfoweb.com</p>
              </div>

              <div className="text-muted small">
                <p>Last updated: November 2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy
import React, { useState } from 'react'
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaPhone, FaArrowLeft } from 'react-icons/fa'

interface SignupProps {
  onClose: () => void
  onSwitchToLogin: () => void
  onSignup: (userData: { name: string; email: string; phone: string; password: string }) => void
}

interface OTPVerificationProps {
  email: string
  onVerify: (otp: string) => void
  onResend: () => void
  onBack: () => void
}

const OTPVerification: React.FC<OTPVerificationProps> = ({ email, onVerify, onResend, onBack }) => {
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(30)
  const [canResend, setCanResend] = useState(false)

  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [resendTimer])

  const handleVerify = async () => {
    if (otp.length !== 6) return

    setIsLoading(true)
    setTimeout(() => {
      onVerify(otp)
      setIsLoading(false)
    }, 1000)
  }

  const handleResend = () => {
    onResend()
    setResendTimer(30)
    setCanResend(false)
  }

  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px' }}>
          <div className="modal-header border-0 pb-0">
            <button
              type="button"
              className="btn btn-link text-dark border-0 p-0 me-3"
              onClick={onBack}
              style={{ fontSize: '18px' }}
            >
              <FaArrowLeft />
            </button>
            <button
              type="button"
              className="btn-close ms-auto"
              onClick={() => {}}
              style={{ fontSize: '14px' }}
            ></button>
          </div>

          <div className="modal-body px-4 pb-4">
            <div className="text-center mb-4">
              <img
                src="/assets/images/Logo.png"
                alt="Logo"
                style={{
                  width: '120px',
                  height: '40px',
                  objectFit: 'contain',
                }}
              />
            </div>

            <h4 className="text-center fw-bold mb-3" style={{ color: '#333' }}>
              Verify Your Email
            </h4>

            <p className="text-center text-muted mb-4" style={{ fontSize: '14px', lineHeight: '1.5' }}>
              We've sent a 6-digit verification code to<br />
              <strong>{email}</strong>
            </p>

            <div className="mb-4">
              <label className="form-label fw-semibold text-center d-block" style={{ color: '#555' }}>
                Enter Verification Code
              </label>
              <div className="d-flex justify-content-center gap-2">
                {[...Array(6)].map((_, index) => (
                  <input
                    key={index}
                    type="text"
                    className="form-control text-center fw-bold"
                    style={{
                      width: '45px',
                      height: '50px',
                      fontSize: '20px',
                      borderRadius: '8px',
                      border: '2px solid #FF6A00',
                      backgroundColor: '#f8f9fa'
                    }}
                    maxLength={1}
                    value={otp[index] || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '')
                      if (value) {
                        const newOtp = otp.split('')
                        newOtp[index] = value
                        setOtp(newOtp.join(''))
                        // Auto-focus next input
                        if (index < 5 && e.target.nextElementSibling) {
                          (e.target.nextElementSibling as HTMLInputElement).focus()
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !otp[index] && index > 0) {
                        const newOtp = otp.split('')
                        newOtp[index - 1] = ''
                        setOtp(newOtp.join(''))
                        // Focus previous input
                        const target = e.target as HTMLInputElement
                        if (target.previousElementSibling) {
                          (target.previousElementSibling as HTMLInputElement).focus()
                        }
                      }
                    }}
                  />
                ))}
              </div>
            </div>

            <button
              className="btn w-100 text-white fw-semibold py-3 mb-3"
              disabled={isLoading || otp.length !== 6}
              onClick={handleVerify}
              style={{
                background: 'linear-gradient(90deg, #FFA500, #FF6B00)',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px'
              }}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Verifying...
                </>
              ) : (
                'Verify & Complete Signup'
              )}
            </button>

            <div className="text-center">
              <span className="text-muted" style={{ fontSize: '14px' }}>
                Didn't receive the code?{' '}
                {canResend ? (
                  <button
                    className="btn btn-link text-decoration-none p-0 fw-semibold"
                    onClick={handleResend}
                    style={{ color: '#FF6A00', fontSize: '14px' }}
                  >
                    Resend Code
                  </button>
                ) : (
                  <span style={{ color: '#FF6A00', fontSize: '14px' }}>
                    Resend in {resendTimer}s
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const Signup: React.FC<SignupProps> = ({ onClose, onSwitchToLogin, onSignup }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [showOTPVerification, setShowOTPVerification] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    // Simulate API call for sending OTP
    setTimeout(() => {
      setIsLoading(false)
      setShowOTPVerification(true)
    }, 1000)
  }

  const handleOTPVerify = (otp: string) => {
    // TODO: Implement OTP verification logic
    console.log('OTP Verified:', otp)
    onSignup({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password
    })
  }

  const handleOTPResend = () => {
    // TODO: Implement OTP resend logic
    console.log('OTP Resent to:', formData.email)
  }

  const handleOTPBack = () => {
    setShowOTPVerification(false)
  }

  if (showOTPVerification) {
    return (
      <OTPVerification
        email={formData.email}
        onVerify={handleOTPVerify}
        onResend={handleOTPResend}
        onBack={handleOTPBack}
      />
    )
  }

  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px' }}>
          <div className="modal-header border-0 pb-0">
            <button
              type="button"
              className="btn-close ms-auto"
              onClick={onClose}
              style={{ fontSize: '14px' }}
            ></button>
          </div>

          <div className="modal-body px-4 pb-4">
            {/* Logo */}
            <div className="text-center mb-4">
              <img
                src="/assets/images/Logo.png"
                alt="Logo"
                style={{
                  width: '150px',
                  height: '50px',
                  objectFit: 'contain',
                }}
              />
            </div>

            <h4 className="text-center fw-bold mb-4" style={{ color: '#333' }}>
              Create Account
            </h4>

            <form onSubmit={handleSubmit}>
              {/* Name Field */}
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ color: '#555' }}>
                  Full Name
                </label>
                <div className="input-group">
                  <span className="input-group-text border-end-0" style={{ backgroundColor: '#f8f9fa' }}>
                    <FaUser style={{ color: '#FF6A00' }} />
                  </span>
                  <input
                    type="text"
                    name="name"
                    className={`form-control border-start-0 ps-0 ${errors.name ? 'is-invalid' : ''}`}
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    style={{
                      borderRadius: '0 8px 8px 0',
                      borderLeft: 'none',
                      padding: '12px 16px'
                    }}
                  />
                </div>
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              </div>

              {/* Email Field */}
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ color: '#555' }}>
                  Email Address
                </label>
                <div className="input-group">
                  <span className="input-group-text border-end-0" style={{ backgroundColor: '#f8f9fa' }}>
                    <FaEnvelope style={{ color: '#FF6A00' }} />
                  </span>
                  <input
                    type="email"
                    name="email"
                    className={`form-control border-start-0 ps-0 ${errors.email ? 'is-invalid' : ''}`}
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    style={{
                      borderRadius: '0 8px 8px 0',
                      borderLeft: 'none',
                      padding: '12px 16px'
                    }}
                  />
                </div>
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>

              {/* Phone Field */}
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ color: '#555' }}>
                  Phone Number
                </label>
                <div className="input-group">
                  <span className="input-group-text border-end-0" style={{ backgroundColor: '#f8f9fa' }}>
                    <FaPhone style={{ color: '#FF6A00' }} />
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    className={`form-control border-start-0 ps-0 ${errors.phone ? 'is-invalid' : ''}`}
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    style={{
                      borderRadius: '0 8px 8px 0',
                      borderLeft: 'none',
                      padding: '12px 16px'
                    }}
                  />
                </div>
                {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
              </div>

              {/* Password Field */}
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ color: '#555' }}>
                  Password
                </label>
                <div className="input-group">
                  <span className="input-group-text border-end-0" style={{ backgroundColor: '#f8f9fa' }}>
                    <FaLock style={{ color: '#FF6A00' }} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className={`form-control border-start-0 border-end-0 ps-0 ${errors.password ? 'is-invalid' : ''}`}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    style={{
                      borderLeft: 'none',
                      borderRight: 'none',
                      padding: '12px 16px'
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary border-start-0"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      borderRadius: '0 8px 8px 0',
                      borderLeft: 'none'
                    }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
              </div>

              {/* Confirm Password Field */}
              <div className="mb-4">
                <label className="form-label fw-semibold" style={{ color: '#555' }}>
                  Confirm Password
                </label>
                <div className="input-group">
                  <span className="input-group-text border-end-0" style={{ backgroundColor: '#f8f9fa' }}>
                    <FaLock style={{ color: '#FF6A00' }} />
                  </span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    className={`form-control border-start-0 border-end-0 ps-0 ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    style={{
                      borderLeft: 'none',
                      borderRight: 'none',
                      padding: '12px 16px'
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary border-start-0"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      borderRadius: '0 8px 8px 0',
                      borderLeft: 'none'
                    }}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
              </div>

              {/* Signup Button */}
              <button
                type="submit"
                className="btn w-100 text-white fw-semibold py-3 mb-3"
                disabled={isLoading}
                style={{
                  background: 'linear-gradient(90deg, #FFA500, #FF6B00)',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px'
                }}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>

              {/* Divider */}
              <div className="text-center mb-3">
                <span style={{ color: '#999', fontSize: '14px' }}>Already have an account?</span>
              </div>

              {/* Switch to Login */}
              <button
                type="button"
                className="btn btn-outline-secondary w-100 fw-semibold py-2"
                onClick={onSwitchToLogin}
                style={{
                  borderRadius: '12px',
                  borderColor: '#FF6A00',
                  color: '#FF6A00'
                }}
              >
                Sign In Instead
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup
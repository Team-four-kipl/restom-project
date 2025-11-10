import mongoose from 'mongoose'

// We store either plaintext `otp` for legacy/dev records or `otpHash` for hashed OTPs.
// New records will store `otpHash` only.
const OtpSchema: any = new mongoose.Schema({
  phone: { type: String, required: true, index: true },
  otp: { type: String },
  otpHash: { type: String },
  expiresAt: { type: Date, required: true, index: true },
  attempts: { type: Number, default: 0 }
})

OtpSchema.index({ phone: 1, expiresAt: 1 })

export default mongoose.model('Otp', OtpSchema)

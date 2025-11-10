import OtpModel from '../models/Otp'
import UserModel from '../models/User'
const crypto: any = require('crypto')
const axios: any = require('axios')
const jwt: any = require('jsonwebtoken')
const bcrypt: any = require('bcrypt')
const util = require('util')
const scrypt = util.promisify(crypto.scrypt)

const OTP_EXPIRY_SECONDS: number = parseInt(process.env.OTP_EXPIRY_SECONDS || '90', 10)
const OTP_ATTEMPT_LIMIT: number = parseInt(process.env.OTP_ATTEMPT_LIMIT || '5', 10)

function generateNumericOtp(digits = 6) {
  const max = 10 ** digits
  const num = Math.floor(Math.random() * max)
  return num.toString().padStart(digits, '0')
}

async function hashOtp(otp: string) {
  // use scrypt for hashing OTPs with a random salt
  const salt = crypto.randomBytes(8).toString('hex')
  const derived = await scrypt(otp, salt, 64)
  return salt + ':' + Buffer.from(derived).toString('hex')
}

async function verifyOtpHash(otp: string, storedHash: string) {
  if (!storedHash) return false
  const [salt, keyHex] = storedHash.split(':')
  if (!salt || !keyHex) return false
  const derived = await scrypt(otp, salt, 64)
  return Buffer.from(derived).toString('hex') === keyHex
}

async function sendSmsViaFast2Sms(phone: string, message: string) {
  const apiKey = process.env.FAST2SMS_API_KEY
  // Dev fallback: if no API key configured or it's clearly a placeholder, log the message and return success for testing
  if (!apiKey || apiKey.startsWith('replace') || apiKey === 'YOUR_FAST2SMS_KEY') {
    console.log(`DEV SMS to ${phone}: ${message}`)
    return { success: true, dev: true }
  }

  // Fast2SMS HTTP API
  const url = 'https://www.fast2sms.com/dev/bulkV2'
  const payload = {
    route: 'v3',
    sender_id: 'FSTSMS',
    message: message,
    numbers: phone
  }
  try {
    const resp = await axios.post(url, payload, {
      headers: { Authorization: apiKey, 'Content-Type': 'application/json' }
    })
    return resp.data
  } catch (e: any) {
    console.error('Fast2SMS send error, falling back to dev log:', e && e.message ? e.message : e)
    console.log(`DEV SMS to ${phone}: ${message}`)
    return { success: false, dev: true, error: e && e.message }
  }
}

export const sendOtp = async (req: any, res: any) => {
  try {
    console.log('sendOtp called with body:', req.body)
    const { phone, digits } = req.body
    if (!phone) return res.status(400).json({ error: 'phone is required' })

    const otp = generateNumericOtp(digits || 6)
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_SECONDS * 1000)

    // Hash OTP and store only the hash for new records
    const otpHash = await hashOtp(otp)
    await OtpModel.findOneAndUpdate({ phone }, { otpHash, expiresAt, attempts: 0, $unset: { otp: '' } }, { upsert: true })

    const message = `Your verification code is ${otp}. It will expire in ${OTP_EXPIRY_SECONDS} seconds.`
    // Send SMS (may throw)
    try {
      const smsResp: any = await sendSmsViaFast2Sms(phone, message)
      // If dev fallback, return OTP in response so automated tests can use it
      if (smsResp && smsResp.dev) {
        // In dev mode we log OTP for debugging but do NOT return it in the response
        console.log(`DEV OTP for ${phone}: ${otp}`)
        return res.json({ success: true, message: 'OTP sent (dev)' })
      }
    } catch (smsErr: any) {
      console.error('SMS send error', smsErr.message || smsErr)
      return res.status(500).json({ error: 'Failed to send SMS', details: smsErr.message })
    }

    return res.json({ success: true, message: 'OTP sent' })
  } catch (err: any) {
    console.error(err)
    return res.status(500).json({ error: err.message || 'server error' })
  }
}

export const verifyOtp = async (req: any, res: any) => {
  try {
    const { phone, otp } = req.body
    if (!phone || !otp) return res.status(400).json({ error: 'phone and otp required' })

    const record = await OtpModel.findOne({ phone })
    if (!record) return res.status(400).json({ error: 'No OTP requested for this number' })

    if (record.attempts >= OTP_ATTEMPT_LIMIT) {
      return res.status(429).json({ error: 'Too many attempts' })
    }

    if (record.expiresAt < new Date()) {
      return res.status(400).json({ error: 'OTP expired' })
    }

    // Support legacy records that may have stored plaintext otp OR new hashed otpHash
    let match = false
    if (record.otp) {
      match = record.otp === otp
    } else if (record.otpHash) {
      match = await verifyOtpHash(otp, record.otpHash)
    }

    if (!match) {
      record.attempts += 1
      await record.save()
      if (record.attempts >= OTP_ATTEMPT_LIMIT) return res.status(429).json({ error: 'Too many attempts' })
      return res.status(400).json({ error: 'Wrong OTP' })
    }

    // OTP valid: remove OTP record and return success; signup will create the user record
    await OtpModel.deleteOne({ phone })
    return res.json({ success: true, phone })
  } catch (err: any) {
    console.error(err)
    return res.status(500).json({ error: err.message || 'server error' })
  }
}

// Cleanup expired OTPs — can be scheduled by server
export async function cleanupExpiredOtps() {
  try {
    const now = new Date()
    const r = await OtpModel.deleteMany({ expiresAt: { $lt: now } })
    if (r && r.deletedCount) console.log(`cleanupExpiredOtps removed ${r.deletedCount} expired otps`)
  } catch (e: any) {
    console.error('cleanupExpiredOtps error', e.message || e)
  }
}

export const signup = async (req: any, res: any) => {
  try {
    const { name, email, phone, password } = req.body
    if (!name || !email || !phone || !password) return res.status(400).json({ error: 'missing fields' })

    const existing = await UserModel.findOne({ $or: [{ email }, { phone }] })
    if (existing) return res.status(400).json({ error: 'User already exists' })

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await UserModel.create({ name, email, phone, passwordHash })

    const token = jwt.sign({ id: user._id, phone: user.phone }, process.env.JWT_SECRET || 'secret', { expiresIn: '12h' })

    return res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone } })
  } catch (err: any) {
    console.error(err)
    return res.status(500).json({ error: err.message || 'server error' })
  }
}

export const login = async (req: any, res: any) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'email and password required' })

    const user = await UserModel.findOne({ email })
    if (!user) return res.status(400).json({ error: 'Invalid credentials' })

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' })

    const token = jwt.sign({ id: user._id, phone: user.phone }, process.env.JWT_SECRET || 'secret', { expiresIn: '12h' })
    return res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone } })
  } catch (err: any) {
    console.error(err)
    return res.status(500).json({ error: err.message || 'server error' })
  }
}


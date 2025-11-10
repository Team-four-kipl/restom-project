import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import authRoutes from './routes/auth.js'
import restaurantRoutes from './routes/restaurants.js'
import menuRoutes from './routes/menus.js'
import orderRoutes from './routes/orders.js'
import paymentRoutes from './routes/payments.js'
import bodyParser from 'body-parser'
import rateLimit from 'express-rate-limit'
import { cleanupExpiredOtps } from './controllers/authController.js'
// removed socket/http for now to keep server stable

// Make rate limit configurable; default to 60 requests per minute in dev
const AUTH_RATE_LIMIT_MAX = parseInt(process.env.AUTH_RATE_LIMIT_MAX || '60', 10)
// Use keyGenerator to rate limit by phone when present to better protect OTP abuse
const authLimiter = rateLimit({ windowMs: 60 * 1000, max: AUTH_RATE_LIMIT_MAX, message: { error: 'Too many requests, try later' }, keyGenerator: (req: any) => { return req.body && req.body.phone ? req.body.phone : req.ip } })

const app = express()
// We'll create an http server later in index.ts and attach Socket.IO

// allow the frontend dev server and useful tools; adjust for production
// In dev ease debugging by allowing any origin. In production lock this down.
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'
if (process.env.NODE_ENV === 'production') {
  app.use(cors({ origin: FRONTEND_ORIGIN }))
} else {
  app.use(cors({ origin: true }))
}

// Simple request logger to help debug proxy / CORS / routing issues
app.use((req: any, res: any, next: any) => {
  try {
    console.log(`[REQ] ${new Date().toISOString()} ${req.method} ${req.url} from ${req.ip}`)
    // Verbose logging for debugging can be enabled with DEV_VERBOSE_LOG=true
    if (process.env.DEV_VERBOSE_LOG === 'true') {
      console.log('Headers:', req.headers)
      // clone body safely if JSON parsed
      try { console.log('Body:', req.body) } catch (e) { }
    }
  } catch (e) { }
  next()
})
// We need JSON body parser for most routes
// We use express.json globally, but for payment webhooks that require HMAC of raw payload
// we'll mount an express.raw parser on the payments webhook path inside the payments router.
app.use(express.json())

// Payments routes (webhook handled inside router)
// Mount a raw body parser for the payments webhook path so HMAC verification can use raw payload.
// This will only apply to routes under /api/payments/webhook
app.use('/api/payments/webhook', bodyParser.raw({ type: '*/*' }))
// Routes
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/restaurants', restaurantRoutes)
app.use('/api/menus', menuRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/payments', paymentRoutes)

// DEV-only: expose last OTP for a phone when explicitly enabled by env var
// DEV-only: expose last OTP for a phone when explicitly enabled by env var
if (process.env.DEV_ALLOW_OTP_FETCH === 'true') {
  // lazy require to avoid pulling model in production bundle unnecessarily
  const OtpModel = require('./models/Otp').default
  // Require both DEV_ALLOW_OTP_FETCH=true and a matching DEV_OTP_SECRET for access
  app.get('/dev/last-otp', async (req: any, res: any) => {
    try {
      const secret = req.headers['x-dev-otp-secret'] || req.query.secret
      if (!process.env.DEV_OTP_SECRET || !secret || secret !== process.env.DEV_OTP_SECRET) {
        console.log('[DEV_OTP] unauthorized access attempt from', req.ip)
        return res.status(401).json({ error: 'unauthorized' })
      }
      const phone = req.query.phone as string
      if (!phone) return res.status(400).json({ error: 'phone is required' })
      const rec = await OtpModel.findOne({ phone }).sort({ expiresAt: -1 }).lean()
      if (!rec) return res.status(404).json({ error: 'no otp found' })
      // do not expose otpHash; include plaintext otp if present (legacy/dev)
      return res.json({ otp: rec.otp || null, expiresAt: rec.expiresAt })
    } catch (e: any) {
      return res.status(500).json({ error: e.message })
    }
  })
} else {
  // If disabled, return 404 for the endpoint to avoid accidental exposure
  app.get('/dev/last-otp', (_req: any, res: any) => res.status(404).json({ error: 'not found' }))
}

// Lightweight health-check endpoint
app.get('/api/health', (_req: any, res: any) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'development' })
})

// Informational root route so visiting backend root doesn't return 'Cannot GET /'
app.get('/', (_req: any, res: any) => {
  res.send('RestoM backend is running. Use /api/* for API endpoints.')
})

// Simple probe page for browser testing — fetches /api/health and shows JSON
app.get('/probe', (_req: any, res: any) => {
  res.type('html').send(`
    <!doctype html>
    <html>
    <head><meta charset="utf-8"><title>RestoM Probe</title></head>
    <body>
      <h2>RestoM Probe</h2>
      <div id="out">Loading...</div>
      <script>
        fetch('/api/health').then(r=>r.json()).then(j=>{
          document.getElementById('out').textContent = JSON.stringify(j)
        }).catch(e=>{ document.getElementById('out').textContent = 'ERROR: '+e.message })
      </script>
    </body>
    </html>
  `)
})

// MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/restom'
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err: any) => console.error('MongoDB connection error', err));

// Schedule OTP cleanup every minute in dev/production
// Use globalThis.setInterval to satisfy TypeScript lib definitions
// Schedule cleanup using setTimeout recursion to avoid typing issues with setInterval
// schedule cleanup using a self-invoking recursive function
// Schedule periodic OTP cleanup using Node timer (avoid TypeScript callable conflicts)
// Admin endpoint to trigger OTP cleanup manually (protected by DEV_OTP_SECRET in dev)
app.post('/api/admin/cleanup-expired-otps', async (req: any, res: any) => {
  try {
    // admin cleanup is protected by DEV_OTP_SECRET in non-prod
    if (process.env.NODE_ENV !== 'production') {
      if (!process.env.DEV_OTP_SECRET || req.headers['x-dev-otp-secret'] !== process.env.DEV_OTP_SECRET) return res.status(401).json({ error: 'unauthorized' })
    }
    await cleanupExpiredOtps()
    return res.json({ success: true })
  } catch (e:any) {
    return res.status(500).json({ error: e.message })
  }
})

// no socket.io attached in this simplified build

  


export default app

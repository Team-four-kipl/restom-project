import { Router } from 'express'
import Payment from '../models/Payment'
import Order from '../models/Order'
import crypto from 'crypto'

const router = Router()

router.post('/create', async (req: any, res: any) => {
  try {
    const p = await Payment.create(req.body)
    res.json({ success: true, data: p })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// webhook endpoint for payment gateway (HMAC-SHA256 signature expected in header)
// Note: The payments webhook should be called with the raw body (not parsed JSON) so
// HMAC verification matches provider signatures. We accept rawBody attached to req.rawBody
router.post('/webhook', async (req: any, res: any) => {
  try {
  // Determine raw string for signature verification:
  // - If body is a Buffer (bodyParser.raw), use its utf8 string
  // - If req.rawBody was set by another middleware, use it
  // - If body is string, use it
  // - Otherwise fallback to JSON.stringify(req.body)
  let rawStr = ''
  const maybeBody = (req as any).body
  if ((req as any).rawBody) rawStr = (req as any).rawBody
  else if (Buffer.isBuffer(maybeBody)) rawStr = maybeBody.toString('utf8')
  else if (typeof maybeBody === 'string') rawStr = maybeBody
  else rawStr = JSON.stringify(maybeBody || {})

  const signature = (req.headers['x-razorpay-signature'] || req.headers['x-signature'] || '') as string
    const secret = process.env.PAYMENT_WEBHOOK_SECRET

    if (secret) {
      if (!signature) {
        console.log('[PAYMENT] missing signature header')
        return res.status(400).json({ error: 'missing signature' })
      }
      // compute using the exact raw string we derived
      const computed = crypto.createHmac('sha256', secret).update(rawStr).digest('hex')
      console.log('[PAYMENT] signature check', { provided: signature, computed })
      if (computed !== signature) {
        console.log('[PAYMENT] invalid signature')
        return res.status(400).json({ error: 'invalid signature' })
      }
    } else {
      // no secret configured: log warning and allow for testing only
      console.log('[PAYMENT] PAYMENT_WEBHOOK_SECRET not set; accepting unsigned webhook (dev only)')
    }

    // payload may be parsed JSON (object) or a raw Buffer/string. If req.body is a Buffer,
    // fall back to parsing rawStr. Otherwise, use parsed object when available.
  const payload = (typeof req.body === 'object' && !Buffer.isBuffer(req.body) && Object.keys(req.body).length) ? req.body : JSON.parse(rawStr || '{}')

    // Example payload shapes:
    // { event: 'payment.captured', data: { id, order_id, amount, currency } }
    const ev = payload.event || payload.type || null
    const data = payload.data || payload.payload || payload

    // handle payment captured / success
    console.log('[PAYMENT] webhook event', ev)
    console.log('[PAYMENT] parsed data', data)
    if (ev && (ev === 'payment.captured' || ev === 'payment.succeeded' || ev === 'payment.success')) {
      const providerPaymentId = data.id || data.payment_id || data.providerPaymentId
      const orderId = data.order_id || data.orderId || data.order_id_raw || data.order || (data.payload && data.payload.payment && data.payload.payment.entity && data.payload.payment.entity.order_id)
      const amount = data.amount || data.value || (data.payload && data.payload.payment && data.payload.payment.entity && data.payload.payment.entity.amount)

      if (!providerPaymentId) {
        console.log('[PAYMENT] no providerPaymentId in payload')
      }

      // upsert payment record by providerPaymentId (if present) otherwise create new
      let paymentRecord: any = null
      if (providerPaymentId) {
        paymentRecord = await Payment.findOneAndUpdate({ providerPaymentId }, { $set: { providerPaymentId, provider: 'provider', amount, currency: data.currency || 'INR', status: 'captured', raw: payload } }, { upsert: true, new: true })
      } else if (orderId) {
        paymentRecord = await Payment.create({ orderId, restaurantId: data.restaurantId || null, amount, currency: data.currency || 'INR', status: 'captured', providerPaymentId: providerPaymentId || null, raw: payload })
      }

      // reconcile order payment status
      if (orderId) {
        try {
          console.log('[PAYMENT] attempting to reconcile orderId', orderId)
          const o = await Order.findById(orderId)
          if (o) {
            o.paymentStatus = 'paid'
            await o.save()
            console.log('[PAYMENT] reconciled order', orderId, '-> paymentStatus=paid')
          } else {
            console.log('[PAYMENT] order not found for id', orderId)
          }
        } catch (e:any) {
          console.log('[PAYMENT] error reconciling order', e.message)
        }
      } else {
        console.log('[PAYMENT] no orderId found in payload; skipping reconciliation')
      }
    }

    // For other events, log and store raw if necessary

    res.json({ ok: true })
  } catch (e:any) {
    console.error('[PAYMENT] webhook handler error', e && e.message)
    res.status(500).json({ error: e.message })
  }
})

export default router

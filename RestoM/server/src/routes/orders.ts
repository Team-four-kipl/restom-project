import { Router } from 'express'
import Order from '../models/Order'

const router = Router()

// create order
router.post('/', async (req: any, res: any) => {
  try {
    const payload = req.body
    // validate minimal fields
    if (!payload.restaurantId || !payload.items || !Array.isArray(payload.items)) return res.status(400).json({ error: 'invalid payload' })
    const order = await Order.create(payload)
    // TODO: publish to SQS or emit socket event
    // emit via Socket.IO if available
    try {
      const io = (req.app as any).io
      if (io) {
        console.log('[ORDERS] emitting order:created', order._id)
        io.emit('order:created', order)
      } else {
        if (process.env.ENABLE_SOCKET_IO === 'true') console.log('[ORDERS] io not attached to app')
      }
    } catch (e) { }
    res.json({ success: true, data: order })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// get order
router.get('/:id', async (req: any, res: any) => {
  const o = await Order.findById(req.params.id)
  if (!o) return res.status(404).json({ error: 'not found' })
  res.json({ success: true, data: o })
})

export default router

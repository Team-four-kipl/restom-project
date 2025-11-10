import { Router } from 'express'
import Restaurant from '../models/Restaurant'

const router = Router()

// List restaurants (basic)
router.get('/', async (req: any, res: any) => {
  const list = await Restaurant.find({ isActive: true }).limit(50)
  res.send({ success: true, data: list })
})

// Get by domain or id
router.get('/lookup', async (req: any, res: any) => {
  const { domain, id } = req.query
  if (domain) {
    const r = await Restaurant.findOne({ domain })
    if (!r) return res.status(404).send({ error: 'not found' })
    return res.send({ success: true, data: r })
  }
  if (id) {
    const r = await Restaurant.findById(id)
    if (!r) return res.status(404).send({ error: 'not found' })
    return res.send({ success: true, data: r })
  }
  return res.status(400).send({ error: 'domain or id required' })
})

export default router

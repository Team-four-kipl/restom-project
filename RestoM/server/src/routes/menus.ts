import { Router } from 'express'
import Menu from '../models/Menu'
import MenuItem from '../models/MenuItem'

const router = Router()

// get menu items for a restaurant
router.get('/items', async (req: any, res: any) => {
  const { restaurantId, menuId, category } = req.query
  const filter: any = {}
  if (restaurantId) filter.restaurantId = restaurantId
  if (menuId) filter.menuId = menuId
  if (category) filter.category = category
  const items = await MenuItem.find(filter).limit(200)
  res.json({ success: true, data: items })
})

export default router

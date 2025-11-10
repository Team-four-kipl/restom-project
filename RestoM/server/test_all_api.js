const axios = require('axios')
const mongoose = require('mongoose')
const Restaurant = require('./dist/models/Restaurant').default
const MenuItem = require('./dist/models/MenuItem').default

const base = 'http://localhost:5000'

async function get(path) {
  try {
    const r = await axios.get(base + path)
    return { ok: true, status: r.status, data: r.data }
  } catch (e) {
    return { ok: false, error: e.message, response: e.response && e.response.data }
  }
}

async function post(path, body, headers={}) {
  try {
    const r = await axios.post(base + path, body, { headers })
    return { ok: true, status: r.status, data: r.data }
  } catch (e) {
    return { ok: false, error: e.message, response: e.response && e.response.data }
  }
}

async function seed() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/restom'
  await mongoose.connect(MONGO_URI)
  // find or create a test restaurant and menu item (idempotent)
  const domain = 'testr'
  let rest = await Restaurant.findOne({ domain })
  if (!rest) {
    rest = await Restaurant.create({ name: 'Test R', domain, address: 'Nowhere', phone: '000', currency: 'INR', timezone: 'UTC', isActive: true })
  }
  let item = await MenuItem.findOne({ restaurantId: rest._id, name: 'Seed Dish' })
  if (!item) {
    item = await MenuItem.create({ restaurantId: rest._id, menuId: null, name: 'Seed Dish', description: 'Seeded', price: 99, image: '', isAvailable: true, category: 'Main Course' })
  }
  return { rest, item }
}

async function run() {
  console.log('Checking /api/health')
  console.log(await get('/api/health'))

  // seed DB with restaurant/menuItem so orders/payments validate
  const { rest, item } = await seed()
  console.log('Seeded restaurant/menuItem', rest._id.toString(), item._id.toString())

  // Auth: use unique email so signup won't collide
  const ts = Date.now()
  const uniqueEmail = `autotest+${ts}@example.com`
  // generate unique phone: country code 91 + 10 digits from timestamp
  const phoneSuffix = (ts % 10000000000).toString().padStart(10, '0')
  const uniquePhone = `91${phoneSuffix}`
  console.log('\nAuth: signup with unique email/phone', uniqueEmail, uniquePhone)
  console.log(await post('/api/auth/signup', { name: 'AutoTest', email: uniqueEmail, phone: uniquePhone, password: 'pass1234' }))
  console.log('login')
  console.log(await post('/api/auth/login', { email: uniqueEmail, password: 'pass1234' }))

  console.log('\nRestaurants list')
  console.log(await get('/api/restaurants'))

  console.log('\nMenu items')
  console.log(await get('/api/menus/items?restaurantId=' + rest._id.toString()))

  console.log('\nCreate order with seeded IDs')
  const orderPayload = { restaurantId: rest._id.toString(), items: [{ menuItemId: item._id.toString(), name: item.name, price: item.price, quantity: 1 }], total: item.price, status: 'pending' }
  const cr = await post('/api/orders', orderPayload)
  console.log('create order result:', cr)
  let orderId = null
  if (cr.ok && cr.data && cr.data.data && cr.data.data._id) orderId = cr.data.data._id
  if (orderId) console.log('get order', await get('/api/orders/' + orderId))

  console.log('\nPayments create with valid orderId')
  const paymentRes = await post('/api/payments/create', { orderId: orderId || null, restaurantId: rest._id.toString(), amount: item.price })
  console.log(paymentRes)

  console.log('\nPayments webhook (test)')
  // craft a payment.captured event referencing the created payment and order
  const payment = paymentRes && paymentRes.data && paymentRes.data.data
  const webhookPayload = { event: 'payment.captured', data: { id: (payment && payment._id) || 'p_test', order_id: orderId, amount: item.price, currency: 'INR' } }

  // sign payload if PAYMENT_WEBHOOK_SECRET provided
  const secret = process.env.PAYMENT_WEBHOOK_SECRET
  let headers = {}
  if (secret) {
    const crypto = require('crypto')
    const raw = JSON.stringify(webhookPayload)
    const sig = crypto.createHmac('sha256', secret).update(raw).digest('hex')
    headers['x-signature'] = sig
    console.log('Sending signed webhook with signature', sig)
    console.log(await post('/api/payments/webhook', raw, { 'Content-Type': 'application/json', 'x-signature': sig }))
  } else {
    console.log('No PAYMENT_WEBHOOK_SECRET set; sending unsigned webhook (dev)')
    console.log(await post('/api/payments/webhook', webhookPayload))
  }

  console.log('\nAll checks complete')
  process.exit(0)
}

run().catch(e=>{ console.error('test run failed', e && e.message); process.exit(1) })

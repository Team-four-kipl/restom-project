const axios = require('axios')
const mongoose = require('mongoose')

// use compiled models from dist
const Restaurant = require('./dist/models/Restaurant').default
const MenuItem = require('./dist/models/MenuItem').default
const Order = require('./dist/models/Order').default
const Payment = require('./dist/models/Payment').default

const base = 'http://localhost:5000'

async function connectDB() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/restom'
  await mongoose.connect(MONGO_URI)
}

async function seed() {
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

async function safeGet(path) {
  try {
    const r = await axios.get(base + path)
    return { ok: true, status: r.status, data: r.data }
  } catch (e) {
    return { ok: false, error: e.message, response: e.response && e.response.data }
  }
}

async function safePost(path, body, headers = {}) {
  try {
    const r = await axios.post(base + path, body, { headers })
    return { ok: true, status: r.status, data: r.data }
  } catch (e) {
    return { ok: false, error: e.message, response: e.response && e.response.data }
  }
}

async function run() {
  await connectDB()
  const results = { ts: new Date(), checks: [] }
  try {
    results.checks.push({ name: 'health', result: await safeGet('/api/health') })

    const { rest, item } = await seed()
    results.seed = { restaurantId: rest._id.toString(), itemId: item._id.toString() }

    // Auth: signup/login
    const ts = Date.now()
    const uniqueEmail = `autotest+${ts}@example.com`
    const phoneSuffix = (ts % 10000000000).toString().padStart(10, '0')
    const uniquePhone = `91${phoneSuffix}`

    results.checks.push({ name: 'signup', result: await safePost('/api/auth/signup', { name: 'AutoTest', email: uniqueEmail, phone: uniquePhone, password: 'pass1234' }) })
    results.checks.push({ name: 'login', result: await safePost('/api/auth/login', { email: uniqueEmail, password: 'pass1234' }) })

    // Restaurants and menus
    results.checks.push({ name: 'restaurants_list', result: await safeGet('/api/restaurants') })
    results.checks.push({ name: 'menu_items', result: await safeGet('/api/menus/items?restaurantId=' + rest._id.toString()) })

    // Create order
    const orderPayload = { restaurantId: rest._id.toString(), items: [{ menuItemId: item._id.toString(), name: item.name, price: item.price, quantity: 1 }], total: item.price, status: 'pending' }
    const cr = await safePost('/api/orders', orderPayload)
    results.checks.push({ name: 'create_order', result: cr })

    let orderId = null
    if (cr.ok && cr.data && cr.data.data && cr.data.data._id) orderId = cr.data.data._id
    if (orderId) results.checks.push({ name: 'get_order', result: await safeGet('/api/orders/' + orderId) })

    // Payments create
    const paymentRes = await safePost('/api/payments/create', { orderId: orderId || null, restaurantId: rest._id.toString(), amount: item.price })
    results.checks.push({ name: 'payments_create', result: paymentRes })

    // Payments webhook test
    const payment = paymentRes && paymentRes.result && paymentRes.data && paymentRes.data.data ? paymentRes.data.data : (paymentRes.data && paymentRes.data.data ? paymentRes.data.data : null)
    const webhookPayload = { event: 'payment.captured', data: { id: (payment && payment._id) || 'p_test', order_id: orderId, amount: item.price, currency: 'INR' } }

    // send signed if PAYMENT_WEBHOOK_SECRET present
    const secret = process.env.PAYMENT_WEBHOOK_SECRET
    if (secret) {
      const crypto = require('crypto')
      const raw = JSON.stringify(webhookPayload)
      const sig = crypto.createHmac('sha256', secret).update(raw).digest('hex')
      results.checks.push({ name: 'payments_webhook_signed', result: await safePost('/api/payments/webhook', raw, { 'Content-Type': 'application/json', 'x-signature': sig }) })
    } else {
      results.checks.push({ name: 'payments_webhook_unsigned', result: await safePost('/api/payments/webhook', webhookPayload) })
    }

  } catch (e) {
    results.error = e && e.message
  }

  // Save results to MongoDB
  const TestResultSchema = new mongoose.Schema({ ts: Date, results: Object }, { collection: 'test_results' })
  const TestResult = mongoose.model('TestResult', TestResultSchema)
  const rec = await TestResult.create({ ts: new Date(), results })
  console.log('Saved test results id:', rec._id.toString())
  console.log(JSON.stringify(results, null, 2))
  process.exit(0)
}

run().catch(e => { console.error('Runner error', e && e.message); process.exit(1) })

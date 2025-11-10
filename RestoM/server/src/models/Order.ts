import mongoose from 'mongoose'

const OrderItemSchema = new mongoose.Schema({
  menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
  name: { type: String },
  price: { type: Number },
  quantity: { type: Number, default: 1 }
}, { _id: false })

const OrderSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
  items: [OrderItemSchema],
  total: { type: Number, required: true },
  status: { type: String, enum: ['pending','preparing','ready','served','cancelled'], default: 'pending' },
  customerInfo: { type: mongoose.Schema.Types.Mixed },
  paymentStatus: { type: String, enum: ['unpaid','paid','failed'], default: 'unpaid' }
}, { timestamps: true })

export default mongoose.model('Order', OrderSchema)

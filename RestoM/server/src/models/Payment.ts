import mongoose from 'mongoose'

const PaymentSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  provider: { type: String },
  providerPaymentId: { type: String },
  amount: { type: Number },
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['created','captured','failed','refunded'], default: 'created' },
  raw: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true })

export default mongoose.model('Payment', PaymentSchema)

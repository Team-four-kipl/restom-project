import mongoose from 'mongoose'

const RestaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  domain: { type: String, required: true, unique: true },
  address: { type: String },
  phone: { type: String },
  currency: { type: String, default: 'INR' },
  timezone: { type: String, default: 'Asia/Kolkata' },
  metadata: { type: mongoose.Schema.Types.Mixed },
  isActive: { type: Boolean, default: true }
}, { timestamps: true })

export default mongoose.model('Restaurant', RestaurantSchema)

import mongoose from 'mongoose'

const MenuItemSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  menuId: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu' },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  image: { type: String },
  isAvailable: { type: Boolean, default: true },
  category: { type: String }
}, { timestamps: true })

export default mongoose.model('MenuItem', MenuItemSchema)

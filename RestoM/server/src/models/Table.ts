import mongoose from 'mongoose'

const TableSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  name: { type: String, required: true },
  seats: { type: Number, default: 2 },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true })

export default mongoose.model('Table', TableSchema)

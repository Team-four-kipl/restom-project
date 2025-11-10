import mongoose, { Document, Schema } from 'mongoose';

export interface IMenuItem extends Document {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  type: 'veg' | 'nonveg';
  spiceLevel: 'mild' | 'medium' | 'hot';
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const menuItemSchema = new Schema<IMenuItem>({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true, enum: ['veg', 'nonveg'] },
  spiceLevel: { type: String, required: true, enum: ['mild', 'medium', 'hot'] },
  isAvailable: { type: Boolean, default: true },
}, {
  timestamps: true
});

export default mongoose.model<IMenuItem>('MenuItem', menuItemSchema);
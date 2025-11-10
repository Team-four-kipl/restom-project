import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  spiceLevel?: 'mild' | 'medium' | 'hot';
}

export interface IOrder extends Document {
  id: string;
  customerId?: string; // Add customer ID reference
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: IOrderItem[];
  total: number;
  status: 'Pending' | 'Preparing' | 'Ready' | 'Delivered' | 'Cancelled';
  orderTime: Date;
  deliveryAddress: string;
  paymentMethod?: string;
  paymentStatus: 'Pending' | 'Completed' | 'Failed';
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  spiceLevel: { type: String, enum: ['mild', 'medium', 'hot'] },
});

const orderSchema = new Schema<IOrder>({
  id: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String },
  items: [orderItemSchema],
  total: { type: Number, required: true },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  orderTime: { type: Date, default: Date.now },
  deliveryAddress: { type: String, required: true },
  paymentMethod: { type: String },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },
}, {
  timestamps: true
});

export default mongoose.model<IOrder>('Order', orderSchema);
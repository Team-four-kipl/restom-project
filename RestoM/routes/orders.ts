import express, { Request, Response } from 'express';
import Order from '../models/Order';
import { authenticateToken, requireAdmin } from '../middleware/auth';

interface AuthRequest extends Request {
  user?: any;
}

const router = express.Router();

// Generate unique order ID
const generateOrderId = (): string => {
  return 'FF' + Date.now().toString() + Math.floor(Math.random() * 1000).toString();
};

// Create new order
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      items,
      total,
      deliveryAddress,
      paymentMethod
    } = req.body;

    const order = new Order({
      id: generateOrderId(),
      customerId: req.user._id,
      customerName,
      customerEmail,
      customerPhone,
      items,
      total,
      status: 'Pending',
      orderTime: new Date(),
      deliveryAddress,
      paymentMethod,
      paymentStatus: 'Pending'
    });

    await order.save();

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        id: order.id,
        status: order.status,
        orderTime: order.orderTime
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's orders
router.get('/my-orders', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find({ customerEmail: req.user.email })
      .sort({ orderTime: -1 });
    res.json({ orders });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get order by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findOne({ id: req.params.id });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order or is admin
    if (order.customerEmail !== req.user.email && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status (Admin only)
router.put('/:id/status', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    const validStatuses = ['Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findOneAndUpdate(
      { id: req.params.id },
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all orders (Admin only)
router.get('/', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { status, page = '1', limit = '10' } = req.query;

    const query: any = {};
    if (status) {
      query.status = status;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const orders = await Order.find(query)
      .sort({ orderTime: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update payment status (Admin only)
router.put('/:id/payment', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { paymentStatus } = req.body;

    const validStatuses = ['Pending', 'Completed', 'Failed'];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid payment status' });
    }

    const order = await Order.findOneAndUpdate(
      { id: req.params.id },
      { paymentStatus },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Payment status updated successfully', order });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get order statistics (Admin only)
router.get('/stats/overview', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'Pending' });
    const preparingOrders = await Order.countDocuments({ status: 'Preparing' });
    const deliveredOrders = await Order.countDocuments({ status: 'Delivered' });

    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    const todayRevenue = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'Completed',
          orderTime: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    res.json({
      totalOrders,
      pendingOrders,
      preparingOrders,
      deliveredOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      todayRevenue: todayRevenue[0]?.total || 0
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
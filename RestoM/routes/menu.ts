import express, { Request, Response } from 'express';
import MenuItem from '../models/MenuItem';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Get all menu items
router.get('/', async (req: Request, res: Response) => {
  try {
    const menuItems = await MenuItem.find({ isAvailable: true });
    res.json({ menuItems });
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get menu item by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const menuItem = await MenuItem.findOne({ id: parseInt(req.params.id), isAvailable: true });
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json({ menuItem });
  } catch (error) {
    console.error('Get menu item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new menu item (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id, name, price, category, image, description, type, spiceLevel } = req.body;

    // Check if menu item with this ID already exists
    const existingItem = await MenuItem.findOne({ id });
    if (existingItem) {
      return res.status(400).json({ message: 'Menu item with this ID already exists' });
    }

    const menuItem = new MenuItem({
      id,
      name,
      price,
      category,
      image,
      description,
      type,
      spiceLevel,
      isAvailable: true
    });

    await menuItem.save();
    res.status(201).json({ message: 'Menu item added successfully', menuItem });
  } catch (error) {
    console.error('Add menu item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update menu item (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name, price, category, image, description, type, spiceLevel, isAvailable } = req.body;

    const menuItem = await MenuItem.findOneAndUpdate(
      { id: parseInt(req.params.id) },
      { name, price, category, image, description, type, spiceLevel, isAvailable },
      { new: true }
    );

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json({ message: 'Menu item updated successfully', menuItem });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete menu item (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const menuItem = await MenuItem.findOneAndDelete({ id: parseInt(req.params.id) });

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get menu items by category
router.get('/category/:category', async (req: Request, res: Response) => {
  try {
    const menuItems = await MenuItem.find({
      category: req.params.category,
      isAvailable: true
    });
    res.json({ menuItems });
  } catch (error) {
    console.error('Get menu items by category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Seed initial menu data (Admin only)
router.post('/seed', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    // Import the menuItems data from the frontend
    const { menuItems } = req.body;

    // Clear existing data
    await MenuItem.deleteMany({});

    // Insert new data
    const insertedItems = await MenuItem.insertMany(menuItems);

    res.json({
      message: 'Menu data seeded successfully',
      count: insertedItems.length
    });
  } catch (error) {
    console.error('Seed menu data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
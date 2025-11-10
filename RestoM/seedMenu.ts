import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MenuItem from './models/MenuItem';
import { menuItems } from './src/data/menuItems';

dotenv.config();

async function seedMenuData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restom');
    console.log('Connected to MongoDB');

    // Clear existing data
    await MenuItem.deleteMany({});
    console.log('Cleared existing menu items');

    // Insert new data
    const insertedItems = await MenuItem.insertMany(menuItems);
    console.log(`Seeded ${insertedItems.length} menu items successfully`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding menu data:', error);
    process.exit(1);
  }
}

seedMenuData();
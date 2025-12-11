const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const CommerceType = require('./models/CommerceType');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Order = require('./models/Order');
const connectDB = require('./config/database');

dotenv.config();

const cleanCommerces = async () => {
    await connectDB();
    console.log('Cleaning up Commerces and related data...');

    // 1. Delete all Commerce Users
    const commerces = await User.deleteMany({ role: 'commerce' });
    console.log(`Deleted ${commerces.deletedCount} Commerces`);

    // 2. Delete all Commerce Types
    const types = await CommerceType.deleteMany({});
    console.log(`Deleted ${types.deletedCount} Commerce Types`);

    // 3. Delete all Products
    const products = await Product.deleteMany({});
    console.log(`Deleted ${products.deletedCount} Products`);

    // 4. Delete all Categories
    const categories = await Category.deleteMany({});
    console.log(`Deleted ${categories.deletedCount} Categories`);

    // 5. Delete all Orders (Optional, but they link to commerces)
    const orders = await Order.deleteMany({});
    console.log(`Deleted ${orders.deletedCount} Orders`);

    console.log('Cleanup complete.');
    process.exit();
};

cleanCommerces();

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const CommerceType = require('./models/CommerceType');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Address = require('./models/Address');
const connectDB = require('./config/database');

dotenv.config();

const setupTestData = async () => {
    await connectDB();
    console.log('Setting up test data...');

    const commerceUser = await User.findOne({ email: 'comercio@test.com' });
    const clientUser = await User.findOne({ email: 'cliente@test.com' });

    if (!commerceUser || !clientUser) {
        console.error('Default users not found. Run seed.js first.');
        process.exit(1);
    }

    // 1. Create Category for commerceUser
    let category = await Category.findOne({ name: 'Bebidas Test', commerce: commerceUser._id });
    if (!category) {
        category = await Category.create({
            name: 'Bebidas Test',
            description: 'Refrescos para prueba',
            commerce: commerceUser._id
        });
        console.log('Test Category created');
    }

    // 2. Create Product for commerceUser
    let product = await Product.findOne({ name: 'Coca Cola Test', commerce: commerceUser._id });
    if (!product) {
        product = await Product.create({
            name: 'Coca Cola Test',
            description: 'Refrescante de prueba',
            price: 55,
            image: '/img/placeholder.png', // Placeholder
            category: category._id,
            commerce: commerceUser._id
        });
        console.log('Test Product created');
    }

    // 3. Create Address for clientUser
    let address = await Address.findOne({ name: 'Casa Test', user: clientUser._id });
    if (!address) {
        address = await Address.create({
            name: 'Casa Test',
            description: 'Calle Falsa 123',
            user: clientUser._id
        });
        console.log('Test Address created');
    }

    console.log('Test data setup complete.');
    process.exit(0);
};

setupTestData();

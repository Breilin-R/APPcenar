const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const connectDB = require('./config/database');

dotenv.config();

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seedOrders = async () => {
    await connectDB();
    console.log('Generating orders for each commerce...');

    const commerces = await User.find({ role: 'commerce' });
    const clients = await User.find({ role: 'client' });
    const deliveries = await User.find({ role: 'delivery' });

    if (clients.length === 0 || deliveries.length === 0) {
        console.log('Need clients and deliveries to create orders.');
        process.exit();
    }

    let totalOrders = 0;

    for (let commerce of commerces) {
        // Find products for this commerce
        const products = await Product.find({ commerce: commerce._id });

        if (products.length === 0) continue;

        // Create 5-10 orders per commerce
        const orderCount = getRandomInt(5, 10);

        for (let i = 0; i < orderCount; i++) {
            const client = getRandomElement(clients);
            const delivery = getRandomElement(deliveries);

            // Pick 1-3 random products
            const orderProducts = [];
            let subtotal = 0;
            const numProducts = getRandomInt(1, 3);

            for (let j = 0; j < numProducts; j++) {
                const p = getRandomElement(products);
                const qty = getRandomInt(1, 2);
                orderProducts.push({
                    product: p._id,
                    name: p.name,
                    price: p.price,
                    image: p.image,
                    quantity: qty
                });
                subtotal += p.price * qty;
            }

            const itbis = subtotal * 0.18;
            const total = subtotal + itbis;
            const status = getRandomElement(['pending', 'in_process', 'completed']);

            const order = new Order({
                client: client._id,
                commerce: commerce._id,
                delivery: status !== 'pending' ? delivery._id : null, // Only assign delivery if not pending
                address: `Calle ${getRandomInt(1, 100)} #${getRandomInt(1, 50)}, Santo Domingo`,
                products: orderProducts,
                subtotal,
                itbis,
                total,
                status,
                date: new Date(Date.now() - getRandomInt(0, 1000000000)) // Random date in recent past
            });

            await order.save();
        }
        totalOrders += orderCount;
        console.log(`Created ${orderCount} orders for ${commerce.commerceName}`);
    }

    console.log(`Total orders created: ${totalOrders}`);
    process.exit();
};

seedOrders();

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const CommerceType = require('./models/CommerceType');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Address = require('./models/Address');
const connectDB = require('./config/database');

dotenv.config();

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateRandomString = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

const seed = async () => {
    await connectDB();

    console.log('Starting bulk seed...');

    // 1. Create Commerce Types (100+)
    console.log('Seeding Commerce Types...');
    const commerceTypes = [];
    for (let i = 0; i < 105; i++) {
        commerceTypes.push({
            name: `Type ${generateRandomString(5)}`,
            description: `Description for type ${i}`,
            icon: '/img/placeholder.png'
        });
    }
    // Check if we already have types to avoid duplicates if run multiple times, 
    // but for bulk we usually just want to add. 
    // To avoid unique index errors on names if any, we used random strings.
    const createdTypes = await CommerceType.insertMany(commerceTypes);
    console.log(`Created ${createdTypes.length} Commerce Types`);

    // 2. Create Users (100+ Clients, 20 Commerces, 20 Deliveries)
    console.log('Seeding Users...');
    const users = [];
    const passwordHash = await new User().encryptPassword('123'); // Reuse hash for speed

    // Commerces
    const createdCommerces = [];
    for (let i = 0; i < 25; i++) {
        const commerce = new User({
            commerceName: `Commerce ${generateRandomString(5)}`,
            phone: '809-555-' + getRandomInt(1000, 9999),
            email: `commerce${i}_${generateRandomString(3)}@test.com`,
            openingTime: '08:00',
            closingTime: '22:00',
            commerceType: getRandomElement(createdTypes)._id,
            role: 'commerce',
            status: 'active',
            password: passwordHash
        });
        createdCommerces.push(commerce);
        users.push(commerce);
    }

    // Deliveries
    const createdDeliveries = [];
    for (let i = 0; i < 25; i++) {
        const delivery = new User({
            name: `Delivery ${generateRandomString(5)}`,
            surname: `Surname ${i}`,
            phone: '809-555-' + getRandomInt(1000, 9999),
            email: `delivery${i}_${generateRandomString(3)}@test.com`,
            username: `delivery${i}_${generateRandomString(3)}`,
            role: 'delivery',
            status: 'active',
            isAvailable: true,
            password: passwordHash
        });
        createdDeliveries.push(delivery);
        users.push(delivery);
    }

    // Clients
    const createdClients = [];
    for (let i = 0; i < 105; i++) {
        const client = new User({
            name: `Client ${generateRandomString(5)}`,
            surname: `Surname ${i}`,
            phone: '809-555-' + getRandomInt(1000, 9999),
            email: `client${i}_${generateRandomString(3)}@test.com`,
            username: `client${i}_${generateRandomString(3)}`,
            role: 'client',
            status: 'active',
            password: passwordHash
        });
        createdClients.push(client);
        users.push(client);
    }

    // Admins (Just a few)
    for (let i = 0; i < 5; i++) {
        users.push(new User({
            name: `Admin ${generateRandomString(5)}`,
            surname: `Surname ${i}`,
            cedula: `001-${getRandomInt(1000000, 9999999)}-${getRandomInt(0, 9)}`,
            email: `admin${i}_${generateRandomString(3)}@test.com`,
            username: `admin${i}_${generateRandomString(3)}`,
            role: 'admin',
            status: 'active',
            password: passwordHash
        }));
    }

    await User.insertMany(users);
    console.log(`Created ${users.length} Users`);

    // 3. Addresses (100+)
    console.log('Seeding Addresses...');
    const addresses = [];
    for (let i = 0; i < 150; i++) {
        addresses.push({
            name: `Address ${i}`,
            description: `Street ${generateRandomString(5)} #${getRandomInt(1, 100)}`,
            user: getRandomElement(createdClients)._id
        });
    }
    await Address.insertMany(addresses);
    console.log(`Created ${addresses.length} Addresses`);

    // 4. Categories (100+)
    console.log('Seeding Categories...');
    const categories = [];
    for (let i = 0; i < 150; i++) {
        categories.push({
            name: `Category ${generateRandomString(5)}`,
            description: `Description ${i}`,
            commerce: getRandomElement(createdCommerces)._id
        });
    }
    const createdCategories = await Category.insertMany(categories);
    console.log(`Created ${createdCategories.length} Categories`);

    // 5. Products (100+)
    console.log('Seeding Products...');
    const products = [];
    for (let i = 0; i < 200; i++) {
        const category = getRandomElement(createdCategories);
        products.push({
            name: `Product ${generateRandomString(5)}`,
            description: `Delicious product ${i}`,
            price: getRandomInt(100, 5000),
            image: '/img/placeholder.png',
            category: category._id,
            commerce: category.commerce
        });
    }
    const createdProducts = await Product.insertMany(products);
    console.log(`Created ${createdProducts.length} Products`);

    // 6. Orders (100+)
    console.log('Seeding Orders...');
    const orders = [];
    for (let i = 0; i < 150; i++) {
        const client = getRandomElement(createdClients);
        // Find a commerce that has products
        // For simplicity, pick a random product and use its commerce
        const product = getRandomElement(createdProducts);

        const quantity = getRandomInt(1, 5);
        const subtotal = product.price * quantity;
        const itbis = subtotal * 0.18;
        const total = subtotal + itbis;

        orders.push({
            client: client._id,
            commerce: product.commerce,
            delivery: getRandomElement(createdDeliveries)._id,
            address: `Generated Address ${i}`,
            products: [{
                product: product._id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: quantity
            }],
            subtotal,
            itbis,
            total,
            status: getRandomElement(['pending', 'in_process', 'completed']),
            date: new Date()
        });
    }
    await Order.insertMany(orders);
    console.log(`Created ${orders.length} Orders`);

    console.log('Bulk seed completed successfully!');
    process.exit();
};

seed();

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const CommerceType = require('./models/CommerceType');
const Category = require('./models/Category');
const Product = require('./models/Product');
const connectDB = require('./config/database');

dotenv.config();

const restaurants = [
    { name: 'Adrian Tropical', type: 'Restaurante' },
    { name: 'Barra Payán', type: 'Comida Rápida' },
    { name: 'El Conuco', type: 'Restaurante' },
    { name: 'Pizzería Il Forno', type: 'Pizzería' },
    { name: 'Chef Pepper', type: 'Comida Rápida' },
    { name: 'Jade Teriyaki', type: 'Restaurante' },
    { name: 'McDonalds', type: 'Comida Rápida' },
    { name: 'Burger King', type: 'Comida Rápida' },
    { name: 'Papa Johns', type: 'Pizzería' },
    { name: 'Domino\'s Pizza', type: 'Pizzería' },
    { name: 'KFC', type: 'Comida Rápida' },
    { name: 'Taco Bell', type: 'Comida Rápida' },
    { name: 'Wendy\'s', type: 'Comida Rápida' },
    { name: 'Little Caesars', type: 'Pizzería' },
    { name: 'Subway', type: 'Comida Rápida' },
    { name: 'Villar Hermanos', type: 'Restaurante' },
    { name: 'La Lasagna', type: 'Restaurante' },
    { name: 'Pala Pizza', type: 'Pizzería' },
    { name: 'Mustard\'s', type: 'Restaurante' },
    { name: 'Friday\'s', type: 'Restaurante' },
    { name: 'Chili\'s', type: 'Restaurante' },
    { name: 'Outback Steakhouse', type: 'Restaurante' },
    { name: 'Applebee\'s', type: 'Restaurante' },
    { name: 'Ihop', type: 'Restaurante' },
    { name: 'Denny\'s', type: 'Restaurante' }
];

const menuItems = [
    { name: 'Mofongo de Chicharrón', price: 450 },
    { name: 'Sancocho', price: 350 },
    { name: 'Pechuga a la Plancha', price: 395 },
    { name: 'Arroz con Pollo', price: 250 },
    { name: 'Hamburguesa Clásica', price: 300 },
    { name: 'Pizza de Pepperoni', price: 500 },
    { name: 'Ensalada César', price: 275 },
    { name: 'Tostones Rellenos', price: 200 },
    { name: 'Jugo de Chinola', price: 100 },
    { name: 'Batida de Zapote', price: 120 },
    { name: 'Club Sandwich', price: 325 },
    { name: 'Yaroa Mixta', price: 250 },
    { name: 'Servicio de Tacos', price: 280 },
    { name: 'Burrito Supremo', price: 310 },
    { name: 'Pollo Frito (2 pzas)', price: 190 },
    { name: 'Costillas BBQ', price: 650 },
    { name: 'Churrasco', price: 950 },
    { name: 'Pasta Alfredo', price: 420 },
    { name: 'Lasaña de Carne', price: 380 },
    { name: 'Suspiro Limeño', price: 150 }
];

const getRandomItems = (count) => {
    const shuffled = menuItems.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

const seedRestaurants = async () => {
    await connectDB();
    console.log('Seeding 25 Restaurants with 10 products each...');

    const passwordHash = await new User().encryptPassword('123');

    // Ensure types exist
    const typesMap = {};
    const typeNames = ['Restaurante', 'Comida Rápida', 'Pizzería'];

    for (const name of typeNames) {
        let type = await CommerceType.findOne({ name });
        if (!type) {
            type = await CommerceType.create({
                name,
                description: `Sitios de ${name}`,
                icon: '/img/placeholder.png'
            });
        }
        typesMap[name] = type._id;
    }

    for (let i = 0; i < restaurants.length; i++) {
        const r = restaurants[i];

        // Create User (Commerce)
        const commerce = new User({
            commerceName: r.name,
            phone: '809-555-' + Math.floor(1000 + Math.random() * 9000),
            email: `commerce_${i}_${Date.now()}@test.com`,
            openingTime: '08:00',
            closingTime: '23:00',
            commerceType: typesMap[r.type] || typesMap['Restaurante'],
            role: 'commerce',
            status: 'active',
            password: passwordHash
        });
        await commerce.save();

        // Create Category
        const category = await Category.create({
            name: 'Menú Principal',
            description: 'Platos principales',
            commerce: commerce._id
        });

        // Create 10 Products
        const products = getRandomItems(10).map(item => ({
            name: item.name,
            description: 'Delicioso plato preparado al momento',
            price: item.price,
            image: '/img/placeholder.png',
            category: category._id,
            commerce: commerce._id
        }));

        await Product.insertMany(products);
        console.log(`Created ${r.name} with 10 products.`);
    }

    console.log('Done!');
    process.exit();
};

seedRestaurants();

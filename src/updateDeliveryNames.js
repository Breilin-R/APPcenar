const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/database');

dotenv.config();

const dominicanNames = [
    'Juan', 'Pedro', 'Luis', 'Carlos', 'José', 'Manuel', 'Ramón', 'Miguel', 'Francisco', 'Antonio',
    'María', 'Juana', 'Ana', 'Luisa', 'Carmen', 'Rosa', 'Francisca', 'Altagracia', 'Mercedes', 'Maritza',
    'Yulissa', 'Wellington', 'Junior', 'Kelvin', 'Yajaira', 'Esther', 'Ruth', 'David', 'Daniel', 'Rafael',
    'Brayan', 'Starlin', 'Yandel', 'Angel', 'Cristian', 'Jonathan', 'Erick'
];

const dominicanSurnames = [
    'Rodríguez', 'Pérez', 'Martínez', 'García', 'Reyes', 'Sánchez', 'Díaz', 'Peña', 'Jiménez', 'Ramírez',
    'Hernández', 'Rosario', 'González', 'Santana', 'Cruz', 'Castillo', 'Vargas', 'Almanzar', 'Batista', 'De la Cruz',
    'Polanco', 'Fernández', 'Gómez', 'López', 'Vasquez', 'Espinal', 'Taveras', 'Paulino', 'Mejía', 'Suarez',
    'Matos', 'Cuevas', 'Feliz', 'Montero', 'Báez'
];

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const updateDeliveryNames = async () => {
    await connectDB();
    console.log('Updating deliveries with Dominican names...');

    const deliveries = await User.find({ role: 'delivery' });
    console.log(`Found ${deliveries.length} deliveries to update.`);

    for (let delivery of deliveries) {
        delivery.name = getRandomElement(dominicanNames);
        delivery.surname = `${getRandomElement(dominicanSurnames)} ${getRandomElement(dominicanSurnames)}`;
        await delivery.save();
    }

    console.log('Update complete.');

    // Verify
    console.log('--- Sample of Updated Deliveries ---');
    const sample = await User.find({ role: 'delivery' }).limit(5).select('name surname email');
    sample.forEach(d => console.log(`${d.name} ${d.surname} (${d.email})`));

    process.exit();
};

updateDeliveryNames();

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/database');

dotenv.config();

const dominicanNames = [
    'Juan', 'Pedro', 'Luis', 'Carlos', 'José', 'Manuel', 'Ramón', 'Miguel', 'Francisco', 'Antonio',
    'María', 'Juana', 'Ana', 'Luisa', 'Carmen', 'Rosa', 'Francisca', 'Altagracia', 'Mercedes', 'Maritza',
    'Yulissa', 'Wellington', 'Junior', 'Kelvin', 'Yajaira', 'Esther', 'Ruth', 'David', 'Daniel', 'Rafael'
];

const dominicanSurnames = [
    'Rodríguez', 'Pérez', 'Martínez', 'García', 'Reyes', 'Sánchez', 'Díaz', 'Peña', 'Jiménez', 'Ramírez',
    'Hernández', 'Rosario', 'González', 'Santana', 'Cruz', 'Castillo', 'Vargas', 'Almanzar', 'Batista', 'De la Cruz',
    'Polanco', 'Fernández', 'Gómez', 'López', 'Vasquez', 'Espinal', 'Taveras', 'Paulino', 'Mejía', 'Suarez'
];

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const updateClientNames = async () => {
    await connectDB();
    console.log('Updating clients with Dominican names...');

    const clients = await User.find({ role: 'client' });
    console.log(`Found ${clients.length} clients to update.`);

    for (let client of clients) {
        client.name = getRandomElement(dominicanNames);
        client.surname = `${getRandomElement(dominicanSurnames)} ${getRandomElement(dominicanSurnames)}`;
        await client.save();
    }

    console.log('Update complete.');
    process.exit();
};

updateClientNames();

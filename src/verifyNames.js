const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/database');

dotenv.config();

const verifyNames = async () => {
    await connectDB();
    const clients = await User.find({ role: 'client' }).limit(10).select('name surname email');
    console.log('--- Sample of Updated Clients ---');
    clients.forEach(c => {
        console.log(`${c.name} ${c.surname} (${c.email})`);
    });
    process.exit();
};

verifyNames();

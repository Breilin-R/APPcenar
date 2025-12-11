const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        let uri = process.env.MONGODB_URI;
        if (process.env.NODE_ENV === 'qa') {
            uri = uri.replace('appcenar-dev', 'appcenar-qa');
        }
        console.log('Connecting to MongoDB at:', uri);
        const db = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${db.connection.host}`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

module.exports = connectDB;

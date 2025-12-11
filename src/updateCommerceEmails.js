const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/database');

dotenv.config();

const updateCommerceEmails = async () => {
    await connectDB();
    console.log('Updating commerce emails...');

    // Find commerces created by the previous script (or all commerces)
    // We'll sort by creation date to try to match the order, or just iterate.
    // The user asked for "commerce_0@test.com", "commerce_1@test.com", etc.

    const commerces = await User.find({ role: 'commerce' }).sort({ _id: 1 });
    console.log(`Found ${commerces.length} commerces.`);

    for (let i = 0; i < commerces.length; i++) {
        const commerce = commerces[i];
        const newEmail = `commerce_${i}@test.com`;

        // Check if email exists (to avoid duplicate key error if re-running)
        // But since we are renaming them all, we might hit collisions if we are not careful.
        // We will update them one by one.

        commerce.email = newEmail;
        try {
            await commerce.save();
            console.log(`Updated ${commerce.commerceName} -> ${newEmail}`);
        } catch (err) {
            console.error(`Error updating ${commerce.commerceName}: ${err.message}`);
        }
    }

    console.log('Update complete.');
    process.exit();
};

updateCommerceEmails();

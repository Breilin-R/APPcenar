const mongoose = require('mongoose');
const { Schema } = mongoose;

const AddressSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    user: { type: String, required: true } // User ID (Client)
});

module.exports = mongoose.model('Address', AddressSchema);

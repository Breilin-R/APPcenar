const mongoose = require('mongoose');
const { Schema } = mongoose;

const ConfigurationSchema = new Schema({
    key: { type: String, required: true, unique: true }, // e.g., 'itbis'
    value: { type: String, required: true }
});

module.exports = mongoose.model('Configuration', ConfigurationSchema);

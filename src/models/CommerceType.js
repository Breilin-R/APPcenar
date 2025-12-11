const mongoose = require('mongoose');
const { Schema } = mongoose;

const CommerceTypeSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true }
});

module.exports = mongoose.model('CommerceType', CommerceTypeSchema);

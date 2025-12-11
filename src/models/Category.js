const mongoose = require('mongoose');
const { Schema } = mongoose;

const CategorySchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    commerce: { type: String, required: true } // Commerce ID
});

module.exports = mongoose.model('Category', CategorySchema);

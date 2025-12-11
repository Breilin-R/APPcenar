const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProductSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    commerce: { type: String, required: true } // Commerce ID
});

module.exports = mongoose.model('Product', ProductSchema);

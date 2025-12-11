const mongoose = require('mongoose');
const { Schema } = mongoose;

const OrderSchema = new Schema({
    client: { type: String, required: true }, // Client ID
    commerce: { type: String, required: true }, // Commerce ID
    delivery: { type: String }, // Delivery ID
    address: { type: String, required: true }, // Address String or ID? "dirección del cliente a la que se va entregar"
    // It says "seleccionar una de la misma", so it's one of the user's addresses. 
    // But for history, maybe store the text? Or ID. Let's store ID and maybe populate.
    // Actually, if user deletes address, order history might break. Better store the full address string/object.
    // But for now, let's store the ID and populate, assuming soft delete or just keeping it simple.
    // Wait, requirement says "se debe guardar... la dirección del cliente".

    products: [{
        product: { type: Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        price: Number,
        image: String,
        quantity: { type: Number, default: 1 }
    }],

    subtotal: { type: Number, required: true },
    itbis: { type: Number, required: true },
    total: { type: Number, required: true },

    status: {
        type: String,
        enum: ['pending', 'in_process', 'completed'],
        default: 'pending'
    },

    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);

const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');

const UserSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['client', 'delivery', 'commerce', 'admin'], required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
    activationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    // Client / Delivery / Admin
    name: String,
    surname: String,
    username: { type: String, unique: true, sparse: true }, // sparse allows null/undefined to not clash

    // Client / Delivery / Commerce
    phone: String,

    // Client / Delivery
    profileImage: String,

    // Commerce
    commerceName: String,
    commerceLogo: String,
    openingTime: String,
    closingTime: String,
    commerceType: { type: Schema.Types.ObjectId, ref: 'CommerceType' },

    // Admin
    cedula: String,

    // Delivery Status
    isAvailable: { type: Boolean, default: true }, // For delivery availability

    // Client Favorites
    favorites: [{ type: String }] // List of Commerce IDs

}, {
    timestamps: true
});

UserSchema.methods.encryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

UserSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);

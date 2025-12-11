const User = require('../models/User');
const Order = require('../models/Order');
const upload = require('../middleware/upload');

const deliveryCtrl = {};

deliveryCtrl.renderHome = async (req, res) => {
    const orders = await Order.find({ delivery: req.session.user._id })
        .sort({ date: -1 })
        .lean();

    for (let order of orders) {
        const commerce = await User.findById(order.commerce).lean();
        order.commerceName = commerce.commerceName;
        order.commerceLogo = commerce.commerceLogo;
        order.productCount = order.products.reduce((acc, p) => acc + p.quantity, 0);
    }

    res.render('delivery/home', { orders });
};

deliveryCtrl.renderOrderDetail = async (req, res) => {
    const order = await Order.findById(req.params.id).lean();
    const commerce = await User.findById(order.commerce).lean();
    order.commerceName = commerce.commerceName;
    res.render('delivery/order-detail', { order });
};

deliveryCtrl.completeOrder = async (req, res) => {
    const { id } = req.params;
    const order = await Order.findById(id);

    order.status = 'completed';
    await order.save();

    // Mark delivery as available
    const delivery = await User.findById(req.session.user._id);
    delivery.isAvailable = true;
    await delivery.save();

    res.redirect(`/delivery/order/${id}`);
};

deliveryCtrl.renderProfile = async (req, res) => {
    const user = await User.findById(req.session.user._id).lean();
    res.render('delivery/profile', { user });
};

deliveryCtrl.updateProfile = async (req, res) => {
    const { name, surname, phone } = req.body;
    const user = await User.findById(req.session.user._id);

    user.name = name;
    user.surname = surname;
    user.phone = phone;

    if (req.file) {
        user.profileImage = '/uploads/' + req.file.filename;
    }

    await user.save();
    req.session.user = user;
    res.redirect('/delivery/profile');
};

module.exports = deliveryCtrl;

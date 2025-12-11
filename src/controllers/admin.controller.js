const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const CommerceType = require('../models/CommerceType');
const Configuration = require('../models/Configuration');
const upload = require('../middleware/upload');

const adminCtrl = {};

adminCtrl.renderHome = async (req, res) => {
    // Stats
    const totalOrders = await Order.countDocuments();

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const ordersToday = await Order.countDocuments({ date: { $gte: startOfDay } });

    const activeCommerces = await User.countDocuments({ role: 'commerce', status: 'active' });
    const inactiveCommerces = await User.countDocuments({ role: 'commerce', status: 'inactive' });

    const activeClients = await User.countDocuments({ role: 'client', status: 'active' });
    const inactiveClients = await User.countDocuments({ role: 'client', status: 'inactive' });

    const activeDeliveries = await User.countDocuments({ role: 'delivery', status: 'active' });
    const inactiveDeliveries = await User.countDocuments({ role: 'delivery', status: 'inactive' });

    const totalProducts = await Product.countDocuments();

    res.render('admin/home', {
        totalOrders, ordersToday,
        activeCommerces, inactiveCommerces,
        activeClients, inactiveClients,
        activeDeliveries, inactiveDeliveries,
        totalProducts
    });
};

// Clients
adminCtrl.renderClients = async (req, res) => {
    const clients = await User.find({ role: 'client' }).lean();
    // Need order count for each client? "cantidad de pedidos que ha realizado"
    for (let client of clients) {
        client.orderCount = await Order.countDocuments({ client: client._id });
    }
    res.render('admin/clients', { clients });
};

adminCtrl.toggleClientStatus = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    user.status = user.status === 'active' ? 'inactive' : 'active';
    await user.save();
    res.redirect('/admin/clients');
};

// Deliveries
adminCtrl.renderDeliveries = async (req, res) => {
    const deliveries = await User.find({ role: 'delivery' }).lean();
    for (let delivery of deliveries) {
        delivery.orderCount = await Order.countDocuments({ delivery: delivery._id, status: 'completed' });
    }
    res.render('admin/deliveries', { deliveries });
};

adminCtrl.toggleDeliveryStatus = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    user.status = user.status === 'active' ? 'inactive' : 'active';
    await user.save();
    res.redirect('/admin/deliveries');
};

// Commerces
adminCtrl.renderCommerces = async (req, res) => {
    const commerces = await User.find({ role: 'commerce' }).lean();
    for (let commerce of commerces) {
        commerce.orderCount = await Order.countDocuments({ commerce: commerce._id });
    }
    res.render('admin/commerces', { commerces });
};

adminCtrl.toggleCommerceStatus = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    user.status = user.status === 'active' ? 'inactive' : 'active';
    await user.save();
    res.redirect('/admin/commerces');
};

// Admins
adminCtrl.renderAdmins = async (req, res) => {
    const admins = await User.find({ role: 'admin' }).lean();
    res.render('admin/admins', { admins });
};

adminCtrl.renderCreateAdmin = (req, res) => {
    res.render('admin/create-admin');
};

adminCtrl.createAdmin = async (req, res) => {
    const { name, surname, cedula, email, username, password, confirm_password } = req.body;
    const errors = [];
    if (password != confirm_password) errors.push({ text: 'Passwords do not match' });
    if (errors.length > 0) return res.render('admin/create-admin', { errors, name, surname, cedula, email, username });

    const newUser = new User({ name, surname, cedula, email, username, password, role: 'admin', status: 'active' });
    newUser.password = await newUser.encryptPassword(password);
    await newUser.save();
    res.redirect('/admin/admins');
};

adminCtrl.renderEditAdmin = async (req, res) => {
    const admin = await User.findById(req.params.id).lean();
    res.render('admin/edit-admin', { admin });
};

adminCtrl.editAdmin = async (req, res) => {
    const { name, surname, cedula, email, username, password, confirm_password } = req.body;
    const admin = await User.findById(req.params.id);

    admin.name = name;
    admin.surname = surname;
    admin.cedula = cedula;
    admin.email = email;
    admin.username = username;

    if (password) {
        if (password !== confirm_password) {
            req.flash('error_msg', 'Passwords do not match');
            return res.redirect(`/admin/admins/edit/${req.params.id}`);
        }
        admin.password = await admin.encryptPassword(password);
    }

    await admin.save();
    res.redirect('/admin/admins');
};

adminCtrl.toggleAdminStatus = async (req, res) => {
    if (req.params.id == req.session.user._id) {
        req.flash('error_msg', 'You cannot deactivate yourself.');
        return res.redirect('/admin/admins');
    }
    const user = await User.findById(req.params.id);
    user.status = user.status === 'active' ? 'inactive' : 'active';
    await user.save();
    res.redirect('/admin/admins');
};

// Commerce Types
adminCtrl.renderCommerceTypes = async (req, res) => {
    const types = await CommerceType.find().lean();
    for (let type of types) {
        type.count = await User.countDocuments({ role: 'commerce', commerceType: type._id });
    }
    res.render('admin/commerce-types', { types });
};

adminCtrl.renderCreateCommerceType = (req, res) => {
    res.render('admin/create-commerce-type');
};

adminCtrl.createCommerceType = async (req, res) => {
    const { name, description } = req.body;
    const newType = new CommerceType({ name, description });
    if (req.file) newType.icon = '/uploads/' + req.file.filename;
    await newType.save();
    res.redirect('/admin/commerce-types');
};

adminCtrl.renderEditCommerceType = async (req, res) => {
    const type = await CommerceType.findById(req.params.id).lean();
    res.render('admin/edit-commerce-type', { type });
};

adminCtrl.editCommerceType = async (req, res) => {
    const { name, description } = req.body;
    const type = await CommerceType.findById(req.params.id);
    type.name = name;
    type.description = description;
    if (req.file) type.icon = '/uploads/' + req.file.filename;
    await type.save();
    res.redirect('/admin/commerce-types');
};

adminCtrl.deleteCommerceType = async (req, res) => {
    await CommerceType.findByIdAndDelete(req.params.id);
    // Also delete associated commerces? Requirement: "eliminar este tipo de comercio y todos los comercios asociado"
    await User.deleteMany({ role: 'commerce', commerceType: req.params.id });
    res.redirect('/admin/commerce-types');
};

// Config
adminCtrl.renderConfig = async (req, res) => {
    let config = await Configuration.findOne({ key: 'itbis' }).lean();
    if (!config) {
        config = { value: '18' }; // Default
    }
    res.render('admin/config', { config });
};

adminCtrl.updateConfig = async (req, res) => {
    const { itbis } = req.body;
    let config = await Configuration.findOne({ key: 'itbis' });
    if (!config) {
        config = new Configuration({ key: 'itbis', value: itbis });
    } else {
        config.value = itbis;
    }
    await config.save();
    res.redirect('/admin/config');
};

module.exports = adminCtrl;

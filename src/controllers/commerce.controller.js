const User = require('../models/User');
const Order = require('../models/Order');
const Category = require('../models/Category');
const Product = require('../models/Product');
const upload = require('../middleware/upload');

const commerceCtrl = {};

commerceCtrl.renderHome = async (req, res) => {
    const orders = await Order.find({ commerce: req.session.user._id })
        .sort({ date: -1 })
        .populate('client', 'name surname') // Populate client info if needed
        .lean();

    // Calculate product count for each order
    for (let order of orders) {
        order.productCount = order.products.reduce((acc, p) => acc + p.quantity, 0);

        // Get commerce logo for display (it's the current user's logo)
        order.commerceLogo = req.session.user.commerceLogo;
        order.commerceName = req.session.user.commerceName;
    }

    res.render('commerce/home', { orders });
};

commerceCtrl.renderOrder = async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('client')
        .populate('delivery')
        .lean();

    // Get commerce info
    const commerce = await User.findById(order.commerce).lean();
    order.commerceName = commerce.commerceName;

    res.render('commerce/order-detail', { order });
};

commerceCtrl.assignDelivery = async (req, res) => {
    const { id } = req.params;

    // Find available delivery
    const delivery = await User.findOne({ role: 'delivery', status: 'active', isAvailable: true });

    if (!delivery) {
        req.flash('error_msg', 'No hay delivery disponible en este momento. Por favor intente más tarde.');
        return res.redirect(`/commerce/order/${id}`);
    }

    const order = await Order.findById(id);
    order.delivery = delivery._id;
    order.status = 'in_process';
    await order.save();

    delivery.isAvailable = false;
    await delivery.save();

    req.flash('success_msg', 'Delivery asignado exitosamente.');
    res.redirect(`/commerce/order/${id}`);
};

commerceCtrl.renderProfile = async (req, res) => {
    const commerce = await User.findById(req.session.user._id).lean();
    res.render('commerce/profile', { commerce });
};

commerceCtrl.updateProfile = async (req, res) => {
    const { openingTime, closingTime, phone, email } = req.body;
    const commerce = await User.findById(req.session.user._id);

    commerce.openingTime = openingTime;
    commerce.closingTime = closingTime;
    commerce.phone = phone;
    commerce.email = email;

    if (req.file) {
        commerce.commerceLogo = '/uploads/' + req.file.filename;
    }

    await commerce.save();
    req.session.user = commerce; // Update session
    res.redirect('/commerce/profile');
};

// Categories
commerceCtrl.renderCategories = async (req, res) => {
    const categories = await Category.find({ commerce: req.session.user._id }).lean();
    for (let cat of categories) {
        cat.productCount = await Product.countDocuments({ category: cat._id });
    }
    res.render('commerce/categories', { categories });
};

commerceCtrl.renderCreateCategory = (req, res) => {
    res.render('commerce/create-category');
};

commerceCtrl.createCategory = async (req, res) => {
    const { name, description } = req.body;
    const newCategory = new Category({
        name, description, commerce: req.session.user._id
    });
    await newCategory.save();
    res.redirect('/commerce/categories');
};

commerceCtrl.renderEditCategory = async (req, res) => {
    const category = await Category.findById(req.params.id).lean();
    res.render('commerce/edit-category', { category });
};

commerceCtrl.editCategory = async (req, res) => {
    const { name, description } = req.body;
    await Category.findByIdAndUpdate(req.params.id, { name, description });
    res.redirect('/commerce/categories');
};

commerceCtrl.deleteCategory = async (req, res) => {
    await Category.findByIdAndDelete(req.params.id);
    res.redirect('/commerce/categories');
};

// Products
commerceCtrl.renderProducts = async (req, res) => {
    const products = await Product.find({ commerce: req.session.user._id })
        .populate('category')
        .lean();
    res.render('commerce/products', { products });
};

commerceCtrl.renderCreateProduct = async (req, res) => {
    const categories = await Category.find({ commerce: req.session.user._id }).lean();
    res.render('commerce/create-product', { categories });
};

commerceCtrl.createProduct = async (req, res) => {
    const { name, description, price, category } = req.body;
    const newProduct = new Product({
        name, description, price, category, commerce: req.session.user._id
    });
    if (req.file) {
        newProduct.image = '/uploads/' + req.file.filename;
    }
    await newProduct.save();
    res.redirect('/commerce/products');
};

commerceCtrl.renderEditProduct = async (req, res) => {
    const product = await Product.findById(req.params.id).lean();
    const categories = await Category.find({ commerce: req.session.user._id }).lean();
    // Mark selected category
    categories.forEach(c => {
        if (c._id.toString() === product.category.toString()) c.selected = true;
    });
    res.render('commerce/edit-product', { product, categories });
};

commerceCtrl.editProduct = async (req, res) => {
    const { name, description, price, category } = req.body;
    const product = await Product.findById(req.params.id);
    product.name = name;
    product.description = description;
    product.price = price;
    product.category = category;
    if (req.file) {
        product.image = '/uploads/' + req.file.filename;
    }
    await product.save();
    res.redirect('/commerce/products');
};

commerceCtrl.deleteProduct = async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect('/commerce/products');
};

module.exports = commerceCtrl;

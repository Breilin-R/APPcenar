const User = require('../models/User');
const CommerceType = require('../models/CommerceType');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Address = require('../models/Address');
const Order = require('../models/Order');
const Configuration = require('../models/Configuration');

const clientCtrl = {};

clientCtrl.renderHome = async (req, res) => {
    const commerces = await User.find({ role: 'commerce', status: 'active' })
        .populate('commerceType')
        .lean();

    const user = await User.findById(req.session.user._id);
    commerces.forEach(c => {
        if (user.favorites && user.favorites.includes(c._id.toString())) {
            c.isFavorite = true;
        }
    });

    res.render('client/home', { commerces });
};

clientCtrl.renderCommercesByType = async (req, res) => {
    const { typeId } = req.params;
    const { search } = req.query;

    let query = { role: 'commerce', status: 'active', commerceType: typeId };
    if (search) {
        query.commerceName = { $regex: search, $options: 'i' };
    }

    const commerces = await User.find(query).lean();
    const type = await CommerceType.findById(typeId).lean();

    const user = await User.findById(req.session.user._id);
    commerces.forEach(c => {
        if (user.favorites && user.favorites.includes(c._id.toString())) {
            c.isFavorite = true;
        }
    });

    res.render('client/commerces', { commerces, type, search });
};

clientCtrl.toggleFavorite = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(req.session.user._id);

    if (user.favorites.includes(id)) {
        user.favorites = user.favorites.filter(fav => fav !== id);
    } else {
        user.favorites.push(id);
    }

    await user.save();
    req.session.user = user;
    const referer = req.get('Referer') || '/client';
    res.redirect(referer);
};

clientCtrl.renderCommerceCatalog = async (req, res) => {
    const { id } = req.params;
    const commerce = await User.findById(id).lean();

    const products = await Product.find({ commerce: id })
        .populate('category')
        .lean();

    const cart = req.session.cart || [];

    let cartSubtotal = 0;
    cart.forEach(item => {
        item.total = item.price * item.quantity;
        cartSubtotal += item.total;
    });

    res.render('client/catalog', { commerce, products, cart, cartSubtotal });
};

clientCtrl.addToCart = async (req, res) => {
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);

    if (!product) {
        req.flash('error_msg', 'Producto no encontrado.');
        return res.redirect('/client');
    }

    if (!req.session.cart) req.session.cart = [];

    const existingIndex = req.session.cart.findIndex(p => p.productId === productId);

    if (existingIndex !== -1) {
        req.session.cart[existingIndex].quantity += parseInt(quantity) || 1;
    } else {
        if (req.session.cart.length > 0) {
            const firstCommerce = req.session.cart[0].commerce;
            if (firstCommerce.toString() !== product.commerce.toString()) {
                req.session.cart = [];
                req.flash('error_msg', 'Solo puedes ordenar de un comercio a la vez.');
            }
        }

        req.session.cart.push({
            productId: product._id.toString(),
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: parseInt(quantity) || 1,
            commerce: product.commerce
        });
    }

    const referer = req.get('Referer') || `/client/commerce/${product.commerce}`;
    res.redirect(referer);
};

clientCtrl.updateCartQuantity = (req, res) => {
    const { productId, action } = req.params;

    if (req.session.cart) {
        const itemIndex = req.session.cart.findIndex(p => p.productId === productId);

        if (itemIndex !== -1) {
            if (action === 'increase') {
                req.session.cart[itemIndex].quantity += 1;
            } else if (action === 'decrease') {
                req.session.cart[itemIndex].quantity -= 1;

                if (req.session.cart[itemIndex].quantity <= 0) {
                    req.session.cart = req.session.cart.filter(p => p.productId !== productId);
                }
            }
        }
    }

    const referer = req.get('Referer') || '/client';
    res.redirect(referer);
};

clientCtrl.removeFromCart = (req, res) => {
    const { productId } = req.params;
    if (req.session.cart) {
        req.session.cart = req.session.cart.filter(p => p.productId !== productId);
    }
    const referer = req.get('Referer') || '/client';
    res.redirect(referer);
};

clientCtrl.renderCheckout = async (req, res) => {
    if (!req.session.cart || req.session.cart.length === 0) {
        return res.redirect('/client');
    }

    const addresses = await Address.find({ user: req.session.user._id }).lean();

    let subtotal = 0;
    req.session.cart.forEach(item => subtotal += item.price * item.quantity);

    const config = await Configuration.findOne({ key: 'itbis' });
    const itbisRate = config ? parseFloat(config.value) : 18;
    const itbis = (subtotal * itbisRate) / 100;
    const total = subtotal + itbis;

    const commerceId = req.session.cart[0].commerce;
    const commerce = await User.findById(commerceId).lean();

    res.render('client/checkout', {
        addresses, cart: req.session.cart, subtotal, itbis, total, commerce
    });
};

clientCtrl.createOrder = async (req, res) => {
    const { addressId } = req.body;

    if (!req.session.cart || req.session.cart.length === 0) {
        req.flash('error_msg', 'Tu carrito está vacío.');
        return res.redirect('/client');
    }

    if (!addressId) {
        req.flash('error_msg', 'Debes seleccionar una dirección de entrega.');
        return res.redirect('/client/checkout');
    }

    const address = await Address.findById(addressId);

    let subtotal = 0;
    req.session.cart.forEach(item => subtotal += item.price * item.quantity);

    const config = await Configuration.findOne({ key: 'itbis' });
    const itbisRate = config ? parseFloat(config.value) : 18;
    const itbis = (subtotal * itbisRate) / 100;
    const total = subtotal + itbis;

    const commerceId = req.session.cart[0].commerce;

    const newOrder = new Order({
        client: req.session.user._id,
        commerce: commerceId,
        address: `${address.name}: ${address.description}`,
        products: req.session.cart.map(p => ({
            product: p.productId,
            name: p.name,
            price: p.price,
            image: p.image,
            quantity: p.quantity
        })),
        subtotal,
        itbis,
        total,
        status: 'pending'
    });

    await newOrder.save();

    req.session.cart = [];
    req.flash('success_msg', 'Pedido realizado exitosamente.');
    res.redirect('/client/orders');
};

clientCtrl.renderProfile = async (req, res) => {
    const user = await User.findById(req.session.user._id).lean();
    res.render('client/profile', { user });
};

clientCtrl.updateProfile = async (req, res) => {
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
    res.redirect('/client/profile');
};

clientCtrl.renderOrders = async (req, res) => {
    const orders = await Order.find({ client: req.session.user._id })
        .sort({ date: -1 })
        .lean();

    for (let order of orders) {
        const commerce = await User.findById(order.commerce).lean();
        order.commerceName = commerce.commerceName;
        order.commerceLogo = commerce.commerceLogo;
        order.productCount = order.products.reduce((acc, p) => acc + p.quantity, 0);
    }

    res.render('client/orders', { orders });
};

clientCtrl.renderOrderDetail = async (req, res) => {
    const order = await Order.findById(req.params.id).lean();
    const commerce = await User.findById(order.commerce).lean();
    order.commerceName = commerce.commerceName;
    res.render('client/order-detail', { order });
};

clientCtrl.renderAddresses = async (req, res) => {
    const addresses = await Address.find({ user: req.session.user._id }).lean();
    res.render('client/addresses', { addresses });
};

clientCtrl.renderCreateAddress = (req, res) => {
    res.render('client/create-address');
};

clientCtrl.createAddress = async (req, res) => {
    const { name, description } = req.body;
    const newAddress = new Address({ name, description, user: req.session.user._id });
    await newAddress.save();
    res.redirect('/client/addresses');
};

clientCtrl.renderEditAddress = async (req, res) => {
    const address = await Address.findById(req.params.id).lean();
    res.render('client/edit-address', { address });
};

clientCtrl.editAddress = async (req, res) => {
    const { name, description } = req.body;
    await Address.findByIdAndUpdate(req.params.id, { name, description });
    res.redirect('/client/addresses');
};

clientCtrl.deleteAddress = async (req, res) => {
    const address = await Address.findById(req.params.id).lean();
    res.render('client/delete-address-confirm', { address });
};

clientCtrl.confirmDeleteAddress = async (req, res) => {
    await Address.findByIdAndDelete(req.params.id);
    res.redirect('/client/addresses');
};

clientCtrl.renderFavorites = async (req, res) => {
    const user = await User.findById(req.session.user._id);
    const favorites = await User.find({ _id: { $in: user.favorites } }).lean();
    res.render('client/favorites', { favorites });
};

module.exports = clientCtrl;

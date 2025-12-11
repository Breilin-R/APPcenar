const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
    renderHome,
    renderCommercesByType,
    renderCommerceCatalog,
    addToCart, updateCartQuantity, removeFromCart,
    renderCheckout, createOrder,
    renderProfile, updateProfile,
    renderOrders, renderOrderDetail,
    renderAddresses, renderCreateAddress, createAddress, renderEditAddress, editAddress, deleteAddress, confirmDeleteAddress,
    renderFavorites, toggleFavorite
} = require('../controllers/client.controller');

router.get('/', renderHome);
router.get('/type/:typeId', renderCommercesByType);
router.get('/commerce/:id', renderCommerceCatalog);
router.get('/favorites/add/:id', toggleFavorite);
router.get('/favorites/remove/:id', toggleFavorite);

router.post('/cart/add', addToCart);
router.get('/cart/update/:productId/:action', updateCartQuantity);
router.get('/cart/remove/:productId', removeFromCart);
router.get('/cart/clear', (req, res) => {
    req.session.cart = [];
    res.redirect('back');
});
router.get('/checkout', renderCheckout);
router.post('/checkout', createOrder);

router.get('/profile', renderProfile);
router.post('/profile', upload.single('profileImage'), updateProfile);

router.get('/orders', renderOrders);
router.get('/orders/:id', renderOrderDetail);

router.get('/addresses', renderAddresses);
router.get('/addresses/create', renderCreateAddress);
router.post('/addresses/create', createAddress);
router.get('/addresses/edit/:id', renderEditAddress);
router.post('/addresses/edit/:id', editAddress);
router.get('/addresses/delete/:id', deleteAddress);
router.post('/addresses/delete/:id', confirmDeleteAddress);

router.get('/favorites', renderFavorites);

module.exports = router;

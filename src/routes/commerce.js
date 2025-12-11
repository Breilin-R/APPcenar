const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { isAuthenticated } = require('../helpers/auth');
const {
    renderHome,
    renderOrder, assignDelivery,
    renderProfile, updateProfile,
    renderCategories, renderCreateCategory, createCategory, renderEditCategory, editCategory, deleteCategory,
    renderProducts, renderCreateProduct, createProduct, renderEditProduct, editProduct, deleteProduct
} = require('../controllers/commerce.controller');

router.get('/', isAuthenticated, renderHome);
router.get('/order/:id', isAuthenticated, renderOrder);
router.post('/order/assign/:id', isAuthenticated, assignDelivery);

router.get('/profile', isAuthenticated, renderProfile);
router.post('/profile', isAuthenticated, upload.single('commerceLogo'), updateProfile);

// Categories
router.get('/categories', isAuthenticated, renderCategories);
router.get('/categories/create', isAuthenticated, renderCreateCategory);
router.post('/categories/create', isAuthenticated, createCategory);
router.get('/categories/edit/:id', isAuthenticated, renderEditCategory);
router.post('/categories/edit/:id', isAuthenticated, editCategory);
router.get('/categories/delete/:id', isAuthenticated, deleteCategory);

// Products
router.get('/products', isAuthenticated, renderProducts);
router.get('/products/create', isAuthenticated, renderCreateProduct);
router.post('/products/create', isAuthenticated, upload.single('image'), createProduct);
router.get('/products/edit/:id', isAuthenticated, renderEditProduct);
router.post('/products/edit/:id', isAuthenticated, upload.single('image'), editProduct);
router.get('/products/delete/:id', isAuthenticated, deleteProduct);

module.exports = router;

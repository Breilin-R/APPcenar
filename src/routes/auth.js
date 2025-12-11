const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
    renderLogin, login, logout,
    renderRegister, register,
    renderRegisterCommerce, registerCommerce,
    activateAccount,
    renderForgotPassword, forgotPassword,
    renderResetPassword, resetPassword
} = require('../controllers/auth.controller');

router.get('/login', renderLogin);
router.post('/login', login);
router.get('/logout', logout);

router.get('/register', renderRegister);
router.post('/register', upload.single('profileImage'), register);

router.get('/register-commerce', renderRegisterCommerce);
router.post('/register-commerce', upload.single('commerceLogo'), registerCommerce);

router.get('/activate/:token', activateAccount);

router.get('/forgot-password', renderForgotPassword);
router.post('/forgot-password', forgotPassword);

router.get('/reset/:token', renderResetPassword);
router.post('/reset/:token', resetPassword);

module.exports = router;

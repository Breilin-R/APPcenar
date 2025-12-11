const User = require('../models/User');
const CommerceType = require('../models/CommerceType');
const { sendMail } = require('../helpers/mailer');
const crypto = require('crypto');

const authCtrl = {};

authCtrl.renderLogin = (req, res) => {
    if (req.session.user) {
        return res.redirect(getRedirectUrl(req.session.user.role));
    }
    res.render('auth/login');
};

authCtrl.login = async (req, res) => {
    const { email, password } = req.body;
    const errors = [];
    if (!email || !password) {
        errors.push({ text: 'Por favor ingrese correo y contraseña.' });
    }
    if (errors.length > 0) {
        return res.render('auth/login', { errors, email });
    }

    const user = await User.findOne({ $or: [{ email: email }, { username: email }] });
    if (!user) {
        req.flash('error_msg', 'Usuario no encontrado.');
        return res.redirect('/auth/login');
    }

    const match = await user.matchPassword(password);
    if (!match) {
        req.flash('error_msg', 'Contraseña incorrecta.');
        return res.redirect('/auth/login');
    }

    if (user.status === 'inactive') {
        req.flash('error_msg', 'Cuenta inactiva. Por favor revise su correo o contacte al administrador.');
        return res.redirect('/auth/login');
    }

    req.session.user = user;
    req.flash('success_msg', 'Has iniciado sesión.');
    res.redirect(getRedirectUrl(user.role));
};

authCtrl.logout = (req, res) => {
    req.session.destroy();
    res.redirect('/auth/login');
};

authCtrl.renderRegister = (req, res) => {
    res.render('auth/register');
};

authCtrl.register = async (req, res) => {
    const { name, surname, phone, email, username, role, password, confirm_password } = req.body;
    const errors = [];

    if (password != confirm_password) {
        errors.push({ text: 'Las contraseñas no coinciden.' });
    }
    if (password.length < 4) {
        errors.push({ text: 'La contraseña debe tener al menos 4 caracteres.' });
    }

    // Check duplicates
    const emailUser = await User.findOne({ email: email });
    if (emailUser) errors.push({ text: 'El correo ya está en uso.' });

    const usernameUser = await User.findOne({ username: username });
    if (usernameUser) errors.push({ text: 'El nombre de usuario ya está en uso.' });

    if (errors.length > 0) {
        return res.render('auth/register', {
            errors, name, surname, phone, email, username, role, password, confirm_password
        });
    }

    const newUser = new User({
        name, surname, phone, email, username, role, password,
        status: 'inactive'
    });

    if (req.file) {
        newUser.profileImage = '/uploads/' + req.file.filename;
    }

    newUser.password = await newUser.encryptPassword(password);

    // Activation Token
    const token = crypto.randomBytes(20).toString('hex');
    newUser.activationToken = token;

    await newUser.save();

    // Send Email
    const activationUrl = `http://${req.headers.host}/auth/activate/${token}`;
    await sendMail(email, 'Activación de Cuenta',
        `<p>Por favor haga clic en el siguiente enlace para activar su cuenta:</p><a href="${activationUrl}">${activationUrl}</a>`);

    req.flash('success_msg', 'Te has registrado. Por favor revisa tu correo para activar tu cuenta.');
    res.redirect('/auth/login');
};

authCtrl.renderRegisterCommerce = async (req, res) => {
    const commerceTypes = await CommerceType.find().lean();
    res.render('auth/register-commerce', { commerceTypes });
};

authCtrl.registerCommerce = async (req, res) => {
    const { commerceName, phone, email, openingTime, closingTime, commerceType, password, confirm_password } = req.body;
    const errors = [];

    if (password != confirm_password) {
        errors.push({ text: 'Las contraseñas no coinciden.' });
    }

    const emailUser = await User.findOne({ email: email });
    if (emailUser) errors.push({ text: 'El correo ya está en uso.' });

    if (errors.length > 0) {
        const commerceTypes = await CommerceType.find().lean();
        return res.render('auth/register-commerce', {
            errors, commerceTypes, commerceName, phone, email, openingTime, closingTime, commerceType
        });
    }

    const newUser = new User({
        commerceName, phone, email, openingTime, closingTime, commerceType, password,
        role: 'commerce',
        status: 'inactive'
    });

    if (req.file) {
        newUser.commerceLogo = '/uploads/' + req.file.filename;
    }

    newUser.password = await newUser.encryptPassword(password);

    const token = crypto.randomBytes(20).toString('hex');
    newUser.activationToken = token;

    await newUser.save();

    const activationUrl = `http://${req.headers.host}/auth/activate/${token}`;
    await sendMail(email, 'Activación de Cuenta',
        `<p>Por favor haga clic en el siguiente enlace para activar su cuenta:</p><a href="${activationUrl}">${activationUrl}</a>`);

    req.flash('success_msg', 'Te has registrado. Por favor revisa tu correo para activar tu cuenta.');
    res.redirect('/auth/login');
};

authCtrl.activateAccount = async (req, res) => {
    const { token } = req.params;
    const user = await User.findOne({ activationToken: token });
    if (!user) {
        req.flash('error_msg', 'Token inválido o expirado.');
        return res.redirect('/auth/login');
    }
    user.status = 'active';
    user.activationToken = undefined;
    await user.save();
    req.flash('success_msg', 'Cuenta activada. Ahora puedes iniciar sesión.');
    res.redirect('/auth/login');
};

authCtrl.renderForgotPassword = (req, res) => {
    res.render('auth/forgot-password');
};

authCtrl.forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ $or: [{ email: email }, { username: email }] });
    if (!user) {
        req.flash('error_msg', 'Usuario no encontrado.');
        return res.redirect('/auth/forgot-password');
    }

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    const resetUrl = `http://${req.headers.host}/auth/reset/${token}`;
    await sendMail(user.email, 'Restablecer Contraseña',
        `<p>Por favor haga clic en el siguiente enlace para restablecer su contraseña:</p><a href="${resetUrl}">${resetUrl}</a>`);

    req.flash('success_msg', 'Correo enviado con instrucciones.');
    res.redirect('/auth/login');
};

authCtrl.renderResetPassword = async (req, res) => {
    const { token } = req.params;
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) {
        req.flash('error_msg', 'El token es inválido o ha expirado.');
        return res.redirect('/auth/forgot-password');
    }
    res.render('auth/reset-password', { token });
};

authCtrl.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password, confirm_password } = req.body;

    if (password !== confirm_password) {
        req.flash('error_msg', 'Las contraseñas no coinciden.');
        return res.redirect(`/auth/reset/${token}`);
    }

    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) {
        req.flash('error_msg', 'El token es inválido o ha expirado.');
        return res.redirect('/auth/forgot-password');
    }

    user.password = await user.encryptPassword(password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    req.flash('success_msg', 'Contraseña actualizada.');
    res.redirect('/auth/login');
};

function getRedirectUrl(role) {
    switch (role) {
        case 'client': return '/client';
        case 'delivery': return '/delivery';
        case 'commerce': return '/commerce';
        case 'admin': return '/admin';
        default: return '/';
    }
}

module.exports = authCtrl;

const helpers = {};

helpers.isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    req.flash('error_msg', 'Not Authorized.');
    res.redirect('/auth/login');
};

helpers.isNotAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    res.redirect('/');
};

module.exports = helpers;

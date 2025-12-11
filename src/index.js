const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const morgan = require('morgan');
const connectDB = require('./config/database');
const dotenv = require('dotenv');

// Load config
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Settings
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs.engine({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./helpers/hbs')
}));
app.set('view engine', '.hbs');

// Middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
}));
app.use(flash());

// Global Variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || req.session.user || null;
    if (res.locals.user) {
        res.locals.isAdmin = res.locals.user.role === 'admin';
        res.locals.isClient = res.locals.user.role === 'client';
        res.locals.isCommerce = res.locals.user.role === 'commerce';
        res.locals.isDelivery = res.locals.user.role === 'delivery';
    }
    next();
});

// Routes
app.use(require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/admin', require('./routes/admin'));
app.use('/client', require('./routes/client'));
app.use('/commerce', require('./routes/commerce'));
app.use('/delivery', require('./routes/delivery'));

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Server Init
app.listen(app.get('port'), () => {
    console.log(`Server on port ${app.get('port')}`);
});

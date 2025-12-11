// Middleware de validación personalizado
const validationHelpers = {};

// Validar que los campos no estén vacíos
validationHelpers.validateRequired = (fields) => {
    return (req, res, next) => {
        const errors = [];

        fields.forEach(field => {
            if (!req.body[field] || req.body[field].trim() === '') {
                errors.push({
                    field: field,
                    text: `El campo ${field} es requerido.`
                });
            }
        });

        if (errors.length > 0) {
            req.validationErrors = errors;
        }

        next();
    };
};

// Validar email
validationHelpers.validateEmail = (field) => {
    return (req, res, next) => {
        const email = req.body[field];
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (email && !emailRegex.test(email)) {
            if (!req.validationErrors) req.validationErrors = [];
            req.validationErrors.push({
                field: field,
                text: 'El correo electrónico no es válido.'
            });
        }

        next();
    };
};

// Validar longitud mínima
validationHelpers.validateMinLength = (field, minLength) => {
    return (req, res, next) => {
        const value = req.body[field];

        if (value && value.length < minLength) {
            if (!req.validationErrors) req.validationErrors = [];
            req.validationErrors.push({
                field: field,
                text: `El campo ${field} debe tener al menos ${minLength} caracteres.`
            });
        }

        next();
    };
};

// Validar que las contraseñas coincidan
validationHelpers.validatePasswordMatch = (password, confirmPassword) => {
    return (req, res, next) => {
        if (req.body[password] !== req.body[confirmPassword]) {
            if (!req.validationErrors) req.validationErrors = [];
            req.validationErrors.push({
                field: confirmPassword,
                text: 'Las contraseñas no coinciden.'
            });
        }

        next();
    };
};

// Validar archivo (si es requerido)
validationHelpers.validateFile = (fieldName, required = false) => {
    return (req, res, next) => {
        if (required && !req.file) {
            if (!req.validationErrors) req.validationErrors = [];
            req.validationErrors.push({
                field: fieldName,
                text: `El archivo ${fieldName} es requerido.`
            });
        }

        next();
    };
};

// Middleware para verificar si hay errores
validationHelpers.handleValidationErrors = (redirectPath, renderView) => {
    return (req, res, next) => {
        if (req.validationErrors && req.validationErrors.length > 0) {
            const errors = req.validationErrors.map(e => ({ text: e.text }));

            if (renderView) {
                return res.render(renderView, {
                    errors,
                    ...req.body
                });
            }

            if (redirectPath) {
                req.flash('error_msg', req.validationErrors[0].text);
                return res.redirect(redirectPath);
            }
        }

        next();
    };
};

module.exports = validationHelpers;

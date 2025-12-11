const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
    renderHome,
    renderClients, toggleClientStatus,
    renderDeliveries, toggleDeliveryStatus,
    renderCommerces, toggleCommerceStatus,
    renderAdmins, renderCreateAdmin, createAdmin, renderEditAdmin, editAdmin, toggleAdminStatus,
    renderCommerceTypes, renderCreateCommerceType, createCommerceType, renderEditCommerceType, editCommerceType, deleteCommerceType,
    renderConfig, updateConfig
} = require('../controllers/admin.controller');

router.get('/', renderHome);

// Clients
router.get('/clients', renderClients);
router.get('/clients/toggle/:id', toggleClientStatus);

// Deliveries
router.get('/deliveries', renderDeliveries);
router.get('/deliveries/toggle/:id', toggleDeliveryStatus);

// Commerces
router.get('/commerces', renderCommerces);
router.get('/commerces/toggle/:id', toggleCommerceStatus);

// Admins
router.get('/admins', renderAdmins);
router.get('/admins/create', renderCreateAdmin);
router.post('/admins/create', createAdmin);
router.get('/admins/edit/:id', renderEditAdmin);
router.post('/admins/edit/:id', editAdmin);
router.get('/admins/toggle/:id', toggleAdminStatus);

// Commerce Types
router.get('/commerce-types', renderCommerceTypes);
router.get('/commerce-types/create', renderCreateCommerceType);
router.post('/commerce-types/create', upload.single('icon'), createCommerceType);
router.get('/commerce-types/edit/:id', renderEditCommerceType);
router.post('/commerce-types/edit/:id', upload.single('icon'), editCommerceType);
router.get('/commerce-types/delete/:id', deleteCommerceType);

// Config
router.get('/config', renderConfig);
router.post('/config', updateConfig);

module.exports = router;

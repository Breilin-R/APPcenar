const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
    renderHome,
    renderOrderDetail, completeOrder,
    renderProfile, updateProfile
} = require('../controllers/delivery.controller');

router.get('/', renderHome);
router.get('/order/:id', renderOrderDetail);
router.post('/order/complete/:id', completeOrder);

router.get('/profile', renderProfile);
router.post('/profile', upload.single('profileImage'), updateProfile);

module.exports = router;

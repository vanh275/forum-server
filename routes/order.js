const express = require('express');
const router = express.Router();
const { createOrder, checkIfPurchased, getMyOrder } = require('../controllers/order-controller');
const { authenticateToken } = require('../middleware/authenticateToken')

router.get('/orders/my-orders', authenticateToken, getMyOrder);
router.get('/orders/:productId/check-purchased', authenticateToken, checkIfPurchased);
router.post('/orders/:productId', authenticateToken, createOrder);

module.exports = router;
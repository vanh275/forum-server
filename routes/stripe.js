const express = require("express");
const router = express.Router();
const { createCheckoutSession, verifyCheckoutSession, } = require("../controllers/stripe-controller");
const { authenticateToken } = require("../middleware/authenticateToken");

router.post("/payment/create-checkout-session", authenticateToken, createCheckoutSession);

router.get('/payment/verify-session', authenticateToken, verifyCheckoutSession);
module.exports = router;

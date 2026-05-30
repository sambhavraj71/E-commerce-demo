const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  verifyPayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleStripeWebhook,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create-payment-intent', protect, createPaymentIntent);
router.post('/verify-payment', protect, verifyPayment);
router.post('/create-razorpay-order', protect, createRazorpayOrder);
router.post('/verify-razorpay', protect, verifyRazorpayPayment);
router.post('/stripe-webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

module.exports = router;
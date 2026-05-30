const stripe = require('../config/stripe');
const razorpay = require('../config/razorpay');
const Order = require('../models/Order');
const asyncHandler = require('express-async-handler');
const ApiResponse = require('../utils/apiResponse');

// @desc    Create Stripe payment intent
// @route   POST /api/payments/create-payment-intent
// @access  Private
const createPaymentIntent = asyncHandler(async (req, res) => {
  const { amount, currency = 'inr' } = req.body;
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents/paisa
    currency,
    metadata: {
      userId: req.user._id.toString()
    }
  });
  
  res.json({
    success: true,
    data: {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    }
  });
});

// @desc    Verify Stripe payment
// @route   POST /api/payments/verify-payment
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
  const { paymentIntentId, orderId } = req.body;
  
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  
  if (paymentIntent.status === 'succeeded') {
    const order = await Order.findById(orderId);
    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentStatus = 'paid';
      order.paymentResult = {
        id: paymentIntent.id,
        status: paymentIntent.status,
        updateTime: new Date()
      };
      await order.save();
    }
    
    ApiResponse.success(res, { orderId, status: 'success' }, 'Payment verified successfully');
  } else {
    res.status(400);
    throw new Error('Payment not successful');
  }
});

// @desc    Create Razorpay order
// @route   POST /api/payments/create-razorpay-order
// @access  Private
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount, currency = 'INR' } = req.body;
  
  const options = {
    amount: Math.round(amount * 100), // Amount in paisa
    currency,
    receipt: `receipt_${Date.now()}`,
    notes: {
      userId: req.user._id.toString()
    }
  };
  
  const order = await razorpay.orders.create(options);
  
  res.json({
    success: true,
    data: {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    }
  });
});

// @desc    Verify Razorpay payment
// @route   POST /api/payments/verify-razorpay
// @access  Private
const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
  
  const crypto = require('crypto');
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');
  
  if (expectedSignature === razorpay_signature) {
    const order = await Order.findById(orderId);
    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentStatus = 'paid';
      order.paymentResult = {
        id: razorpay_payment_id,
        status: 'success',
        updateTime: new Date()
      };
      await order.save();
    }
    
    ApiResponse.success(res, { orderId, status: 'success' }, 'Payment verified successfully');
  } else {
    res.status(400);
    throw new Error('Invalid payment signature');
  }
});

// @desc    Handle Stripe webhook
// @route   POST /api/payments/stripe-webhook
// @access  Public
const handleStripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }
  
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      // Update order status
      await Order.findOneAndUpdate(
        { 'paymentResult.id': paymentIntent.id },
        { isPaid: true, paidAt: Date.now(), paymentStatus: 'paid' }
      );
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  
  res.json({ received: true });
});

module.exports = {
  createPaymentIntent,
  verifyPayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleStripeWebhook
};
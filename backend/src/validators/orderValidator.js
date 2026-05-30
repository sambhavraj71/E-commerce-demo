const { body } = require('express-validator');

const validateOrder = [
  body('shippingAddress.fullName')
    .notEmpty().withMessage('Full name is required'),
  
  body('shippingAddress.addressLine1')
    .notEmpty().withMessage('Address is required'),
  
  body('shippingAddress.city')
    .notEmpty().withMessage('City is required'),
  
  body('shippingAddress.state')
    .notEmpty().withMessage('State is required'),
  
  body('shippingAddress.postalCode')
    .notEmpty().withMessage('Postal code is required')
    .matches(/^[0-9]{6}$/).withMessage('Invalid postal code'),
  
  body('shippingAddress.phone')
    .matches(/^[0-9]{10}$/).withMessage('Phone number must be 10 digits'),
  
  body('paymentMethod')
    .isIn(['cod', 'stripe', 'razorpay', 'paypal']).withMessage('Invalid payment method'),
  
  body('orderItems')
    .isArray({ min: 1 }).withMessage('At least one item is required')
];

const validateOrderStatus = [
  body('status')
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
    .withMessage('Invalid order status')
];

module.exports = {
  validateOrder,
  validateOrderStatus
};
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');
const { sendOrderConfirmation } = require('../utils/sendEmail');
const ApiResponse = require('../utils/apiResponse');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  });

  // Update product stock
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    product.stock -= item.quantity;
    await product.save();
  }

  // Clear user's cart
  await Cart.findOneAndDelete({ user: req.user._id });

  // Send order confirmation email
  await sendOrderConfirmation(req.user, order);

  ApiResponse.success(res, order, 'Order created successfully', 201);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('orderItems.product', 'name images');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check if user is authorized to view this order
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized');
  }

  ApiResponse.success(res, order, 'Order fetched successfully');
});

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort('-createdAt');
  
  ApiResponse.success(res, orders, 'Orders fetched successfully');
});

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;

  const query = {};
  if (req.query.status) query.orderStatus = req.query.status;

  const orders = await Order.find(query)
    .populate('user', 'name email')
    .sort('-createdAt')
    .limit(limit)
    .skip(startIndex);

  const total = await Order.countDocuments(query);

  ApiResponse.paginated(res, orders, page, limit, total, 'Orders fetched successfully');
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, trackingNumber } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.orderStatus = status;
  
  if (status === 'shipped' && trackingNumber) {
    order.trackingNumber = trackingNumber;
    order.shippingDate = Date.now();
  }
  
  if (status === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }

  if (status === 'cancelled') {
    order.cancelledAt = Date.now();
    // Restore stock
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      product.stock += item.quantity;
      await product.save();
    }
  }

  await order.save();
  ApiResponse.success(res, order, 'Order status updated successfully');
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized');
  }

  if (order.orderStatus !== 'pending') {
    res.status(400);
    throw new Error('Order cannot be cancelled');
  }

  order.orderStatus = 'cancelled';
  order.cancelledAt = Date.now();
  order.cancellationReason = req.body.reason || 'Cancelled by user';

  // Restore stock
  for (const item of order.orderItems) {
    const product = await Product.findById(item.product);
    product.stock += item.quantity;
    await product.save();
  }

  await order.save();
  ApiResponse.success(res, order, 'Order cancelled successfully');
});

module.exports = {
  createOrder,
  getOrderById,
  getUserOrders,
  getOrders,
  updateOrderStatus,
  cancelOrder,
};
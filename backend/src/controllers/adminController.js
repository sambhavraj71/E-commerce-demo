const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Setting = require('../models/Setting');
const asyncHandler = require('express-async-handler');
const ApiResponse = require('../utils/apiResponse');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments();
  
  const orders = await Order.find();
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayOrders = await Order.countDocuments({
    createdAt: { $gte: today }
  });
  
  const lowStockProducts = await Product.countDocuments({
    stock: { $lte: 10 }
  });
  
  const recentOrders = await Order.find()
    .sort('-createdAt')
    .limit(10)
    .populate('user', 'name email');
  
  const topProducts = await Order.aggregate([
    { $unwind: '$orderItems' },
    { $group: {
      _id: '$orderItems.product',
      totalSold: { $sum: '$orderItems.quantity' }
    }},
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
    { $lookup: {
      from: 'products',
      localField: '_id',
      foreignField: '_id',
      as: 'product'
    }}
  ]);
  
  res.json({
    success: true,
    data: {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      todayOrders,
      lowStockProducts,
      recentOrders,
      topProducts
    }
  });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const startIndex = (page - 1) * limit;
  
  const query = {};
  if (req.query.role) query.role = req.query.role;
  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } }
    ];
  }
  
  const users = await User.find(query)
    .select('-password')
    .sort('-createdAt')
    .limit(limit)
    .skip(startIndex);
  
  const total = await User.countDocuments(query);
  
  ApiResponse.paginated(res, users, page, limit, total, 'Users fetched successfully');
});

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/SuperAdmin
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const user = await User.findById(req.params.id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  user.role = role;
  await user.save();
  
  ApiResponse.success(res, user, 'User role updated successfully');
});

// @desc    Block/unblock user
// @route   PUT /api/admin/users/:id/block
// @access  Private/Admin
const blockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  user.isActive = !user.isActive;
  await user.save();
  
  ApiResponse.success(res, user, `User ${user.isActive ? 'unblocked' : 'blocked'} successfully`);
});

// @desc    Get site settings
// @route   GET /api/admin/settings
// @access  Private/Admin
const getSiteSettings = asyncHandler(async (req, res) => {
  const settings = await Setting.find();
  
  const settingsObj = {};
  settings.forEach(setting => {
    settingsObj[setting.key] = setting.value;
  });
  
  ApiResponse.success(res, settingsObj, 'Settings fetched successfully');
});

// @desc    Update site settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
const updateSiteSettings = asyncHandler(async (req, res) => {
  const updates = req.body;
  
  for (const [key, value] of Object.entries(updates)) {
    await Setting.findOneAndUpdate(
      { key },
      { value, type: typeof value },
      { upsert: true, new: true }
    );
  }
  
  ApiResponse.success(res, null, 'Settings updated successfully');
});

// @desc    Get sales report
// @route   GET /api/admin/reports/sales
// @access  Private/Admin
const getSalesReport = asyncHandler(async (req, res) => {
  const { startDate, endDate, groupBy = 'day' } = req.query;
  
  const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1));
  const end = endDate ? new Date(endDate) : new Date();
  
  let groupFormat;
  if (groupBy === 'day') {
    groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
  } else if (groupBy === 'month') {
    groupFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
  } else {
    groupFormat = { $dateToString: { format: '%Y', date: '$createdAt' } };
  }
  
  const salesData = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        orderStatus: { $ne: 'cancelled' }
      }
    },
    {
      $group: {
        _id: groupFormat,
        totalSales: { $sum: '$totalPrice' },
        orderCount: { $sum: 1 },
        averageOrderValue: { $avg: '$totalPrice' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  const summary = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        orderStatus: { $ne: 'cancelled' }
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalPrice' },
        totalOrders: { $sum: 1 },
        averageOrderValue: { $avg: '$totalPrice' },
        totalItems: { $sum: { $size: '$orderItems' } }
      }
    }
  ]);
  
  res.json({
    success: true,
    data: {
      summary: summary[0] || {},
      salesData,
      period: { start, end }
    }
  });
});

module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  blockUser,
  getSiteSettings,
  updateSiteSettings,
  getSalesReport
};
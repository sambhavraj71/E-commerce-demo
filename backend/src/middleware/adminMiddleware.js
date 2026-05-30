const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const checkAdminRole = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (user.role !== 'admin' && user.role !== 'super-admin') {
    res.status(403);
    throw new Error('Access denied. Admin only.');
  }
  next();
});

const checkSuperAdminRole = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (user.role !== 'super-admin') {
    res.status(403);
    throw new Error('Access denied. Super admin only.');
  }
  next();
});

module.exports = { checkAdminRole, checkSuperAdminRole };
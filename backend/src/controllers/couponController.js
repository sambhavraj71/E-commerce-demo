const Coupon = require('../models/Coupon');
const asyncHandler = require('express-async-handler');
const ApiResponse = require('../utils/apiResponse');

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
const getCoupons = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const startIndex = (page - 1) * limit;
  
  const coupons = await Coupon.find()
    .sort('-createdAt')
    .limit(limit)
    .skip(startIndex);
  
  const total = await Coupon.countDocuments();
  
  ApiResponse.paginated(res, coupons, page, limit, total, 'Coupons fetched successfully');
});

// @desc    Get coupon by code
// @route   GET /api/coupons/code/:code
// @access  Public
const getCouponByCode = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findOne({
    code: req.params.code.toUpperCase(),
    isActive: true,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() }
  });
  
  if (!coupon) {
    res.status(404);
    throw new Error('Invalid or expired coupon');
  }
  
  ApiResponse.success(res, coupon, 'Coupon fetched successfully');
});

// @desc    Create coupon
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    description,
    discountType,
    discountValue,
    minimumOrderAmount,
    maximumDiscountAmount,
    startDate,
    endDate,
    usageLimit,
    perUserLimit
  } = req.body;
  
  const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (existingCoupon) {
    res.status(400);
    throw new Error('Coupon code already exists');
  }
  
  const coupon = await Coupon.create({
    code: code.toUpperCase(),
    description,
    discountType,
    discountValue,
    minimumOrderAmount: minimumOrderAmount || 0,
    maximumDiscountAmount,
    startDate,
    endDate,
    usageLimit: usageLimit || 1,
    perUserLimit: perUserLimit || 1
  });
  
  ApiResponse.success(res, coupon, 'Coupon created successfully', 201);
});

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  
  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }
  
  const {
    description,
    discountType,
    discountValue,
    minimumOrderAmount,
    maximumDiscountAmount,
    startDate,
    endDate,
    usageLimit,
    perUserLimit,
    isActive
  } = req.body;
  
  coupon.description = description || coupon.description;
  coupon.discountType = discountType || coupon.discountType;
  coupon.discountValue = discountValue || coupon.discountValue;
  coupon.minimumOrderAmount = minimumOrderAmount !== undefined ? minimumOrderAmount : coupon.minimumOrderAmount;
  coupon.maximumDiscountAmount = maximumDiscountAmount !== undefined ? maximumDiscountAmount : coupon.maximumDiscountAmount;
  coupon.startDate = startDate || coupon.startDate;
  coupon.endDate = endDate || coupon.endDate;
  coupon.usageLimit = usageLimit !== undefined ? usageLimit : coupon.usageLimit;
  coupon.perUserLimit = perUserLimit !== undefined ? perUserLimit : coupon.perUserLimit;
  coupon.isActive = isActive !== undefined ? isActive : coupon.isActive;
  
  await coupon.save();
  ApiResponse.success(res, coupon, 'Coupon updated successfully');
});

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  
  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }
  
  await coupon.deleteOne();
  ApiResponse.success(res, null, 'Coupon deleted successfully');
});

// @desc    Validate coupon
// @route   POST /api/coupons/validate
// @access  Private
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, cartTotal, userId } = req.body;
  
  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() }
  });
  
  if (!coupon) {
    res.status(400);
    throw new Error('Invalid or expired coupon');
  }
  
  if (cartTotal < coupon.minimumOrderAmount) {
    res.status(400);
    throw new Error(`Minimum order amount of ₹${coupon.minimumOrderAmount} required`);
  }
  
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    res.status(400);
    throw new Error('Coupon usage limit reached');
  }
  
  if (userId && coupon.perUserLimit) {
    const userUsageCount = coupon.users.filter(id => id.toString() === userId).length;
    if (userUsageCount >= coupon.perUserLimit) {
      res.status(400);
      throw new Error('You have already used this coupon');
    }
  }
  
  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = (cartTotal * coupon.discountValue) / 100;
    if (coupon.maximumDiscountAmount) {
      discount = Math.min(discount, coupon.maximumDiscountAmount);
    }
  } else {
    discount = coupon.discountValue;
  }
  
  res.json({
    success: true,
    data: {
      coupon,
      discount,
      finalTotal: cartTotal - discount
    }
  });
});

module.exports = {
  getCoupons,
  getCouponByCode,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon
};
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const asyncHandler = require('express-async-handler');
const ApiResponse = require('../utils/apiResponse');

// @desc    Get product reviews
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  
  const reviews = await Review.find({ 
    product: req.params.productId,
    isApproved: true 
  })
    .populate('user', 'name avatar')
    .sort('-createdAt')
    .limit(limit)
    .skip(startIndex);
  
  const total = await Review.countDocuments({ 
    product: req.params.productId,
    isApproved: true 
  });
  
  ApiResponse.paginated(res, reviews, page, limit, total, 'Reviews fetched successfully');
});

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  const { productId, rating, title, comment } = req.body;
  
  // Check if user has purchased the product
  const hasPurchased = await Order.findOne({
    user: req.user._id,
    'orderItems.product': productId,
    orderStatus: 'delivered'
  });
  
  if (!hasPurchased) {
    res.status(400);
    throw new Error('You can only review products you have purchased');
  }
  
  // Check if user already reviewed
  const existingReview = await Review.findOne({
    product: productId,
    user: req.user._id
  });
  
  if (existingReview) {
    res.status(400);
    throw new Error('You have already reviewed this product');
  }
  
  const review = await Review.create({
    product: productId,
    user: req.user._id,
    rating,
    title,
    comment,
    isVerifiedPurchase: true
  });
  
  // Update product ratings
  const reviews = await Review.find({ product: productId, isApproved: true });
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;
  
  await Product.findByIdAndUpdate(productId, {
    ratings: averageRating,
    numReviews: reviews.length
  });
  
  ApiResponse.success(res, review, 'Review submitted successfully', 201);
});

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }
  
  if (review.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this review');
  }
  
  const { rating, title, comment } = req.body;
  review.rating = rating || review.rating;
  review.title = title || review.title;
  review.comment = comment || review.comment;
  
  await review.save();
  
  // Recalculate product ratings
  const reviews = await Review.find({ product: review.product, isApproved: true });
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;
  
  await Product.findByIdAndUpdate(review.product, {
    ratings: averageRating,
    numReviews: reviews.length
  });
  
  ApiResponse.success(res, review, 'Review updated successfully');
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }
  
  await review.deleteOne();
  
  // Recalculate product ratings
  const reviews = await Review.find({ product: review.product, isApproved: true });
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
  
  await Product.findByIdAndUpdate(review.product, {
    ratings: averageRating,
    numReviews: reviews.length
  });
  
  ApiResponse.success(res, null, 'Review deleted successfully');
});

// @desc    Mark review as helpful
// @route   PUT /api/reviews/:id/helpful
// @access  Private
const markHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }
  
  if (review.helpful.includes(req.user._id)) {
    review.helpful = review.helpful.filter(id => id.toString() !== req.user._id.toString());
  } else {
    review.helpful.push(req.user._id);
  }
  
  await review.save();
  
  ApiResponse.success(res, { helpfulCount: review.helpful.length }, 'Review marked as helpful');
});

module.exports = {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  markHelpful
};
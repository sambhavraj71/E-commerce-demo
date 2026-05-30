const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');
const ApiResponse = require('../utils/apiResponse');

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id })
    .populate('products.product', 'name price images sku stock ratings');
  
  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: req.user._id,
      products: []
    });
  }
  
  ApiResponse.success(res, wishlist, 'Wishlist fetched successfully');
});

// @desc    Add to wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  let wishlist = await Wishlist.findOne({ user: req.user._id });
  
  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: req.user._id,
      products: []
    });
  }
  
  const alreadyExists = wishlist.products.some(
    item => item.product.toString() === productId
  );
  
  if (alreadyExists) {
    res.status(400);
    throw new Error('Product already in wishlist');
  }
  
  wishlist.products.push({ product: productId });
  await wishlist.save();
  await wishlist.populate('products.product', 'name price images sku');
  
  ApiResponse.success(res, wishlist, 'Product added to wishlist');
});

// @desc    Remove from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id });
  
  if (!wishlist) {
    res.status(404);
    throw new Error('Wishlist not found');
  }
  
  wishlist.products = wishlist.products.filter(
    item => item.product.toString() !== req.params.productId
  );
  
  await wishlist.save();
  
  ApiResponse.success(res, wishlist, 'Product removed from wishlist');
});

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist
};
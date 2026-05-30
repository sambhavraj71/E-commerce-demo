const Product = require('../models/Product');
const Category = require('../models/Category');
const asyncHandler = require('express-async-handler');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload');
const ApiResponse = require('../utils/apiResponse');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const startIndex = (page - 1) * limit;

  let query = { isPublished: true };

  // Search
  if (req.query.search) {
    query.$text = { $search: req.query.search };
  }

  // Filter by category
  if (req.query.category) {
    const category = await Category.findOne({ slug: req.query.category });
    if (category) {
      query.category = category._id;
    }
  }

  // Filter by price
  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
  }

  // Filter by rating
  if (req.query.rating) {
    query.ratings = { $gte: parseFloat(req.query.rating) };
  }

  // Filter by tags
  if (req.query.tags) {
    query.tags = { $in: req.query.tags.split(',') };
  }

  // Sorting
  let sort = {};
  if (req.query.sort) {
    switch (req.query.sort) {
      case 'price_asc':
        sort.price = 1;
        break;
      case 'price_desc':
        sort.price = -1;
        break;
      case 'rating':
        sort.ratings = -1;
        break;
      case 'newest':
        sort.createdAt = -1;
        break;
      default:
        sort.createdAt = -1;
    }
  } else {
    sort.createdAt = -1;
  }

  const products = await Product.find(query)
    .populate('category', 'name slug')
    .sort(sort)
    .limit(limit)
    .skip(startIndex);

  const total = await Product.countDocuments(query);

  ApiResponse.paginated(res, products, page, limit, total, 'Products fetched successfully');
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name slug')
    .populate('reviews');

  if (product) {
    // Increment view count
    product.views = (product.views || 0) + 1;
    await product.save();

    ApiResponse.success(res, product, 'Product fetched successfully');
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Get product by slug
// @route   GET /api/products/slug/:slug
// @access  Public
const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug })
    .populate('category', 'name slug');

  if (product) {
    ApiResponse.success(res, product, 'Product fetched successfully');
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    category,
    stock,
    sku,
    comparePrice,
    brand,
    tags,
    variants,
  } = req.body;

  const product = await Product.create({
    name,
    description,
    price,
    category,
    stock,
    sku,
    comparePrice,
    brand,
    tags: tags ? tags.split(',') : [],
    variants: variants || [],
    user: req.user._id,
  });

  ApiResponse.success(res, product, 'Product created successfully', 201);
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = req.body.name || product.name;
    product.description = req.body.description || product.description;
    product.price = req.body.price || product.price;
    product.category = req.body.category || product.category;
    product.stock = req.body.stock || product.stock;
    product.comparePrice = req.body.comparePrice || product.comparePrice;
    product.brand = req.body.brand || product.brand;
    product.tags = req.body.tags ? req.body.tags.split(',') : product.tags;
    product.isPublished = req.body.isPublished !== undefined ? req.body.isPublished : product.isPublished;
    product.isFeatured = req.body.isFeatured !== undefined ? req.body.isFeatured : product.isFeatured;

    const updatedProduct = await product.save();
    ApiResponse.success(res, updatedProduct, 'Product updated successfully');
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    // Delete images from cloudinary
    for (const image of product.images) {
      if (image.publicId) {
        await deleteFromCloudinary(image.publicId);
      }
    }
    
    await product.deleteOne();
    ApiResponse.success(res, null, 'Product removed successfully');
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Upload product images
// @route   POST /api/products/:id/images
// @access  Private/Admin
const uploadProductImages = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error('No files uploaded');
  }

  const images = [];
  for (const file of req.files) {
    const result = await uploadToCloudinary(file.path, `textura/products/${product._id}`);
    images.push({
      url: result.url,
      publicId: result.publicId,
      isMain: images.length === 0, // First image is main
    });
  }

  product.images.push(...images);
  await product.save();

  ApiResponse.success(res, product.images, 'Images uploaded successfully');
});

// @desc    Delete product image
// @route   DELETE /api/products/:productId/images/:imageId
// @access  Private/Admin
const deleteProductImage = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const image = product.images.id(req.params.imageId);
  if (!image) {
    res.status(404);
    throw new Error('Image not found');
  }

  if (image.publicId) {
    await deleteFromCloudinary(image.publicId);
  }

  image.deleteOne();
  await product.save();

  ApiResponse.success(res, null, 'Image deleted successfully');
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true, isPublished: true })
    .limit(8)
    .populate('category', 'name');

  ApiResponse.success(res, products, 'Featured products fetched successfully');
});

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
const getRelatedProducts = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const relatedProducts = await Product.find({
    _id: { $ne: product._id },
    category: product.category,
    isPublished: true,
  })
    .limit(4)
    .populate('category', 'name');

  ApiResponse.success(res, relatedProducts, 'Related products fetched successfully');
});

module.exports = {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  deleteProductImage,
  getFeaturedProducts,
  getRelatedProducts,
};
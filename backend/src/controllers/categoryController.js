const Category = require('../models/Category');
const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload');
const ApiResponse = require('../utils/apiResponse');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true })
    .populate('parent')
    .sort('order');
  
  // Build hierarchy
  const categoryMap = {};
  categories.forEach(cat => {
    categoryMap[cat._id] = { ...cat._doc, children: [] };
  });
  
  const hierarchicalCategories = [];
  categories.forEach(cat => {
    if (cat.parent) {
      if (categoryMap[cat.parent]) {
        categoryMap[cat.parent].children.push(categoryMap[cat._id]);
      }
    } else {
      hierarchicalCategories.push(categoryMap[cat._id]);
    }
  });
  
  ApiResponse.success(res, hierarchicalCategories, 'Categories fetched successfully');
});

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
    .populate('parent');
  
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  
  const products = await Product.find({ category: category._id, isPublished: true })
    .limit(12);
  
  ApiResponse.success(res, { category, products }, 'Category fetched successfully');
});

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });
  
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  
  ApiResponse.success(res, category, 'Category fetched successfully');
});

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, parent, order } = req.body;
  
  let imageData = {};
  if (req.file) {
    const result = await uploadToCloudinary(req.file.path, 'textura/categories');
    imageData = {
      url: result.url,
      publicId: result.publicId
    };
  }
  
  let level = 0;
  if (parent) {
    const parentCategory = await Category.findById(parent);
    if (parentCategory) {
      level = parentCategory.level + 1;
    }
  }
  
  const category = await Category.create({
    name,
    description,
    image: imageData,
    parent,
    level,
    order: order || 0
  });
  
  ApiResponse.success(res, category, 'Category created successfully', 201);
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  
  const { name, description, parent, order, isActive } = req.body;
  
  category.name = name || category.name;
  category.description = description || category.description;
  category.parent = parent || category.parent;
  category.order = order !== undefined ? order : category.order;
  category.isActive = isActive !== undefined ? isActive : category.isActive;
  
  if (req.file) {
    if (category.image && category.image.publicId) {
      await deleteFromCloudinary(category.image.publicId);
    }
    const result = await uploadToCloudinary(req.file.path, 'textura/categories');
    category.image = {
      url: result.url,
      publicId: result.publicId
    };
  }
  
  await category.save();
  ApiResponse.success(res, category, 'Category updated successfully');
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  
  // Check if category has products
  const productCount = await Product.countDocuments({ category: category._id });
  if (productCount > 0) {
    res.status(400);
    throw new Error(`Cannot delete category with ${productCount} products. Reassign products first.`);
  }
  
  if (category.image && category.image.publicId) {
    await deleteFromCloudinary(category.image.publicId);
  }
  
  await category.deleteOne();
  ApiResponse.success(res, null, 'Category deleted successfully');
});

module.exports = {
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
};
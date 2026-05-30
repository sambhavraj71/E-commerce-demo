const Blog = require('../models/Blog');
const asyncHandler = require('express-async-handler');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload');
const ApiResponse = require('../utils/apiResponse');

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
const getBlogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  
  const query = {};
  if (req.query.published === 'true') {
    query.isPublished = true;
  }
  if (req.query.category) {
    query.categories = req.query.category;
  }
  if (req.query.search) {
    query.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { content: { $regex: req.query.search, $options: 'i' } }
    ];
  }
  
  const blogs = await Blog.find(query)
    .populate('author', 'name email avatar')
    .sort('-createdAt')
    .limit(limit)
    .skip(startIndex);
  
  const total = await Blog.countDocuments(query);
  
  ApiResponse.paginated(res, blogs, page, limit, total, 'Blogs fetched successfully');
});

// @desc    Get blog by slug
// @route   GET /api/blogs/:slug
// @access  Public
const getBlogBySlug = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug })
    .populate('author', 'name email avatar');
  
  if (!blog) {
    res.status(404);
    throw new Error('Blog not found');
  }
  
  // Increment views
  blog.views += 1;
  await blog.save();
  
  ApiResponse.success(res, blog, 'Blog fetched successfully');
});

// @desc    Create blog
// @route   POST /api/blogs
// @access  Private/Admin
const createBlog = asyncHandler(async (req, res) => {
  const { title, excerpt, content, categories, tags, seoTitle, seoDescription, isPublished } = req.body;
  
  let imageData = {};
  if (req.file) {
    const result = await uploadToCloudinary(req.file.path, 'textura/blogs');
    imageData = {
      url: result.url,
      publicId: result.publicId
    };
  }
  
  const blog = await Blog.create({
    title,
    excerpt,
    content,
    featuredImage: imageData,
    author: req.user._id,
    categories: categories ? categories.split(',') : [],
    tags: tags ? tags.split(',') : [],
    seoTitle,
    seoDescription,
    isPublished: isPublished === 'true',
    publishedAt: isPublished === 'true' ? new Date() : null
  });
  
  ApiResponse.success(res, blog, 'Blog created successfully', 201);
});

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private/Admin
const updateBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  
  if (!blog) {
    res.status(404);
    throw new Error('Blog not found');
  }
  
  const { title, excerpt, content, categories, tags, seoTitle, seoDescription, isPublished } = req.body;
  
  blog.title = title || blog.title;
  blog.excerpt = excerpt || blog.excerpt;
  blog.content = content || blog.content;
  blog.categories = categories ? categories.split(',') : blog.categories;
  blog.tags = tags ? tags.split(',') : blog.tags;
  blog.seoTitle = seoTitle || blog.seoTitle;
  blog.seoDescription = seoDescription || blog.seoDescription;
  
  if (isPublished !== undefined && isPublished !== blog.isPublished) {
    blog.isPublished = isPublished === 'true';
    blog.publishedAt = blog.isPublished ? new Date() : null;
  }
  
  if (req.file) {
    if (blog.featuredImage && blog.featuredImage.publicId) {
      await deleteFromCloudinary(blog.featuredImage.publicId);
    }
    const result = await uploadToCloudinary(req.file.path, 'textura/blogs');
    blog.featuredImage = {
      url: result.url,
      publicId: result.publicId
    };
  }
  
  await blog.save();
  ApiResponse.success(res, blog, 'Blog updated successfully');
});

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private/Admin
const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  
  if (!blog) {
    res.status(404);
    throw new Error('Blog not found');
  }
  
  if (blog.featuredImage && blog.featuredImage.publicId) {
    await deleteFromCloudinary(blog.featuredImage.publicId);
  }
  
  await blog.deleteOne();
  ApiResponse.success(res, null, 'Blog deleted successfully');
});

module.exports = {
  getBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog
};
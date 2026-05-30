const express = require('express');
const router = express.Router();
const {
  getBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
} = require('../controllers/blogController');
const { protect, admin } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');

router.get('/', getBlogs);
router.get('/:slug', getBlogBySlug);
router.post('/', protect, admin, uploadSingle, createBlog);
router.put('/:id', protect, admin, uploadSingle, updateBlog);
router.delete('/:id', protect, admin, deleteBlog);

module.exports = router;
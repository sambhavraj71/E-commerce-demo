const express = require('express');
const router = express.Router();
const {
  getBanners,
  getActiveBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} = require('../controllers/bannerController');
const { protect, admin } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');

router.get('/', getBanners);
router.get('/active', getActiveBanners);
router.post('/', protect, admin, uploadSingle, createBanner);
router.put('/:id', protect, admin, uploadSingle, updateBanner);
router.delete('/:id', protect, admin, deleteBanner);

module.exports = router;
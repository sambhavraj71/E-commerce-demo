const Banner = require('../models/Banner');
const asyncHandler = require('express-async-handler');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload');
const ApiResponse = require('../utils/apiResponse');

// @desc    Get all banners
// @route   GET /api/banners
// @access  Public
const getBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find().sort('order');
  ApiResponse.success(res, banners, 'Banners fetched successfully');
});

// @desc    Get active banners for frontend
// @route   GET /api/banners/active
// @access  Public
const getActiveBanners = asyncHandler(async (req, res) => {
  const now = new Date();
  const banners = await Banner.find({
    isActive: true,
    $or: [
      { startDate: { $lte: now } },
      { startDate: null }
    ],
    $or: [
      { endDate: { $gte: now } },
      { endDate: null }
    ]
  }).sort('order');
  
  ApiResponse.success(res, banners, 'Active banners fetched successfully');
});

// @desc    Create banner
// @route   POST /api/banners
// @access  Private/Admin
const createBanner = asyncHandler(async (req, res) => {
  const { title, subtitle, link, buttonText, position, order, deviceType } = req.body;
  
  let imageData = {};
  if (req.file) {
    const result = await uploadToCloudinary(req.file.path, 'textura/banners');
    imageData = {
      url: result.url,
      publicId: result.publicId
    };
  }
  
  const banner = await Banner.create({
    title,
    subtitle,
    image: imageData,
    link,
    buttonText,
    position,
    order: order || 0,
    deviceType: deviceType || 'all',
    isActive: req.body.isActive === 'true'
  });
  
  ApiResponse.success(res, banner, 'Banner created successfully', 201);
});

// @desc    Update banner
// @route   PUT /api/banners/:id
// @access  Private/Admin
const updateBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  
  if (!banner) {
    res.status(404);
    throw new Error('Banner not found');
  }
  
  const { title, subtitle, link, buttonText, position, order, deviceType, isActive } = req.body;
  
  banner.title = title || banner.title;
  banner.subtitle = subtitle || banner.subtitle;
  banner.link = link || banner.link;
  banner.buttonText = buttonText || banner.buttonText;
  banner.position = position || banner.position;
  banner.order = order !== undefined ? order : banner.order;
  banner.deviceType = deviceType || banner.deviceType;
  banner.isActive = isActive === 'true' ? true : isActive === 'false' ? false : banner.isActive;
  
  if (req.file) {
    if (banner.image && banner.image.publicId) {
      await deleteFromCloudinary(banner.image.publicId);
    }
    const result = await uploadToCloudinary(req.file.path, 'textura/banners');
    banner.image = {
      url: result.url,
      publicId: result.publicId
    };
  }
  
  await banner.save();
  ApiResponse.success(res, banner, 'Banner updated successfully');
});

// @desc    Delete banner
// @route   DELETE /api/banners/:id
// @access  Private/Admin
const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  
  if (!banner) {
    res.status(404);
    throw new Error('Banner not found');
  }
  
  if (banner.image && banner.image.publicId) {
    await deleteFromCloudinary(banner.image.publicId);
  }
  
  await banner.deleteOne();
  ApiResponse.success(res, null, 'Banner deleted successfully');
});

module.exports = {
  getBanners,
  getActiveBanners,
  createBanner,
  updateBanner,
  deleteBanner
};
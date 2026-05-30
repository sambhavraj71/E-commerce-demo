const User = require('../models/User');
const Address = require('../models/Address');
const asyncHandler = require('express-async-handler');

// Helper function for API responses
const sendResponse = (res, statusCode, success, message, data = null) => {
  res.status(statusCode).json({
    success,
    message,
    data,
  });
};

// @desc    Get all addresses
// @route   GET /api/users/addresses
// @access  Private
const getAddresses = asyncHandler(async (req, res) => {
  console.log('Fetching addresses for user:', req.user._id);
  const addresses = await Address.find({ user: req.user._id });
  sendResponse(res, 200, true, 'Addresses fetched successfully', addresses);
});

// @desc    Add address
// @route   POST /api/users/addresses
// @access  Private
const addAddress = asyncHandler(async (req, res) => {
  console.log('Adding address for user:', req.user._id);
  console.log('Address data:', req.body);
  
  const { fullName, addressLine1, addressLine2, city, state, postalCode, country, phone, addressType, isDefault } = req.body;
  
  // Validation
  if (!fullName || !addressLine1 || !city || !state || !postalCode || !phone) {
    return sendResponse(res, 400, false, 'Please provide all required fields');
  }
  
  // If this is default, remove default from others
  if (isDefault) {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
  }
  
  const address = await Address.create({
    user: req.user._id,
    fullName,
    addressLine1,
    addressLine2: addressLine2 || '',
    city,
    state,
    postalCode,
    country: country || 'India',
    phone,
    addressType: addressType || 'home',
    isDefault: isDefault || false,
  });
  
  // Add address to user's addresses array
  await User.findByIdAndUpdate(req.user._id, {
    $push: { addresses: address._id }
  });
  
  sendResponse(res, 201, true, 'Address added successfully', address);
});

// @desc    Update address
// @route   PUT /api/users/addresses/:id
// @access  Private
const updateAddress = asyncHandler(async (req, res) => {
  console.log('Updating address:', req.params.id);
  
  const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
  
  if (!address) {
    return sendResponse(res, 404, false, 'Address not found');
  }
  
  const { fullName, addressLine1, addressLine2, city, state, postalCode, country, phone, addressType, isDefault } = req.body;
  
  if (isDefault && !address.isDefault) {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
  }
  
  address.fullName = fullName || address.fullName;
  address.addressLine1 = addressLine1 || address.addressLine1;
  address.addressLine2 = addressLine2 || address.addressLine2;
  address.city = city || address.city;
  address.state = state || address.state;
  address.postalCode = postalCode || address.postalCode;
  address.country = country || address.country;
  address.phone = phone || address.phone;
  address.addressType = addressType || address.addressType;
  address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;
  
  await address.save();
  sendResponse(res, 200, true, 'Address updated successfully', address);
});

// @desc    Delete address
// @route   DELETE /api/users/addresses/:id
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
  console.log('Deleting address:', req.params.id);
  
  const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  
  if (!address) {
    return sendResponse(res, 404, false, 'Address not found');
  }
  
  await User.findByIdAndUpdate(req.user._id, {
    $pull: { addresses: address._id }
  });
  
  sendResponse(res, 200, true, 'Address deleted successfully');
});

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  
  if (!user) {
    return sendResponse(res, 404, false, 'User not found');
  }
  
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return sendResponse(res, 401, false, 'Current password is incorrect');
  }
  
  user.password = newPassword;
  await user.save();
  
  sendResponse(res, 200, true, 'Password changed successfully');
});

module.exports = {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  changePassword,
};
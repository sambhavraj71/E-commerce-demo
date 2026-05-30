const cloudinary = require('../config/cloudinary');
const logger = require('./logger');

const uploadToCloudinary = async (file, folder = 'textura') => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: folder,
      use_filename: true,
      unique_filename: true,
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    logger.error(`Cloudinary upload error: ${error.message}`);
    throw error;
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    logger.error(`Cloudinary delete error: ${error.message}`);
    throw error;
  }
};

const uploadMultipleToCloudinary = async (files, folder = 'textura') => {
  const uploadPromises = files.map(file => uploadToCloudinary(file.path, folder));
  return Promise.all(uploadPromises);
};

module.exports = { uploadToCloudinary, deleteFromCloudinary, uploadMultipleToCloudinary };
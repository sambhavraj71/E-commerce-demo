const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  subtitle: String,
  image: {
    url: String,
    publicId: String,
  },
  link: String,
  buttonText: String,
  position: {
    type: String,
    enum: ['home_top', 'home_middle', 'home_bottom', 'sidebar'],
    default: 'home_top',
  },
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  startDate: Date,
  endDate: Date,
  deviceType: {
    type: String,
    enum: ['all', 'mobile', 'desktop'],
    default: 'all',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Banner', bannerSchema);
const mongoose = require('mongoose');

const returnRequestSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    quantity: Number,
    reason: String,
  }],
  reason: {
    type: String,
    required: true,
  },
  description: String,
  images: [String],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending',
  },
  refundAmount: Number,
  refundMethod: {
    type: String,
    enum: ['original', 'wallet', 'bank'],
  },
  adminNote: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('ReturnRequest', returnRequestSchema);
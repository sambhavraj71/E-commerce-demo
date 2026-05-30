const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
    unique: true,
  },
  slug: String,
  sku: {
    type: String,
    unique: true,
    required: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  shortDescription: {
    type: String,
    maxlength: 200,
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: 0,
  },
  comparePrice: {
    type: Number,
    min: 0,
  },
  costPerItem: {
    type: Number,
    min: 0,
  },
  images: [{
    url: String,
    publicId: String,
    isMain: Boolean,
  }],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },
  brand: String,
  tags: [String],
  variants: [{
    name: String,
    options: [{
      value: String,
      price: Number,
      sku: String,
      stock: Number,
    }],
  }],
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  lowStockAlert: {
    type: Number,
    default: 10,
  },
  weight: {
    type: Number,
    help: 'Weight in grams',
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
  },
  ratings: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
  seoTitle: String,
  seoDescription: String,
  metaKeywords: [String],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Create product slug from name
productSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Generate SKU if not provided
productSchema.pre('save', function(next) {
  if (!this.sku) {
    this.sku = `TXT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

// Virtual for reviews
productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
  justOne: false,
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.comparePrice && this.comparePrice > this.price) {
    return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
  }
  return 0;
});

module.exports = mongoose.model('Product', productSchema);
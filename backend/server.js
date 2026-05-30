const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
// Add this after requiring dotenv
const path = require('path');

// Production settings
const isProduction = process.env.NODE_ENV === 'production';

// Trust proxy (for Render)
if (isProduction) {
  app.set('trust proxy', 1);
}

// Update CORS for production
const allowedOrigins = [
  'https://textura-frontend.onrender.com',
  'https://textura-admin.onrender.com',
  'http://localhost:3000',
  'http://localhost:3001'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1 && !isProduction) {
      return callback(null, true);
    }
    if (allowedOrigins.indexOf(origin) !== -1 || !isProduction) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
}));

// ========== CLOUDINARY CONFIGURATION ==========
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer to use Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'textura/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }]
  }
});

const upload = multer({ storage: storage });

// ========== MODELS ==========
// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  role: { type: String, default: 'user' },
  isVerified: { type: Boolean, default: false },
  addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Address' }],
  createdAt: { type: Date, default: Date.now }
});

// Address Schema
const addressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String, default: '' },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, default: 'India' },
  phone: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
  addressType: { type: String, enum: ['home', 'work', 'other'], default: 'home' }
}, { timestamps: true });

// Wishlist Schema
const wishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    addedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, default: '' },
  images: [{
    url: String,
    publicId: String
  }],
  stock: { type: Number, default: 0 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  isFeatured: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: true },
  ratings: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Category Schema
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  createdAt: { type: Date, default: Date.now }
});

// Order Schema
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderItems: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    quantity: Number,
    price: Number,
    image: String
  }],
  shippingAddress: {
    fullName: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    postalCode: String,
    phone: String
  },
  paymentMethod: { type: String, default: 'cod' },
  itemsPrice: { type: Number, default: 0 },
  taxPrice: { type: Number, default: 0 },
  shippingPrice: { type: Number, default: 0 },
  totalPrice: { type: Number, default: 0 },
  orderStatus: { 
    type: String, 
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Address = mongoose.model('Address', addressSchema);
const Wishlist = mongoose.model('Wishlist', wishlistSchema);
const Product = mongoose.model('Product', productSchema);
const Category = mongoose.model('Category', categorySchema);
const Order = mongoose.model('Order', orderSchema);

// ========== HELPER FUNCTIONS ==========
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// ========== HEALTH CHECK ==========
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running', timestamp: new Date() });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'OK', message: 'Textura API is running' });
});

// ========== AUTH ROUTES ==========
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    
    const hashedPassword = await hashPassword(password);
    
    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword, 
      phone 
    });
    
    const token = jwt.sign(
      { id: user._id, email: user.email }, 
      process.env.JWT_SECRET || 'your_secret_key_here', 
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user._id, email: user.email }, 
      process.env.JWT_SECRET || 'your_secret_key_here', 
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== AUTH MIDDLEWARE ==========
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key_here');
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }
  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

// ========== PROFILE ROUTES ==========
app.get('/api/auth/profile', protect, async (req, res) => {
  try {
    res.json({ success: true, data: req.user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/auth/profile', protect, async (req, res) => {
  try {
    console.log('Profile update request for user:', req.user._id);
    console.log('Update data:', req.body);
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (req.body.name) user.name = req.body.name;
    if (req.body.phone) user.phone = req.body.phone;
    
    await user.save();
    
    console.log('User updated successfully');
    
    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        phone: user.phone, 
        role: user.role 
      } 
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== ADDRESS ROUTES ==========
app.get('/api/users/addresses', protect, async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id });
    res.json({ success: true, data: addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/users/addresses', protect, async (req, res) => {
  try {
    const { fullName, addressLine1, addressLine2, city, state, postalCode, phone, addressType, isDefault } = req.body;
    
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
      phone,
      addressType: addressType || 'home',
      isDefault: isDefault || false
    });
    
    res.status(201).json({ success: true, message: 'Address added', data: address });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/users/addresses/:id', protect, async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }
    
    const { fullName, addressLine1, addressLine2, city, state, postalCode, phone, addressType, isDefault } = req.body;
    
    if (isDefault && !address.isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }
    
    address.fullName = fullName || address.fullName;
    address.addressLine1 = addressLine1 || address.addressLine1;
    address.addressLine2 = addressLine2 || address.addressLine2;
    address.city = city || address.city;
    address.state = state || address.state;
    address.postalCode = postalCode || address.postalCode;
    address.phone = phone || address.phone;
    address.addressType = addressType || address.addressType;
    address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;
    
    await address.save();
    res.json({ success: true, message: 'Address updated', data: address });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/users/addresses/:id', protect, async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }
    res.json({ success: true, message: 'Address deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== USERS ROUTE (for Admin Panel) ==========
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, users: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== ORDERS ROUTES ==========

// Get all orders (Admin only)
app.get('/api/orders', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort('-createdAt');
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user's own orders
app.get('/api/orders/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort('-createdAt');
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new order
app.post('/api/orders', protect, async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items' });
    }

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      orderStatus: 'pending',
      paymentStatus: 'pending'
    });

    // Update product stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    res.status(201).json({ success: true, data: order, message: 'Order placed successfully' });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single order
app.get('/api/orders/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('orderItems.product', 'name price images');
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    if (order.user._id.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin' && 
        req.user.role !== 'super-admin') {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    
    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update order status (Admin only)
// Update order status (Admin only)
app.put('/api/orders/:id/status', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    order.orderStatus = status;
    await order.save();
    
    res.json({ success: true, message: 'Order status updated', data: order });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Cancel order
app.put('/api/orders/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    
    if (order.orderStatus !== 'pending') {
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled' });
    }
    
    order.orderStatus = 'cancelled';
    
    // Restore stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }
    
    await order.save();
    res.json({ success: true, message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== WISHLIST ROUTES ==========
// Get wishlist
app.get('/api/wishlist', protect, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate('products.product', 'name price images stock comparePrice');
    
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }
    
    res.json({ success: true, data: wishlist });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add to wishlist
app.post('/api/wishlist', protect, async (req, res) => {
  try {
    const { productId } = req.body;
    
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }
    
    const alreadyExists = wishlist.products.some(
      item => item.product.toString() === productId
    );
    
    if (alreadyExists) {
      return res.status(400).json({ success: false, message: 'Product already in wishlist' });
    }
    
    wishlist.products.push({ product: productId });
    await wishlist.save();
    await wishlist.populate('products.product', 'name price images stock comparePrice');
    
    res.json({ success: true, message: 'Added to wishlist', data: wishlist });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove from wishlist
app.delete('/api/wishlist/:productId', protect, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist not found' });
    }
    
    wishlist.products = wishlist.products.filter(
      item => item.product.toString() !== req.params.productId
    );
    
    await wishlist.save();
    
    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== PRODUCT ROUTES ==========
// Get all products
// Get all products with category filter
app.get('/api/products', async (req, res) => {
  try {
    let query = { isPublished: true };
    
    // Category filter
    if (req.query.category) {
      // Convert slug to actual category name
      const categoryMap = {
        'custom-apparel': 'Custom Apparel',
        'print-on-demand': 'Print on Demand',
        'uniforms': 'Uniforms',
        'corporate-gifts': 'Corporate Gifts',
        'accessories': 'Accessories'
      };
      const categoryName = categoryMap[req.query.category];
      if (categoryName) {
        const category = await Category.findOne({ name: categoryName });
        if (category) {
          query.category = category._id;
        }
      }
    }
    
    // Price filter
    if (req.query.minPrice) {
      query.price = { ...query.price, $gte: parseInt(req.query.minPrice) };
    }
    if (req.query.maxPrice) {
      query.price = { ...query.price, $lte: parseInt(req.query.maxPrice) };
    }
    
    // Sorting
    let sort = {};
    if (req.query.sort === 'price_asc') sort.price = 1;
    else if (req.query.sort === 'price_desc') sort.price = -1;
    else if (req.query.sort === 'rating') sort.ratings = -1;
    else sort.createdAt = -1;
    
    const products = await Product.find(query)
      .populate('category', 'name')
      .sort(sort);
    
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get featured products
app.get('/api/products/featured', async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true, isPublished: true }).limit(8).populate('category', 'name');
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single product
// Get single product with populated category
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name _id');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create product (Admin only)
app.post('/api/products', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to add products' });
    }
    
    const { name, price, description, stock, category, isFeatured, isPublished } = req.body;
    
    if (!name || !price) {
      return res.status(400).json({ success: false, message: 'Name and price are required' });
    }
    
    const product = await Product.create({
      name,
      price,
      description: description || '',
      stock: stock || 0,
      category: category || null,
      isFeatured: isFeatured || false,
      isPublished: isPublished !== undefined ? isPublished : true
    });
    
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update product (Admin only)
app.put('/api/products/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update products' });
    }
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    const { name, price, description, stock, category, isFeatured, isPublished } = req.body;
    
    if (name) product.name = name;
    if (price) product.price = price;
    if (description) product.description = description;
    if (stock !== undefined) product.stock = stock;
    if (category) product.category = category;
    if (isFeatured !== undefined) product.isFeatured = isFeatured;
    if (isPublished !== undefined) product.isPublished = isPublished;
    
    await product.save();
    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete product (Admin only)
app.delete('/api/products/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete products' });
    }
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    // Delete images from Cloudinary
    for (const image of product.images) {
      if (image.publicId) {
        await cloudinary.uploader.destroy(image.publicId);
      }
    }
    
    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Upload product images to Cloudinary
app.post('/api/products/:id/images', protect, upload.array('images', 5), async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    const images = req.files.map(file => ({
      url: file.path,
      publicId: file.filename
    }));
    
    product.images.push(...images);
    await product.save();
    
    res.json({ success: true, data: product, message: 'Images uploaded successfully' });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete product image from Cloudinary
app.delete('/api/products/:productId/images/:imageId', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    const image = product.images.id(req.params.imageId);
    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }
    
    if (image.publicId) {
      await cloudinary.uploader.destroy(image.publicId);
    }
    
    image.remove();
    await product.save();
    
    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});


// ========== REVIEW ROUTES ==========

// Get product reviews
app.get('/api/reviews/product/:productId', async (req, res) => {
  try {
    const Review = mongoose.model('Review', new mongoose.Schema({
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rating: Number,
      title: String,
      comment: String,
      helpful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      createdAt: { type: Date, default: Date.now }
    }));
    
    const reviews = await Review.find({ product: req.params.productId, isApproved: true })
      .populate('user', 'name')
      .sort('-createdAt');
    
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create review
app.post('/api/reviews', protect, async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;
    
    const Review = mongoose.model('Review', new mongoose.Schema({
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rating: Number,
      title: String,
      comment: String,
      helpful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      isApproved: { type: Boolean, default: true },
      createdAt: { type: Date, default: Date.now }
    }));
    
    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating,
      title,
      comment,
      isApproved: true
    });
    
    await review.populate('user', 'name');
    
    // Update product ratings
    const Product = mongoose.model('Product');
    const allReviews = await Review.find({ product: productId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    
    await Product.findByIdAndUpdate(productId, {
      ratings: avgRating,
      numReviews: allReviews.length
    });
    
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark review as helpful
app.put('/api/reviews/:id/helpful', protect, async (req, res) => {
  try {
    const Review = mongoose.model('Review');
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    
    if (review.helpful.includes(req.user._id)) {
      review.helpful = review.helpful.filter(id => id.toString() !== req.user._id.toString());
    } else {
      review.helpful.push(req.user._id);
    }
    
    await review.save();
    res.json({ success: true, helpfulCount: review.helpful.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// ========== CATEGORY ROUTES ==========
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/categories', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    const { name, description } = req.body;
    const category = await Category.create({ name, description });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== UPDATE ADMIN ROLE ==========
app.post('/api/set-admin', async (req, res) => {
  try {
    const result = await User.updateOne(
      { email: 'admin@textura.com' },
      { role: 'super-admin' }
    );
    res.json({ success: true, message: 'Admin role updated', result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== 404 HANDLER ==========
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.originalUrl} not found` 
  });
});

// ========== ERROR HANDLING MIDDLEWARE ==========
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// ========== CONNECT TO MONGODB ==========
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('\n✅ MongoDB Connected Successfully');
  })
  .catch((err) => {
    console.error('\n❌ MongoDB Connection Error:', err.message);
  });

// ========== START SERVER ==========
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Health: http://localhost:${PORT}/health`);
  console.log(`📝 Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`📝 Register: POST http://localhost:${PORT}/api/auth/register`);
  console.log(`📝 Profile: PUT http://localhost:${PORT}/api/auth/profile`);
  console.log(`📝 Addresses: GET http://localhost:${PORT}/api/users/addresses`);
  console.log(`📝 Users: GET http://localhost:${PORT}/api/users`);
  console.log(`📝 Orders: GET http://localhost:${PORT}/api/orders`);
  console.log(`📝 My Orders: GET http://localhost:${PORT}/api/orders/my-orders`);
  console.log(`📝 Products: GET http://localhost:${PORT}/api/products`);
  console.log(`📝 Create Product: POST http://localhost:${PORT}/api/products`);
});
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const PRODUCT_CATEGORIES = {
  CUSTOM_APPAREL: 'custom-apparel',
  PRINT_ON_DEMAND: 'print-on-demand',
  UNIFORMS: 'uniforms',
  CORPORATE_GIFTS: 'corporate-gifts',
  ACCESSORIES: 'accessories',
};

export const CATEGORIES = [
  { id: 'custom-apparel', name: 'Custom Apparel', slug: 'custom-apparel' },
  { id: 'print-on-demand', name: 'Print on Demand', slug: 'print-on-demand' },
  { id: 'uniforms', name: 'Uniforms', slug: 'uniforms' },
  { id: 'corporate-gifts', name: 'Corporate Gifts', slug: 'corporate-gifts' },
  { id: 'accessories', name: 'Accessories', slug: 'accessories' },
];

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

export const PAYMENT_METHODS = {
  COD: 'cod',
  STRIPE: 'stripe',
  RAZORPAY: 'razorpay',
  PAYPAL: 'paypal',
};

export const SHIPPING_COST = 50;
export const FREE_SHIPPING_THRESHOLD = 999;
export const TAX_RATE = 0.18;

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popular', label: 'Most Popular' },
];

export const PAGE_LIMITS = [12, 24, 48, 96];

export const DEFAULT_PAGE_LIMIT = 12;

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super-admin',
};
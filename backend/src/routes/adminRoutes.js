const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  blockUser,
  getSiteSettings,
  updateSiteSettings,
  getSalesReport,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect, admin);
router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/block', blockUser);
router.get('/settings', getSiteSettings);
router.put('/settings', updateSiteSettings);
router.get('/reports/sales', getSalesReport);

module.exports = router;
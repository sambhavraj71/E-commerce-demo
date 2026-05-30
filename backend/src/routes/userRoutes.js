const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Import controllers (make sure these functions exist)
const {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  changePassword,
} = require('../controllers/userController');

// All routes require authentication
router.use(protect);

// Address routes
router.get('/addresses', getAddresses);
router.post('/addresses', addAddress);
router.put('/addresses/:id', updateAddress);
router.delete('/addresses/:id', deleteAddress);

// Password change
router.put('/change-password', changePassword);

module.exports = router;
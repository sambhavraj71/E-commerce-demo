const { body } = require('express-validator');

const validateProfileUpdate = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  
  body('phone')
    .optional()
    .matches(/^[0-9]{10}$/).withMessage('Phone number must be 10 digits'),
  
  body('avatar')
    .optional()
    .isURL().withMessage('Avatar must be a valid URL')
];

const validateAddress = [
  body('fullName')
    .notEmpty().withMessage('Full name is required'),
  
  body('addressLine1')
    .notEmpty().withMessage('Address is required'),
  
  body('city')
    .notEmpty().withMessage('City is required'),
  
  body('state')
    .notEmpty().withMessage('State is required'),
  
  body('postalCode')
    .notEmpty().withMessage('Postal code is required')
    .matches(/^[0-9]{6}$/).withMessage('Invalid postal code'),
  
  body('phone')
    .matches(/^[0-9]{10}$/).withMessage('Phone number must be 10 digits'),
  
  body('addressType')
    .optional()
    .isIn(['home', 'work', 'other']).withMessage('Invalid address type')
];

const validateChangePassword = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

module.exports = {
  validateProfileUpdate,
  validateAddress,
  validateChangePassword
};
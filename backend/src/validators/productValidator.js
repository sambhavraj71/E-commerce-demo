const { body, param } = require('express-validator');

const validateProduct = [
  body('name')
    .notEmpty().withMessage('Product name is required')
    .isLength({ min: 3, max: 100 }).withMessage('Product name must be between 3 and 100 characters'),
  
  body('description')
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  
  body('price')
    .isNumeric().withMessage('Price must be a number')
    .isFloat({ min: 0 }).withMessage('Price must be greater than or equal to 0'),
  
  body('category')
    .notEmpty().withMessage('Category is required'),
  
  body('stock')
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  
  body('comparePrice')
    .optional()
    .isNumeric().withMessage('Compare price must be a number')
    .isFloat({ min: 0 }).withMessage('Compare price must be greater than or equal to 0')
];

const validateProductId = [
  param('id')
    .isMongoId().withMessage('Invalid product ID format')
];

module.exports = {
  validateProduct,
  validateProductId
};
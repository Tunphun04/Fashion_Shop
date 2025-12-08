const { body, param } = require('express-validator');

const cartValidator = {
  // Add to cart validation
  addToCart: [
    body('variant_id')
      .notEmpty().withMessage('Variant ID is required')
      .isInt({ min: 1 }).withMessage('Variant ID must be a positive integer'),
    
    body('quantity')
      .notEmpty().withMessage('Quantity is required')
      .isInt({ min: 1, max: 100 }).withMessage('Quantity must be between 1 and 100')
  ],

  // Update cart item validation
  updateItem: [
    param('itemId')
      .isInt({ min: 1 }).withMessage('Item ID must be a positive integer'),
    
    body('quantity')
      .notEmpty().withMessage('Quantity is required')
      .isInt({ min: 0, max: 100 }).withMessage('Quantity must be between 0 and 100')
  ],

  // Remove item validation
  removeItem: [
    param('itemId')
      .isInt({ min: 1 }).withMessage('Item ID must be a positive integer')
  ]
};

module.exports = cartValidator;
const { body, param } = require('express-validator');

const wishlistValidator = {
  // Add to wishlist validation
  addToWishlist: [
    body('product_id')
      .notEmpty().withMessage('Product ID is required')
      .isInt({ min: 1 }).withMessage('Product ID must be a positive integer')
  ],

  // Remove item validation
  removeItem: [
    param('id')
      .isInt({ min: 1 }).withMessage('Wishlist item ID must be a positive integer')
  ],

  // Check product validation
  checkProduct: [
    param('productId')
      .isInt({ min: 1 }).withMessage('Product ID must be a positive integer')
  ]
};

module.exports = wishlistValidator;
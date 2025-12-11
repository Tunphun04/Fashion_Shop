const { body, param, query } = require('express-validator');

const reviewValidator = {
  // Create review validation
  createReview: [
    body('product_id')
      .notEmpty().withMessage('Product ID is required')
      .isInt({ min: 1 }).withMessage('Invalid product ID'),
    
    body('rating')
      .notEmpty().withMessage('Rating is required')
      .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    
    body('comment')
      .optional()
      .trim()
      .isLength({ min: 10, max: 1000 }).withMessage('Comment must be between 10 and 1000 characters')
  ],

  // Update review validation
  updateReview: [
    param('id')
      .isInt({ min: 1 }).withMessage('Invalid review ID'),
    
    body('rating')
      .notEmpty().withMessage('Rating is required')
      .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    
    body('comment')
      .optional()
      .trim()
      .isLength({ min: 10, max: 1000 }).withMessage('Comment must be between 10 and 1000 characters')
  ],

  // Delete review validation
  deleteReview: [
    param('id')
      .isInt({ min: 1 }).withMessage('Invalid review ID')
  ],

  // Get product reviews validation
  getProductReviews: [
    param('productId')
      .isInt({ min: 1 }).withMessage('Invalid product ID'),
    
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    
    query('rating')
      .optional()
      .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
  ],

  // Get my reviews validation
  getMyReviews: [
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
  ]
};

module.exports = reviewValidator;
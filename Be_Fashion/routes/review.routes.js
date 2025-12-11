const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const reviewValidator = require('../validators/review.validator');
const validate = require('../middlewares/validator.middleware');
const { authMiddleware } = require('../middlewares/auth.middleware');

// Public routes - Get product reviews
router.get('/product/:productId',
  reviewValidator.getProductReviews,
  validate,
  reviewController.getProductReviews
);

// Public routes - Get product rating stats
router.get('/product/:productId/stats',
  reviewValidator.getProductReviews,
  validate,
  reviewController.getProductStats
);

// Protected routes - Require authentication
router.use(authMiddleware);

// Create review
router.post('/',
  reviewValidator.createReview,
  validate,
  reviewController.createReview
);

// Update review
router.put('/:id',
  reviewValidator.updateReview,
  validate,
  reviewController.updateReview
);

// Delete review
router.delete('/:id',
  reviewValidator.deleteReview,
  validate,
  reviewController.deleteReview
);

// Get my reviews
router.get('/my',
  reviewValidator.getMyReviews,
  validate,
  reviewController.getMyReviews
);

// Check if can review product
router.get('/can-review/:productId',
  reviewValidator.getProductReviews,
  validate,
  reviewController.canReview
);

module.exports = router;
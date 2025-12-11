const ReviewService = require('../services/review.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const reviewController = {
  // Create review
  createReview: asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const review = await ReviewService.createReview(userId, req.body);
    
    res.status(201).json(
      new ApiResponse(201, review, 'Review created successfully')
    );
  }),

  // Update review
  updateReview: asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const reviewId = req.params.id;
    const review = await ReviewService.updateReview(userId, reviewId, req.body);
    
    res.status(200).json(
      new ApiResponse(200, review, 'Review updated successfully')
    );
  }),

  // Delete review
  deleteReview: asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const reviewId = req.params.id;
    const result = await ReviewService.deleteReview(userId, reviewId);
    
    res.status(200).json(
      new ApiResponse(200, result, result.message)
    );
  }),

  // Get product reviews
  getProductReviews: asyncHandler(async (req, res) => {
    const productId = req.params.productId;
    const filters = {
      page: req.query.page,
      limit: req.query.limit,
      rating: req.query.rating
    };
    
    const result = await ReviewService.getProductReviews(productId, filters);
    
    res.status(200).json(
      new ApiResponse(200, result, 'Reviews retrieved successfully')
    );
  }),

  // Get product rating stats
  getProductStats: asyncHandler(async (req, res) => {
    const productId = req.params.productId;
    const stats = await ReviewService.getProductStats(productId);
    
    res.status(200).json(
      new ApiResponse(200, stats, 'Statistics retrieved successfully')
    );
  }),

  // Get my reviews
  getMyReviews: asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const filters = {
      page: req.query.page,
      limit: req.query.limit
    };
    
    const result = await ReviewService.getMyReviews(userId, filters);
    
    res.status(200).json(
      new ApiResponse(200, result, 'Your reviews retrieved successfully')
    );
  }),

  // Check if user can review
  canReview: asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const productId = req.params.productId;
    
    const result = await ReviewService.canReview(userId, productId);
    
    res.status(200).json(
      new ApiResponse(200, result, 'Check completed')
    );
  })
};

module.exports = reviewController;
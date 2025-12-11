const Review = require('../models/review.model');
const Product = require('../models/product.model');
const ApiError = require('../utils/ApiError');

class ReviewService {
  // Create review
  static async createReview(userId, reviewData) {
    const { product_id, rating, comment } = reviewData;

    // Check if product exists
    const productExists = await Product.exists(product_id);
    if (!productExists) {
      throw new ApiError(404, 'Product not found');
    }

    // Check if user already reviewed this product
    const existingReviewId = await Review.hasReviewed(userId, product_id);
    if (existingReviewId) {
      throw new ApiError(400, 'You have already reviewed this product. Use update instead.');
    }

    // Check if user purchased this product
    const hasPurchased = await Review.hasPurchased(userId, product_id);
    if (!hasPurchased) {
      throw new ApiError(403, 'You can only review products you have purchased');
    }

    // Create review
    const reviewId = await Review.create({
      user_id: userId,
      product_id,
      rating,
      comment
    });

    return await Review.findById(reviewId);
  }

  // Update review
  static async updateReview(userId, reviewId, reviewData) {
    const review = await Review.findById(reviewId);

    if (!review) {
      throw new ApiError(404, 'Review not found');
    }

    // Check if review belongs to user
    if (review.user_id !== userId) {
      throw new ApiError(403, 'You can only update your own reviews');
    }

    // Update review
    await Review.update(reviewId, reviewData);

    return await Review.findById(reviewId);
  }

  // Delete review
  static async deleteReview(userId, reviewId) {
    const review = await Review.findById(reviewId);

    if (!review) {
      throw new ApiError(404, 'Review not found');
    }

    // Check if review belongs to user
    if (review.user_id !== userId) {
      throw new ApiError(403, 'You can only delete your own reviews');
    }

    await Review.delete(reviewId);

    return { message: 'Review deleted successfully' };
  }

  // Get product reviews
  static async getProductReviews(productId, filters) {
    // Check if product exists
    const productExists = await Product.exists(productId);
    if (!productExists) {
      throw new ApiError(404, 'Product not found');
    }

    const result = await Review.findByProduct(productId, filters);
    const stats = await Review.getProductStats(productId);

    return {
      ...stats,
      ...result
    };
  }

  // Get product rating stats only
  static async getProductStats(productId) {
    // Check if product exists
    const productExists = await Product.exists(productId);
    if (!productExists) {
      throw new ApiError(404, 'Product not found');
    }

    return await Review.getProductStats(productId);
  }

  // Get user's reviews
  static async getMyReviews(userId, filters) {
    return await Review.findByUser(userId, filters);
  }

  // Check if user can review product
  static async canReview(userId, productId) {
    // Check if product exists
    const productExists = await Product.exists(productId);
    if (!productExists) {
      throw new ApiError(404, 'Product not found');
    }

    // Check if already reviewed
    const hasReviewed = await Review.hasReviewed(userId, productId);
    if (hasReviewed) {
      return {
        can_review: false,
        reason: 'Already reviewed'
      };
    }

    // Check if purchased
    const hasPurchased = await Review.hasPurchased(userId, productId);
    if (!hasPurchased) {
      return {
        can_review: false,
        reason: 'Not purchased'
      };
    }

    return {
      can_review: true,
      reason: null
    };
  }
}

module.exports = ReviewService;
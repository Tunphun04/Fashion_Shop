const WishlistService = require('../services/wishlist.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const wishlistController = {
  // Get user's wishlist
  getWishlist: asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const wishlist = await WishlistService.getWishlist(userId);
    
    res.status(200).json(
      new ApiResponse(200, wishlist, 'Wishlist retrieved successfully')
    );
  }),

  // Add item to wishlist
  addToWishlist: asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { product_id } = req.body;
    
    const wishlist = await WishlistService.addToWishlist(userId, product_id);
    
    res.status(200).json(
      new ApiResponse(200, wishlist, 'Item added to wishlist successfully')
    );
  }),

  // Remove item from wishlist
  removeFromWishlist: asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { id } = req.params;
    
    const wishlist = await WishlistService.removeFromWishlist(userId, id);
    
    res.status(200).json(
      new ApiResponse(200, wishlist, 'Item removed from wishlist successfully')
    );
  }),

  // Clear wishlist
  clearWishlist: asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const wishlist = await WishlistService.clearWishlist(userId);
    
    res.status(200).json(
      new ApiResponse(200, wishlist, 'Wishlist cleared successfully')
    );
  }),

  // Get wishlist item count (for badge)
  getWishlistCount: asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const result = await WishlistService.getWishlistCount(userId);
    
    res.status(200).json(
      new ApiResponse(200, result, 'Wishlist count retrieved successfully')
    );
  }),

  // Check if product in wishlist
  checkProduct: asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { productId } = req.params;
    
    const result = await WishlistService.checkProduct(userId, productId);
    
    res.status(200).json(
      new ApiResponse(200, result, 'Check completed')
    );
  }),

  // Move to cart
  moveToCart: asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { id } = req.params;
    
    const result = await WishlistService.moveToCart(userId, id);
    
    res.status(200).json(
      new ApiResponse(200, result, result.message)
    );
  })
};

module.exports = wishlistController;
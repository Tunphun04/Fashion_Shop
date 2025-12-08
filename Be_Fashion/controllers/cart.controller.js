const CartService = require('../services/cart.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const cartController = {
  // Get user's cart
  getCart: asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const cart = await CartService.getCart(userId);
    
    res.status(200).json(
      new ApiResponse(200, cart, 'Cart retrieved successfully')
    );
  }),

  // Add item to cart
  addToCart: asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { variant_id, quantity } = req.body;
    
    const cart = await CartService.addToCart(userId, variant_id, quantity);
    
    res.status(200).json(
      new ApiResponse(200, cart, 'Item added to cart successfully')
    );
  }),

  // Update cart item quantity
  updateCartItem: asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { itemId } = req.params;
    const { quantity } = req.body;
    
    const cart = await CartService.updateCartItem(userId, itemId, quantity);
    
    res.status(200).json(
      new ApiResponse(200, cart, 'Cart updated successfully')
    );
  }),

  // Remove item from cart
  removeCartItem: asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { itemId } = req.params;
    
    const cart = await CartService.removeCartItem(userId, itemId);
    
    res.status(200).json(
      new ApiResponse(200, cart, 'Item removed from cart successfully')
    );
  }),

  // Clear entire cart
  clearCart: asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const cart = await CartService.clearCart(userId);
    
    res.status(200).json(
      new ApiResponse(200, cart, 'Cart cleared successfully')
    );
  }),

  // Get cart item count (for badge)
  getCartCount: asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const result = await CartService.getCartCount(userId);
    
    res.status(200).json(
      new ApiResponse(200, result, 'Cart count retrieved successfully')
    );
  })
};

module.exports = cartController;
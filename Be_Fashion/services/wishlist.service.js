const Wishlist = require('../models/wishlist.model');
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const ApiError = require('../utils/ApiError');

class WishlistService {
  // Get user's wishlist
  static async getWishlist(userId) {
    return await Wishlist.getWishlistWithItems(userId);
  }

  // Add item to wishlist
  static async addToWishlist(userId, productId) {
    // Check if product exists
    const productExists = await Product.exists(productId);
    if (!productExists) {
      throw new ApiError(404, 'Product not found');
    }

    // Check if already in wishlist
    const alreadyExists = await Wishlist.hasProduct(userId, productId);
    if (alreadyExists) {
      throw new ApiError(400, 'Product already in wishlist');
    }

    // Add to wishlist
    await Wishlist.addItem(userId, productId);

    // Return updated wishlist
    return await Wishlist.getWishlistWithItems(userId);
  }

  // Remove item from wishlist
  static async removeFromWishlist(userId, wishlistItemId) {
    const success = await Wishlist.removeItem(userId, wishlistItemId);
    
    if (!success) {
      throw new ApiError(404, 'Wishlist item not found');
    }

    // Return updated wishlist
    return await Wishlist.getWishlistWithItems(userId);
  }

  // Clear wishlist
  static async clearWishlist(userId) {
    await Wishlist.clearWishlist(userId);
    return await Wishlist.getWishlistWithItems(userId);
  }

  // Get wishlist item count (for badge)
  static async getWishlistCount(userId) {
    const count = await Wishlist.getItemCount(userId);
    return { count };
  }

  // Check if product in wishlist
  static async checkProduct(userId, productId) {
    // Check if product exists
    const productExists = await Product.exists(productId);
    if (!productExists) {
      throw new ApiError(404, 'Product not found');
    }

    const wishlistItemId = await Wishlist.hasProduct(userId, productId);
    
    return {
      in_wishlist: wishlistItemId !== null,
      wishlist_item_id: wishlistItemId
    };
  }

  // Move to cart (add to cart + remove from wishlist)
  static async moveToCart(userId, wishlistItemId) {
    // Get wishlist item
    const item = await Wishlist.getItem(userId, wishlistItemId);
    
    if (!item) {
      throw new ApiError(404, 'Wishlist item not found');
    }

    // Get product to find default variant
    const product = await Product.findById(item.product_id);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    // Get first available variant
    const variants = await Product.findVariants(item.product_id);
    if (variants.length === 0) {
      throw new ApiError(400, 'Product has no variants available');
    }

    // Find first in-stock variant
    const availableVariant = variants.find(v => v.stock > 0);
    if (!availableVariant) {
      throw new ApiError(400, 'Product is out of stock');
    }

    // Add to cart
    await Cart.addItem(userId, availableVariant.variant_id, 1);

    // Remove from wishlist
    await Wishlist.removeItem(userId, wishlistItemId);

    return {
      message: 'Item moved to cart successfully',
      variant_id: availableVariant.variant_id
    };
  }
}

module.exports = WishlistService;
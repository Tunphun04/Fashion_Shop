const { calculateVariantFinalPrice } = require('../utils/price.util');
const Cart = require('../models/cart.model');
const ApiError = require('../utils/ApiError');

class CartService {
  // Get user's cart
  static async getCart(userId) {
    const cart = await Cart.getCartWithItems(userId);

    cart.items = cart.items.map(item => {
      const final_price = calculateVariantFinalPrice(item);
      return {
        ...item,
        final_price,
        subtotal: final_price * item.quantity
      };
    });

    return cart;
  }

  // Add item to cart
  static async addToCart(userId, variantId, quantity) {
    // Validate quantity
    if (quantity <= 0) {
      throw new ApiError(400, 'Quantity must be greater than 0');
    }

    // Check variant stock
    const stock = await Cart.getVariantStock(variantId);
    if (stock === 0) {
      throw new ApiError(400, 'Product variant not found or out of stock');
    }

    // Check if adding this quantity exceeds stock
    const alreadyInCart = await Cart.hasVariant(userId, variantId);
    if (alreadyInCart) {
      // Get current quantity in cart
      const cart = await Cart.getCartWithItems(userId);
      const item = cart.items.find(i => i.variant_id === variantId);
      const totalQuantity = item.quantity + quantity;

      if (totalQuantity > stock) {
        throw new ApiError(400, `Only ${stock} items available in stock. You already have ${item.quantity} in cart.`);
      }
    } else {
      if (quantity > stock) {
        throw new ApiError(400, `Only ${stock} items available in stock`);
      }
    }

    // Add to cart
    await Cart.addItem(userId, variantId, quantity);

    // Return updated cart
    return await Cart.getCartWithItems(userId);
  }

  // Update cart item quantity
  static async updateCartItem(userId, cartItemId, quantity) {
    // Validate quantity
    if (quantity < 0) {
      throw new ApiError(400, 'Quantity cannot be negative');
    }

    // Get current cart to find variant
    const cart = await Cart.getCartWithItems(userId);
    const item = cart.items.find(i => i.cart_item_id === parseInt(cartItemId));

    if (!item) {
      throw new ApiError(404, 'Cart item not found');
    }

    // Check stock if increasing quantity
    if (quantity > item.quantity) {
      const stock = await Cart.getVariantStock(item.variant_id);
      if (quantity > stock) {
        throw new ApiError(400, `Only ${stock} items available in stock`);
      }
    }

    // Update quantity
    const success = await Cart.updateItemQuantity(userId, cartItemId, quantity);
    if (!success) {
      throw new ApiError(404, 'Cart item not found');
    }

    // Return updated cart
    return await Cart.getCartWithItems(userId);
  }

  // Remove item from cart
  static async removeCartItem(userId, cartItemId) {
    const success = await Cart.removeItem(userId, cartItemId);
    if (!success) {
      throw new ApiError(404, 'Cart item not found');
    }

    // Return updated cart
    return await Cart.getCartWithItems(userId);
  }

  // Clear cart
  static async clearCart(userId) {
    await Cart.clearCart(userId);
    return await Cart.getCartWithItems(userId);
  }

  // Get cart item count (for badge)
  static async getCartCount(userId) {
    const count = await Cart.getItemCount(userId);
    return { count };
  }
}

module.exports = CartService;
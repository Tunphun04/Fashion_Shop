const db = require('../config/database');

class Cart {
  // Get or create cart for user
  static async getOrCreateCart(userId) {
    // Check if cart exists
    const [carts] = await db.query(
      'SELECT cart_id FROM carts WHERE user_id = ?',
      [userId]
    );

    if (carts.length > 0) {
      return carts[0].cart_id;
    }

    // Create new cart
    const [result] = await db.query(
      'INSERT INTO carts (user_id) VALUES (?)',
      [userId]
    );

    return result.insertId;
  }

  // Get cart with items
  static async getCartWithItems(userId) {
    const cartId = await this.getOrCreateCart(userId);

    const [items] = await db.query(`
      SELECT 
        ci.cart_item_id,
        ci.variant_id,
        ci.quantity,
        p.product_id,
        p.name as product_name,
        p.slug as product_slug,
        pv.sku,
        pv.color,
        pv.size,
        pv.price,
        pv.stock,
        b.name as brand_name,
        (SELECT image_url FROM product_images 
         WHERE product_id = p.product_id AND is_main = 1 
         LIMIT 1) as image_url,
        (ci.quantity * pv.price) as subtotal
      FROM cart_items ci
      JOIN product_variants pv ON ci.variant_id = pv.variant_id
      JOIN products p ON pv.product_id = p.product_id
      LEFT JOIN brands b ON p.brand_id = b.brand_id
      WHERE ci.cart_id = ?
      ORDER BY ci.created_at DESC
    `, [cartId]);

    // Calculate totals
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

    return {
      cart_id: cartId,
      user_id: userId,
      items,
      total_items: totalItems,
      total_amount: totalAmount.toFixed(2)
    };
  }

  // Add item to cart
  static async addItem(userId, variantId, quantity) {
    const cartId = await this.getOrCreateCart(userId);

    // Check if item already exists in cart
    const [existing] = await db.query(
      'SELECT cart_item_id, quantity FROM cart_items WHERE cart_id = ? AND variant_id = ?',
      [cartId, variantId]
    );

    if (existing.length > 0) {
      // Update quantity
      const newQuantity = existing[0].quantity + quantity;
      await db.query(
        'UPDATE cart_items SET quantity = ? WHERE cart_item_id = ?',
        [newQuantity, existing[0].cart_item_id]
      );
      return existing[0].cart_item_id;
    }

    // Add new item
    const [result] = await db.query(
      'INSERT INTO cart_items (cart_id, variant_id, quantity) VALUES (?, ?, ?)',
      [cartId, variantId, quantity]
    );

    return result.insertId;
  }

  // Update item quantity
  static async updateItemQuantity(userId, cartItemId, quantity) {
    const cartId = await this.getOrCreateCart(userId);

    // Verify item belongs to user's cart
    const [items] = await db.query(
      'SELECT cart_item_id FROM cart_items WHERE cart_item_id = ? AND cart_id = ?',
      [cartItemId, cartId]
    );

    if (items.length === 0) {
      return false;
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      await db.query('DELETE FROM cart_items WHERE cart_item_id = ?', [cartItemId]);
    } else {
      // Update quantity
      await db.query(
        'UPDATE cart_items SET quantity = ? WHERE cart_item_id = ?',
        [quantity, cartItemId]
      );
    }

    return true;
  }

  // Remove item from cart
  static async removeItem(userId, cartItemId) {
    const cartId = await this.getOrCreateCart(userId);

    const [result] = await db.query(
      'DELETE FROM cart_items WHERE cart_item_id = ? AND cart_id = ?',
      [cartItemId, cartId]
    );

    return result.affectedRows > 0;
  }

  // Clear entire cart
  static async clearCart(userId) {
    const cartId = await this.getOrCreateCart(userId);

    await db.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
    return true;
  }

  // Get item count
  static async getItemCount(userId) {
    const cartId = await this.getOrCreateCart(userId);

    const [result] = await db.query(
      'SELECT SUM(quantity) as count FROM cart_items WHERE cart_id = ?',
      [cartId]
    );

    return result[0].count || 0;
  }

  // Check if variant exists in cart
  static async hasVariant(userId, variantId) {
    const cartId = await this.getOrCreateCart(userId);

    const [items] = await db.query(
      'SELECT cart_item_id FROM cart_items WHERE cart_id = ? AND variant_id = ?',
      [cartId, variantId]
    );

    return items.length > 0;
  }

  // Get variant stock
  static async getVariantStock(variantId) {
    const [variants] = await db.query(
      'SELECT stock FROM product_variants WHERE variant_id = ?',
      [variantId]
    );

    return variants.length > 0 ? variants[0].stock : 0;
  }
}

module.exports = Cart;
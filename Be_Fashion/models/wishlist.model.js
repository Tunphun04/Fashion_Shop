const db = require('../config/database');

class Wishlist {
  // Get or create wishlist for user
  static async getOrCreateWishlist(userId) {
    // Check if wishlist exists
    const [wishlists] = await db.query(
      'SELECT wishlist_id FROM wishlist WHERE user_id = ?',
      [userId]
    );

    if (wishlists.length > 0) {
      return wishlists[0].wishlist_id;
    }

    // Create new wishlist
    const [result] = await db.query(
      'INSERT INTO wishlist (user_id) VALUES (?)',
      [userId]
    );

    return result.insertId;
  }

  // Get wishlist with items
  static async getWishlistWithItems(userId) {
    const wishlistId = await this.getOrCreateWishlist(userId);

    const [items] = await db.query(`
      SELECT 
        wi.wishlist_item_id,
        wi.product_id,
        wi.added_at,
        p.name as product_name,
        p.slug as product_slug,
        p.price,
        p.status,
        c.name as category_name,
        b.name as brand_name,
        (SELECT image_url FROM product_images 
         WHERE product_id = p.product_id AND is_main = 1 
         LIMIT 1) as image_url,
        (SELECT SUM(stock) FROM product_variants 
         WHERE product_id = p.product_id) as total_stock
      FROM wishlist_items wi
      JOIN products p ON wi.product_id = p.product_id
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN brands b ON p.brand_id = b.brand_id
      WHERE wi.wishlist_id = ?
      ORDER BY wi.added_at DESC
    `, [wishlistId]);

    // Add in_stock flag
    const itemsWithStock = items.map(item => ({
      ...item,
      in_stock: item.total_stock > 0,
      total_stock: parseInt(item.total_stock) || 0
    }));

    return {
      wishlist_id: wishlistId,
      user_id: userId,
      items: itemsWithStock,
      total_items: items.length
    };
  }

  // Add item to wishlist
  static async addItem(userId, productId) {
    const wishlistId = await this.getOrCreateWishlist(userId);

    // Check if item already exists
    const [existing] = await db.query(
      'SELECT wishlist_item_id FROM wishlist_items WHERE wishlist_id = ? AND product_id = ?',
      [wishlistId, productId]
    );

    if (existing.length > 0) {
      return existing[0].wishlist_item_id;
    }

    // Add new item
    const [result] = await db.query(
      'INSERT INTO wishlist_items (wishlist_id, product_id) VALUES (?, ?)',
      [wishlistId, productId]
    );

    return result.insertId;
  }

  // Remove item from wishlist
  static async removeItem(userId, wishlistItemId) {
    const wishlistId = await this.getOrCreateWishlist(userId);

    const [result] = await db.query(
      'DELETE FROM wishlist_items WHERE wishlist_item_id = ? AND wishlist_id = ?',
      [wishlistItemId, wishlistId]
    );

    return result.affectedRows > 0;
  }

  // Remove product from wishlist (by product_id)
  static async removeProduct(userId, productId) {
    const wishlistId = await this.getOrCreateWishlist(userId);

    const [result] = await db.query(
      'DELETE FROM wishlist_items WHERE wishlist_id = ? AND product_id = ?',
      [wishlistId, productId]
    );

    return result.affectedRows > 0;
  }

  // Clear entire wishlist
  static async clearWishlist(userId) {
    const wishlistId = await this.getOrCreateWishlist(userId);

    await db.query('DELETE FROM wishlist_items WHERE wishlist_id = ?', [wishlistId]);
    return true;
  }

  // Get item count
  static async getItemCount(userId) {
    const wishlistId = await this.getOrCreateWishlist(userId);

    const [result] = await db.query(
      'SELECT COUNT(*) as count FROM wishlist_items WHERE wishlist_id = ?',
      [wishlistId]
    );

    return result[0].count;
  }

  // Check if product in wishlist
  static async hasProduct(userId, productId) {
    const wishlistId = await this.getOrCreateWishlist(userId);

    const [items] = await db.query(
      'SELECT wishlist_item_id FROM wishlist_items WHERE wishlist_id = ? AND product_id = ?',
      [wishlistId, productId]
    );

    return items.length > 0 ? items[0].wishlist_item_id : null;
  }

  // Get wishlist item by ID
  static async getItem(userId, wishlistItemId) {
    const wishlistId = await this.getOrCreateWishlist(userId);

    const [items] = await db.query(
      'SELECT * FROM wishlist_items WHERE wishlist_item_id = ? AND wishlist_id = ?',
      [wishlistItemId, wishlistId]
    );

    return items[0];
  }
}

module.exports = Wishlist;
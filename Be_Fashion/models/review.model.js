const db = require('../config/database');

class Review {
  // Create review
  static async create(reviewData) {
    const { user_id, product_id, rating, comment } = reviewData;
    
    const [result] = await db.query(
      `INSERT INTO reviews (user_id, product_id, rating, comment) 
       VALUES (?, ?, ?, ?)`,
      [user_id, product_id, rating, comment]
    );
    
    return result.insertId;
  }

  // Get review by ID
  static async findById(reviewId) {
    const [rows] = await db.query(`
      SELECT 
        r.*,
        u.full_name as user_name,
        u.avatar_url as user_avatar,
        p.name as product_name,
        p.slug as product_slug
      FROM reviews r
      JOIN users u ON r.user_id = u.user_id
      JOIN products p ON r.product_id = p.product_id
      WHERE r.review_id = ?
    `, [reviewId]);
    
    return rows[0];
  }

  // Get product reviews with pagination
  static async findByProduct(productId, filters = {}) {
    const { page = 1, limit = 10, rating } = filters;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        r.review_id,
        r.user_id,
        r.rating,
        r.comment,
        r.created_at,
        r.updated_at,
        u.full_name as user_name,
        u.avatar_url as user_avatar
      FROM reviews r
      JOIN users u ON r.user_id = u.user_id
      WHERE r.product_id = ?
    `;
    const params = [productId];

    // Filter by rating if provided
    if (rating) {
      query += ' AND r.rating = ?';
      params.push(rating);
    }

    query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [reviews] = await db.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM reviews WHERE product_id = ?';
    const countParams = [productId];
    
    if (rating) {
      countQuery += ' AND rating = ?';
      countParams.push(rating);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0].total;

    return {
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        total_pages: Math.ceil(total / limit)
      }
    };
  }

  // Get user reviews
  static async findByUser(userId, filters = {}) {
    const { page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;

    const [reviews] = await db.query(`
      SELECT 
        r.*,
        p.name as product_name,
        p.slug as product_slug,
        (SELECT image_url FROM product_images 
         WHERE product_id = p.product_id AND is_main = 1 
         LIMIT 1) as product_image
      FROM reviews r
      JOIN products p ON r.product_id = p.product_id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, parseInt(limit), parseInt(offset)]);

    // Get total count
    const [countResult] = await db.query(
      'SELECT COUNT(*) as total FROM reviews WHERE user_id = ?',
      [userId]
    );
    const total = countResult[0].total;

    return {
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        total_pages: Math.ceil(total / limit)
      }
    };
  }

  // Update review
  static async update(reviewId, reviewData) {
    const { rating, comment } = reviewData;
    
    await db.query(
      `UPDATE reviews 
       SET rating = ?, comment = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE review_id = ?`,
      [rating, comment, reviewId]
    );
  }

  // Delete review
  static async delete(reviewId) {
    const [result] = await db.query(
      'DELETE FROM reviews WHERE review_id = ?',
      [reviewId]
    );
    return result.affectedRows > 0;
  }

  // Check if user already reviewed product
  static async hasReviewed(userId, productId) {
    const [rows] = await db.query(
      'SELECT review_id FROM reviews WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );
    return rows.length > 0 ? rows[0].review_id : null;
  }

  // Check if user purchased product
  static async hasPurchased(userId, productId) {
    const [rows] = await db.query(`
      SELECT COUNT(*) as count
      FROM orders o
      JOIN order_items oi ON o.order_id = oi.order_id
      JOIN product_variants pv ON oi.variant_id = pv.variant_id
      WHERE o.user_id = ? 
        AND pv.product_id = ?
        AND o.status IN ('completed', 'shipping')
    `, [userId, productId]);
    
    return rows[0].count > 0;
  }

  // Check if review belongs to user
  static async belongsToUser(reviewId, userId) {
    const [rows] = await db.query(
      'SELECT review_id FROM reviews WHERE review_id = ? AND user_id = ?',
      [reviewId, userId]
    );
    return rows.length > 0;
  }

  // Get product rating statistics
  static async getProductStats(productId) {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as average_rating,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as rating_5,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as rating_4,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as rating_3,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as rating_2,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as rating_1
      FROM reviews
      WHERE product_id = ?
    `, [productId]);

    const result = stats[0];
    
    return {
      product_id: productId,
      total_reviews: result.total_reviews,
      average_rating: result.average_rating ? parseFloat(result.average_rating).toFixed(1) : 0,
      rating_breakdown: {
        5: result.rating_5,
        4: result.rating_4,
        3: result.rating_3,
        2: result.rating_2,
        1: result.rating_1
      }
    };
  }
}

module.exports = Review;
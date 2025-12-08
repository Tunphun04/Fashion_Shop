const db = require('../config/database');

class Order {
  // Create order
  static async create(orderData) {
    const { user_id, address_id, total_amount, shipping_fee, payment_method } = orderData;
    
    const [result] = await db.query(
      `INSERT INTO orders (user_id, address_id, total_amount, shipping_fee, payment_method, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [user_id, address_id, total_amount, shipping_fee, payment_method]
    );
    
    return result.insertId;
  }

  // Add order items
  static async addItems(orderId, items) {
    const values = items.map(item => [orderId, item.variant_id, item.quantity, item.price]);
    
    await db.query(
      `INSERT INTO order_items (order_id, variant_id, quantity, price) VALUES ?`,
      [values]
    );
  }

  // Get order by ID with items
  static async findById(orderId) {
    const [orders] = await db.query(`
      SELECT 
        o.*,
        a.fullname as shipping_fullname,
        a.phone as shipping_phone,
        a.street,
        a.district,
        a.city
      FROM orders o
      LEFT JOIN addresses a ON o.address_id = a.address_id
      WHERE o.order_id = ?
    `, [orderId]);

    if (orders.length === 0) return null;

    const order = orders[0];

    // Get order items
    const [items] = await db.query(`
      SELECT 
        oi.*,
        p.product_id,
        p.name as product_name,
        p.slug as product_slug,
        pv.sku,
        pv.color,
        pv.size,
        b.name as brand_name,
        (SELECT image_url FROM product_images 
         WHERE product_id = p.product_id AND is_main = 1 
         LIMIT 1) as image_url
      FROM order_items oi
      JOIN product_variants pv ON oi.variant_id = pv.variant_id
      JOIN products p ON pv.product_id = p.product_id
      LEFT JOIN brands b ON p.brand_id = b.brand_id
      WHERE oi.order_id = ?
    `, [orderId]);

    order.items = items;
    return order;
  }

  // Get user orders with pagination
  static async findByUser(userId, filters = {}) {
    const { page = 1, limit = 10, status } = filters;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        o.order_id,
        o.total_amount,
        o.shipping_fee,
        o.status,
        o.payment_method,
        o.created_at,
        COUNT(oi.order_item_id) as total_items
      FROM orders o
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      WHERE o.user_id = ?
    `;
    const params = [userId];

    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }

    query += ' GROUP BY o.order_id ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [orders] = await db.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM orders WHERE user_id = ?';
    const countParams = [userId];
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0].total;

    return {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        total_pages: Math.ceil(total / limit)
      }
    };
  }

  // Get all orders (Admin)
  static async findAll(filters = {}) {
    const { page = 1, limit = 20, status } = filters;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        o.order_id,
        o.user_id,
        u.full_name as customer_name,
        u.email as customer_email,
        o.total_amount,
        o.shipping_fee,
        o.status,
        o.payment_method,
        o.created_at,
        COUNT(oi.order_item_id) as total_items
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }

    query += ' GROUP BY o.order_id ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [orders] = await db.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM orders WHERE 1=1';
    const countParams = [];
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0].total;

    return {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        total_pages: Math.ceil(total / limit)
      }
    };
  }

  // Update order status
  static async updateStatus(orderId, status, connection = null) {
    const conn = connection || db;
    await conn.query(
      'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE order_id = ?',
      [status, orderId]
    );
  }

  // Check if order belongs to user
  static async belongsToUser(orderId, userId) {
    const [orders] = await db.query(
      'SELECT order_id FROM orders WHERE order_id = ? AND user_id = ?',
      [orderId, userId]
    );
    return orders.length > 0;
  }

  // Decrease variant stock
  static async decreaseStock(variantId, quantity, connection = null) {
    const conn = connection || db;
    await conn.query(
      'UPDATE product_variants SET stock = stock - ? WHERE variant_id = ?',
      [quantity, variantId]
    );
  }

  // Increase variant stock (for cancel)
  static async increaseStock(variantId, quantity, connection = null) {
    const conn = connection || db;
    await conn.query(
      'UPDATE product_variants SET stock = stock + ? WHERE variant_id = ?',
      [quantity, variantId]
    );
  }

  // Log inventory change
  static async logInventory(variantId, quantity, note, connection = null) {
    const conn = connection || db;
    await conn.query(
      `INSERT INTO inventory_logs (variant_id, change_type, quantity, note) 
       VALUES (?, 'export', ?, ?)`,
      [variantId, quantity, note]
    );
  }

  // Log inventory import (for cancel)
  static async logInventoryImport(variantId, quantity, note, connection = null) {
    const conn = connection || db;
    await conn.query(
      `INSERT INTO inventory_logs (variant_id, change_type, quantity, note) 
       VALUES (?, 'import', ?, ?)`,
      [variantId, quantity, note]
    );
  }

  // Create payment record
  static async createPayment(orderId, paymentData) {
    const { amount, method, transaction_id, status } = paymentData;
    
    const [result] = await db.query(
      `INSERT INTO payments (order_id, amount, method, transaction_id, status, paid_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [orderId, amount, method, transaction_id || null, status, status === 'success' ? new Date() : null]
    );
    
    return result.insertId;
  }

  // Get order statistics (Admin)
  static async getStatistics() {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid_orders,
        SUM(CASE WHEN status = 'shipping' THEN 1 ELSE 0 END) as shipping_orders,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_orders,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as average_order_value
      FROM orders
    `);

    return stats[0];
  }
}

module.exports = Order;
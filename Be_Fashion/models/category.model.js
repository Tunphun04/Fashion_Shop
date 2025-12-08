const db = require('../config/database');

class Category {
  // Get all categories (with parent-child relationship)
  static async findAll() {
    const [rows] = await db.query(`
      SELECT 
        c.category_id,
        c.parent_id,
        c.name,
        c.slug,
        c.created_at,
        p.name as parent_name
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.category_id
      ORDER BY c.parent_id, c.name
    `);
    return rows;
  }

  // Get category by ID
  static async findById(categoryId) {
    const [rows] = await db.query(`
      SELECT 
        c.category_id,
        c.parent_id,
        c.name,
        c.slug,
        c.created_at,
        p.name as parent_name
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.category_id
      WHERE c.category_id = ?
    `, [categoryId]);
    return rows[0];
  }

  // Get category by slug
  static async findBySlug(slug) {
    const [rows] = await db.query(`
      SELECT 
        c.category_id,
        c.parent_id,
        c.name,
        c.slug,
        c.created_at,
        p.name as parent_name
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.category_id
      WHERE c.slug = ?
    `, [slug]);
    return rows[0];
  }

  // Get children categories
  static async findChildren(parentId) {
    const [rows] = await db.query(`
      SELECT category_id, name, slug
      FROM categories
      WHERE parent_id = ?
      ORDER BY name
    `, [parentId]);
    return rows;
  }

  // Get top level categories (parent_id IS NULL)
  static async findTopLevel() {
    const [rows] = await db.query(`
      SELECT category_id, name, slug
      FROM categories
      WHERE parent_id IS NULL
      ORDER BY name
    `);
    return rows;
  }

  // Create category
  static async create(categoryData) {
    const { parent_id, name, slug } = categoryData;
    const [result] = await db.query(
      'INSERT INTO categories (parent_id, name, slug) VALUES (?, ?, ?)',
      [parent_id || null, name, slug]
    );
    return result.insertId;
  }

  // Update category
  static async update(categoryId, categoryData) {
    const fields = [];
    const values = [];

    if (categoryData.parent_id !== undefined) {
      fields.push('parent_id = ?');
      values.push(categoryData.parent_id || null);
    }
    if (categoryData.name) {
      fields.push('name = ?');
      values.push(categoryData.name);
    }
    if (categoryData.slug) {
      fields.push('slug = ?');
      values.push(categoryData.slug);
    }

    if (fields.length === 0) return;

    values.push(categoryId);
    await db.query(
      `UPDATE categories SET ${fields.join(', ')} WHERE category_id = ?`,
      values
    );
  }

  // Delete category
  static async delete(categoryId) {
    await db.query('DELETE FROM categories WHERE category_id = ?', [categoryId]);
  }

  // Check if category exists
  static async exists(categoryId) {
    const [rows] = await db.query(
      'SELECT COUNT(*) as count FROM categories WHERE category_id = ?',
      [categoryId]
    );
    return rows[0].count > 0;
  }
}

module.exports = Category;
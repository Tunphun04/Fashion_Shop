const db = require('../config/database');

class Brand {
  // Get all brands
  static async findAll() {
    const [rows] = await db.query(`
      SELECT brand_id, name, slug, logo_url, description, created_at
      FROM brands
      ORDER BY name
    `);
    return rows;
  }

  // Get brand by ID
  static async findById(brandId) {
    const [rows] = await db.query(
      'SELECT * FROM brands WHERE brand_id = ?',
      [brandId]
    );
    return rows[0];
  }

  // Get brand by slug
  static async findBySlug(slug) {
    const [rows] = await db.query(
      'SELECT * FROM brands WHERE slug = ?',
      [slug]
    );
    return rows[0];
  }

  // Create brand
  static async create(brandData) {
    const { name, slug, logo_url, description } = brandData;
    const [result] = await db.query(
      'INSERT INTO brands (name, slug, logo_url, description) VALUES (?, ?, ?, ?)',
      [name, slug, logo_url || null, description || null]
    );
    return result.insertId;
  }

  // Update brand
  static async update(brandId, brandData) {
    const fields = [];
    const values = [];

    if (brandData.name) {
      fields.push('name = ?');
      values.push(brandData.name);
    }
    if (brandData.slug) {
      fields.push('slug = ?');
      values.push(brandData.slug);
    }
    if (brandData.logo_url !== undefined) {
      fields.push('logo_url = ?');
      values.push(brandData.logo_url);
    }
    if (brandData.description !== undefined) {
      fields.push('description = ?');
      values.push(brandData.description);
    }

    if (fields.length === 0) return;

    values.push(brandId);
    await db.query(
      `UPDATE brands SET ${fields.join(', ')} WHERE brand_id = ?`,
      values
    );
  }

  // Delete brand
  static async delete(brandId) {
    await db.query('DELETE FROM brands WHERE brand_id = ?', [brandId]);
  }

  // Check if brand exists
  static async exists(brandId) {
    const [rows] = await db.query(
      'SELECT COUNT(*) as count FROM brands WHERE brand_id = ?',
      [brandId]
    );
    return rows[0].count > 0;
  }
}

module.exports = Brand;
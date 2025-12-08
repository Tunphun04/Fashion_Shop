const db = require('../config/database');

class Product {
  // Get products with filters and pagination
  static async findAll(filters = {}) {
    const {
      page = 1,
      limit = 20,
      category_id,
      brand_id,
      min_price,
      max_price,
      color,
      size,
      search,
      sort = 'newest',
      status = 'active'
    } = filters;

    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    // Base query
    let query = `
      SELECT DISTINCT
        p.product_id,
        p.name,
        p.slug,
        p.description,
        p.price,
        p.status,
        p.created_at,
        c.name as category_name,
        c.slug as category_slug,
        b.name as brand_name,
        b.slug as brand_slug,
        (SELECT image_url FROM product_images WHERE product_id = p.product_id AND is_main = 1 LIMIT 1) as main_image,
        (SELECT COUNT(*) FROM product_variants WHERE product_id = p.product_id) as variant_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN brands b ON p.brand_id = b.brand_id
    `;

    // Add variant join if filtering by color or size
    if (color || size) {
      query += ` LEFT JOIN product_variants pv ON p.product_id = pv.product_id`;
    }

    // Status filter
    conditions.push('p.status = ?');
    params.push(status);

    // Category filter (include sub-categories)
    if (category_id) {
      // Get all descendant categories
      conditions.push(`(
        p.category_id = ? 
        OR p.category_id IN (
          SELECT category_id FROM categories WHERE parent_id = ?
        )
        OR p.category_id IN (
          SELECT c2.category_id FROM categories c1
          JOIN categories c2 ON c2.parent_id = c1.category_id
          WHERE c1.parent_id = ?
        )
      )`);
      params.push(category_id, category_id, category_id);
    }

    // Brand filter
    if (brand_id) {
      conditions.push('p.brand_id = ?');
      params.push(brand_id);
    }

    // Price range filter
    if (min_price) {
      conditions.push('p.price >= ?');
      params.push(min_price);
    }
    if (max_price) {
      conditions.push('p.price <= ?');
      params.push(max_price);
    }

    // Color filter
    if (color) {
      conditions.push('pv.color = ?');
      params.push(color);
    }

    // Size filter
    if (size) {
      conditions.push('pv.size = ?');
      params.push(size);
    }

    // Search filter
    if (search) {
      conditions.push('(p.name LIKE ? OR p.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    // Add WHERE clause
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    // Sorting
    const sortOptions = {
      'newest': 'p.created_at DESC',
      'oldest': 'p.created_at ASC',
      'price_asc': 'p.price ASC',
      'price_desc': 'p.price DESC',
      'name_asc': 'p.name ASC',
      'name_desc': 'p.name DESC'
    };
    query += ` ORDER BY ${sortOptions[sort] || sortOptions.newest}`;

    // Pagination
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    // Execute query
    const [rows] = await db.query(query, params);

    // Get total count
    let countQuery = `
      SELECT COUNT(DISTINCT p.product_id) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN brands b ON p.brand_id = b.brand_id
    `;

    if (color || size) {
      countQuery += ` LEFT JOIN product_variants pv ON p.product_id = pv.product_id`;
    }

    if (conditions.length > 0) {
      countQuery += ` WHERE ${conditions.join(' AND ')}`;
    }

    const countParams = params.slice(0, -2); // Remove limit and offset
    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0].total;

    return {
      products: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        total_pages: Math.ceil(total / limit)
      }
    };
  }

  // Get product by ID with full details
  static async findById(productId) {
    const [rows] = await db.query(`
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        b.name as brand_name,
        b.slug as brand_slug,
        b.logo_url as brand_logo
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN brands b ON p.brand_id = b.brand_id
      WHERE p.product_id = ?
    `, [productId]);
    return rows[0];
  }

  // Get product by slug
  static async findBySlug(slug) {
    const [rows] = await db.query(`
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        b.name as brand_name,
        b.slug as brand_slug,
        b.logo_url as brand_logo
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN brands b ON p.brand_id = b.brand_id
      WHERE p.slug = ?
    `, [slug]);
    return rows[0];
  }

  // Get product variants
  static async findVariants(productId) {
    const [rows] = await db.query(`
      SELECT 
        variant_id,
        sku,
        color,
        size,
        price,
        stock,
        created_at
      FROM product_variants
      WHERE product_id = ?
      ORDER BY color, size
    `, [productId]);
    return rows;
  }

  // Get product images
  static async findImages(productId, variantId = null) {
    let query = `
      SELECT 
        image_id,
        product_id,
        variant_id,
        image_url,
        is_main,
        created_at
      FROM product_images
      WHERE product_id = ?
    `;
    const params = [productId];

    if (variantId) {
      query += ' AND (variant_id = ? OR variant_id IS NULL)';
      params.push(variantId);
    }

    query += ' ORDER BY is_main DESC, image_id ASC';

    const [rows] = await db.query(query, params);
    return rows;
  }

  // Create product
  static async create(productData) {
    const { category_id, brand_id, name, slug, description, price, status } = productData;
    const [result] = await db.query(
      `INSERT INTO products (category_id, brand_id, name, slug, description, price, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [category_id, brand_id || null, name, slug, description || null, price, status || 'active']
    );
    return result.insertId;
  }

  // Update product
  static async update(productId, productData) {
    const fields = [];
    const values = [];

    const allowedFields = ['category_id', 'brand_id', 'name', 'slug', 'description', 'price', 'status'];
    
    allowedFields.forEach(field => {
      if (productData[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(productData[field]);
      }
    });

    if (fields.length === 0) return;

    values.push(productId);
    await db.query(
      `UPDATE products SET ${fields.join(', ')} WHERE product_id = ?`,
      values
    );
  }

  // Delete product
  static async delete(productId) {
    await db.query('DELETE FROM products WHERE product_id = ?', [productId]);
  }

  // Add variant
  static async addVariant(variantData) {
    const { product_id, sku, color, size, price, stock } = variantData;
    const [result] = await db.query(
      `INSERT INTO product_variants (product_id, sku, color, size, price, stock)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [product_id, sku, color || null, size || null, price, stock || 0]
    );
    return result.insertId;
  }

  // Update variant
  static async updateVariant(variantId, variantData) {
    const fields = [];
    const values = [];

    const allowedFields = ['sku', 'color', 'size', 'price', 'stock'];
    
    allowedFields.forEach(field => {
      if (variantData[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(variantData[field]);
      }
    });

    if (fields.length === 0) return;

    values.push(variantId);
    await db.query(
      `UPDATE product_variants SET ${fields.join(', ')} WHERE variant_id = ?`,
      values
    );
  }

  // Add image
  static async addImage(imageData) {
    const { product_id, variant_id, image_url, is_main } = imageData;
    
    // If is_main = 1, set all other images to is_main = 0
    if (is_main) {
      await db.query(
        'UPDATE product_images SET is_main = 0 WHERE product_id = ?',
        [product_id]
      );
    }

    const [result] = await db.query(
      `INSERT INTO product_images (product_id, variant_id, image_url, is_main)
       VALUES (?, ?, ?, ?)`,
      [product_id, variant_id || null, image_url, is_main ? 1 : 0]
    );
    return result.insertId;
  }

  // Check if product exists
  static async exists(productId) {
    const [rows] = await db.query(
      'SELECT COUNT(*) as count FROM products WHERE product_id = ?',
      [productId]
    );
    return rows[0].count > 0;
  }

  // Get available colors for a product
  static async getAvailableColors(productId) {
    const [rows] = await db.query(`
      SELECT DISTINCT color
      FROM product_variants
      WHERE product_id = ? AND color IS NOT NULL AND stock > 0
      ORDER BY color
    `, [productId]);
    return rows.map(r => r.color);
  }

  // Get available sizes for a product
  static async getAvailableSizes(productId) {
    const [rows] = await db.query(`
      SELECT DISTINCT size
      FROM product_variants
      WHERE product_id = ? AND size IS NOT NULL AND stock > 0
      ORDER BY size
    `, [productId]);
    return rows.map(r => r.size);
  }
}

module.exports = Product;
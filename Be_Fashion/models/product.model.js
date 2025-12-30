const db = require('../config/database');

class Product {
  // ================================
  // GET PRODUCTS (LIST + FILTER)
  // ================================
  static async findAll(filters = {}) {
    const {
      page = 1,
      limit = 20,
      category_slug,
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

    /* ================================
       CATEGORY (RECURSIVE)
    ================================ */
    let categoryIds = [];

    if (category_slug) {
      const normalizedSlug = category_slug.trim().toLowerCase();

      const [rows] = await db.query(
        `
        WITH RECURSIVE category_tree AS (
          SELECT category_id
          FROM categories
          WHERE slug = ?

          UNION ALL

          SELECT c.category_id
          FROM categories c
          INNER JOIN category_tree ct ON c.parent_id = ct.category_id
        )
        SELECT category_id FROM category_tree
        `,
        [normalizedSlug]
      );

      categoryIds = rows.map(r => r.category_id);

      // ❌ slug không tồn tại → KHÔNG TRẢ ALL
      if (categoryIds.length === 0) {
        return {
          products: [],
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: 0,
            total_pages: 0
          }
        };
      }
    }

    /* ================================
       BASE QUERY
    ================================ */
    let query = `
      SELECT
        p.product_id,
        p.name,
        p.slug,
        p.description,
        p.status,
        p.created_at,

        c.name AS category_name,
        c.slug AS category_slug,

        b.name AS brand_name,
        b.slug AS brand_slug,

        (
          SELECT image_url
          FROM product_images
          WHERE product_id = p.product_id AND is_main = 1
          LIMIT 1
        ) AS main_image,

        MIN(pv.price) AS original_price,

        MIN(
          CASE
            WHEN pv.is_on_sale = 1
             AND NOW() BETWEEN pv.sale_start AND pv.sale_end
            THEN pv.sale_price
            ELSE pv.price
          END
        ) AS price,

        MAX(
          CASE
            WHEN pv.is_on_sale = 1
             AND NOW() BETWEEN pv.sale_start AND pv.sale_end
            THEN pv.sale_percent
            ELSE 0
          END
        ) AS sale_percent,

        MAX(
          CASE
            WHEN pv.is_on_sale = 1
             AND NOW() BETWEEN pv.sale_start AND pv.sale_end
            THEN 1
            ELSE 0
          END
        ) AS is_on_sale,

        COUNT(DISTINCT pv.variant_id) AS variant_count

      FROM products p
      JOIN product_variants pv ON p.product_id = pv.product_id
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN brands b ON p.brand_id = b.brand_id
    `;

    /* ================================
       CONDITIONS
    ================================ */

    conditions.push('p.status = ?');
    params.push(status);

    if (categoryIds.length > 0) {
      conditions.push(
        `p.category_id IN (${categoryIds.map(() => '?').join(',')})`
      );
      params.push(...categoryIds);
    }

    if (brand_id) {
      conditions.push('p.brand_id = ?');
      params.push(brand_id);
    }

    if (min_price) {
      conditions.push(`
        (
          CASE
            WHEN pv.is_on_sale = 1
             AND NOW() BETWEEN pv.sale_start AND pv.sale_end
            THEN pv.sale_price
            ELSE pv.price
          END
        ) >= ?
      `);
      params.push(min_price);
    }

    if (max_price) {
      conditions.push(`
        (
          CASE
            WHEN pv.is_on_sale = 1
             AND NOW() BETWEEN pv.sale_start AND pv.sale_end
            THEN pv.sale_price
            ELSE pv.price
          END
        ) <= ?
      `);
      params.push(max_price);
    }

    if (color) {
      conditions.push('pv.color = ?');
      params.push(color);
    }

    if (size) {
      conditions.push('pv.size = ?');
      params.push(size);
    }

    if (search) {
      conditions.push('(p.name LIKE ? OR p.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` GROUP BY p.product_id HAVING COUNT(pv.variant_id) > 0`;

    const sortMap = {
      newest: 'p.created_at DESC',
      oldest: 'p.created_at ASC',
      price_asc: 'price ASC',
      price_desc: 'price DESC',
      name_asc: 'p.name ASC',
      name_desc: 'p.name DESC'
    };

    query += ` ORDER BY ${sortMap[sort] || sortMap.newest}`;
    query += ` LIMIT ? OFFSET ?`;

    params.push(Number(limit), Number(offset));

    // 🔍 DEBUG (đúng chỗ)
   

    const [products] = await db.query(query, params);

    /* ================================
       COUNT QUERY
    ================================ */
    let countQuery = `
      SELECT COUNT(DISTINCT p.product_id) AS total
      FROM products p
      JOIN product_variants pv ON p.product_id = pv.product_id
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN brands b ON p.brand_id = b.brand_id
    `;

    if (conditions.length) {
      countQuery += ` WHERE ${conditions.join(' AND ')}`;
    }

    const countParams = params.slice(0, params.length - 2);
    const [[{ total }]] = await db.query(countQuery, countParams);

    return {
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        total_pages: Math.ceil(total / limit)
      }
    };
  }
}

module.exports = Product;

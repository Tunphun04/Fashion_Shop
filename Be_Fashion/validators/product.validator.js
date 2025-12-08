const { body, param, query } = require('express-validator');

const productValidator = {
  // List products validation
  list: [
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    
    query('category_id')
      .optional()
      .isInt().withMessage('Category ID must be an integer'),
    
    query('brand_id')
      .optional()
      .isInt().withMessage('Brand ID must be an integer'),
    
    query('min_price')
      .optional()
      .isFloat({ min: 0 }).withMessage('Min price must be a positive number'),
    
    query('max_price')
      .optional()
      .isFloat({ min: 0 }).withMessage('Max price must be a positive number'),
    
    query('search')
      .optional()
      .trim()
      .isLength({ min: 1, max: 255 }).withMessage('Search must be 1-255 characters'),
    
    query('sort')
      .optional()
      .isIn(['newest', 'oldest', 'price_asc', 'price_desc', 'name_asc', 'name_desc'])
      .withMessage('Invalid sort option'),
    
    query('color')
      .optional()
      .trim(),
    
    query('size')
      .optional()
      .trim()
  ],

  // Get product by ID
  getById: [
    param('id')
      .isInt({ min: 1 }).withMessage('Product ID must be a positive integer')
  ],

  // Create product
  create: [
    body('category_id')
      .notEmpty().withMessage('Category is required')
      .isInt().withMessage('Category ID must be an integer'),
    
    body('brand_id')
      .optional()
      .isInt().withMessage('Brand ID must be an integer'),
    
    body('name')
      .trim()
      .notEmpty().withMessage('Product name is required')
      .isLength({ min: 2, max: 200 }).withMessage('Name must be 2-200 characters'),
    
    body('slug')
      .trim()
      .notEmpty().withMessage('Slug is required')
      .isLength({ min: 2, max: 250 }).withMessage('Slug must be 2-250 characters')
      .matches(/^[a-z0-9-]+$/).withMessage('Slug must contain only lowercase letters, numbers and hyphens'),
    
    body('description')
      .optional()
      .trim(),
    
    body('price')
      .notEmpty().withMessage('Price is required')
      .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    
    body('status')
      .optional()
      .isIn(['active', 'inactive', 'draft']).withMessage('Invalid status')
  ],

  // Update product
  update: [
    param('id')
      .isInt({ min: 1 }).withMessage('Product ID must be a positive integer'),
    
    body('category_id')
      .optional()
      .isInt().withMessage('Category ID must be an integer'),
    
    body('brand_id')
      .optional()
      .isInt().withMessage('Brand ID must be an integer'),
    
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 200 }).withMessage('Name must be 2-200 characters'),
    
    body('slug')
      .optional()
      .trim()
      .isLength({ min: 2, max: 250 }).withMessage('Slug must be 2-250 characters')
      .matches(/^[a-z0-9-]+$/).withMessage('Slug must contain only lowercase letters, numbers and hyphens'),
    
    body('description')
      .optional()
      .trim(),
    
    body('price')
      .optional()
      .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    
    body('status')
      .optional()
      .isIn(['active', 'inactive', 'draft']).withMessage('Invalid status')
  ],

  // Add variant
  addVariant: [
    param('id')
      .isInt({ min: 1 }).withMessage('Product ID must be a positive integer'),
    
    body('sku')
      .trim()
      .notEmpty().withMessage('SKU is required')
      .isLength({ min: 1, max: 100 }).withMessage('SKU must be 1-100 characters'),
    
    body('color')
      .optional()
      .trim()
      .isLength({ max: 50 }).withMessage('Color must be max 50 characters'),
    
    body('size')
      .optional()
      .trim()
      .isLength({ max: 50 }).withMessage('Size must be max 50 characters'),
    
    body('price')
      .notEmpty().withMessage('Price is required')
      .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    
    body('stock')
      .optional()
      .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
  ],

  // Add image
  addImage: [
    param('id')
      .isInt({ min: 1 }).withMessage('Product ID must be a positive integer'),
    
    body('variant_id')
      .optional()
      .isInt().withMessage('Variant ID must be an integer'),
    
    body('image_url')
      .trim()
      .notEmpty().withMessage('Image URL is required')
      .isLength({ max: 500 }).withMessage('Image URL must be max 500 characters')
      .isURL().withMessage('Invalid URL format'),
    
    body('is_main')
      .optional()
      .isBoolean().withMessage('is_main must be a boolean')
  ]
};

module.exports = productValidator;
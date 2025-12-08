const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

// Public routes
router.get('/', productController.getCategories);
router.get('/tree', productController.getCategoryTree);

module.exports = router;
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const orderValidator = require('../validators/order.validator');
const validate = require('../middlewares/validator.middleware');
const { authMiddleware, authorizeRoles } = require('../middlewares/auth.middleware');

// All order routes require authentication
router.use(authMiddleware);

// Customer routes
// Checkout preview
router.post('/checkout',
  orderValidator.checkout,
  validate,
  orderController.checkout
);

// Create order
router.post('/',
  orderValidator.createOrder,
  validate,
  orderController.createOrder
);

// Get my orders
router.get('/',
  orderValidator.getOrders,
  validate,
  orderController.getMyOrders
);

// Get order detail
router.get('/:id',
  orderValidator.getOrderDetail,
  validate,
  orderController.getOrderDetail
);

// Cancel order
router.put('/:id/cancel',
  orderValidator.getOrderDetail,
  validate,
  orderController.cancelOrder
);

// Admin routes
// Get all orders
router.get('/admin/all',
  authorizeRoles('admin', 'staff'),
  orderValidator.getOrders,
  validate,
  orderController.getAllOrders
);

// Update order status
router.put('/admin/:id/status',
  authorizeRoles('admin', 'staff'),
  orderValidator.updateStatus,
  validate,
  orderController.updateOrderStatus
);

// Get statistics
router.get('/admin/statistics',
  authorizeRoles('admin'),
  orderController.getStatistics
);

module.exports = router;
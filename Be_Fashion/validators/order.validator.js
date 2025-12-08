const { body, param, query } = require('express-validator');

const orderValidator = {
  // Checkout validation
  checkout: [
    body('address_id')
      .notEmpty().withMessage('Address is required')
      .isInt({ min: 1 }).withMessage('Invalid address ID')
  ],

  // Create order validation
  createOrder: [
    body('address_id')
      .notEmpty().withMessage('Address is required')
      .isInt({ min: 1 }).withMessage('Invalid address ID'),
    
    body('payment_method')
      .notEmpty().withMessage('Payment method is required')
      .isIn(['cod', 'credit', 'momo', 'zalopay']).withMessage('Invalid payment method'),
    
    body('card_data')
      .optional()
      .isObject().withMessage('Card data must be an object')
  ],

  // Get order detail validation
  getOrderDetail: [
    param('id')
      .isInt({ min: 1 }).withMessage('Invalid order ID')
  ],

  // Get orders list validation
  getOrders: [
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    
    query('status')
      .optional()
      .isIn(['pending', 'paid', 'shipping', 'completed', 'cancelled'])
      .withMessage('Invalid status')
  ],

  // Update status validation (Admin)
  updateStatus: [
    param('id')
      .isInt({ min: 1 }).withMessage('Invalid order ID'),
    
    body('status')
      .notEmpty().withMessage('Status is required')
      .isIn(['pending', 'paid', 'shipping', 'completed', 'cancelled'])
      .withMessage('Invalid status')
  ]
};

module.exports = orderValidator;
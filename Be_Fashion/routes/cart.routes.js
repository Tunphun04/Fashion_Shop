const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const cartValidator = require('../validators/cart.validator');
const validate = require('../middlewares/validator.middleware');
const { authMiddleware } = require('../middlewares/auth.middleware');

// All cart routes require authentication
router.use(authMiddleware);

// Get cart
router.get('/', cartController.getCart);

// Get cart item count (for badge)
router.get('/count', cartController.getCartCount);

// Add to cart
router.post('/',
  cartValidator.addToCart,
  validate,
  cartController.addToCart
);

// Update cart item
router.put('/:itemId',
  cartValidator.updateItem,
  validate,
  cartController.updateCartItem
);

// Remove cart item
router.delete('/:itemId',
  cartValidator.removeItem,
  validate,
  cartController.removeCartItem
);

// Clear cart
router.delete('/', cartController.clearCart);

module.exports = router;
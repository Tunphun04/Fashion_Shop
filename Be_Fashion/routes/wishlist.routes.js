const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlist.controller');
const wishlistValidator = require('../validators/wishlist.validator');
const validate = require('../middlewares/validator.middleware');
const { authMiddleware } = require('../middlewares/auth.middleware');

// All wishlist routes require authentication
router.use(authMiddleware);

// Get wishlist
router.get('/', wishlistController.getWishlist);

// Get wishlist item count (for badge)
router.get('/count', wishlistController.getWishlistCount);

// Check if product in wishlist
router.get('/check/:productId',
  wishlistValidator.checkProduct,
  validate,
  wishlistController.checkProduct
);

// Add to wishlist
router.post('/',
  wishlistValidator.addToWishlist,
  validate,
  wishlistController.addToWishlist
);

// Move to cart
router.post('/:id/move-to-cart',
  wishlistValidator.removeItem,
  validate,
  wishlistController.moveToCart
);

// Remove from wishlist
router.delete('/:id',
  wishlistValidator.removeItem,
  validate,
  wishlistController.removeFromWishlist
);

// Clear wishlist
router.delete('/', wishlistController.clearWishlist);

module.exports = router;
const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const productValidator = require('../validators/product.validator');
const validate = require('../middlewares/validator.middleware');
const { authMiddleware, authorizeRoles } = require('../middlewares/auth.middleware');

// Public routes
router.get('/',
  productValidator.list,
  validate,
  productController.getProducts
);

router.get('/slug/:slug',
  productController.getProductBySlug
);

router.get('/:id',
  productValidator.getById,
  validate,
  productController.getProductById
);

router.get('/:id/variants',
  productValidator.getById,
  validate,
  productController.getProductVariants
);

router.get('/:id/images',
  productValidator.getById,
  validate,
  productController.getProductImages
);

// Admin routes (require authentication and admin role)
router.post('/',
  authMiddleware,
  authorizeRoles('admin', 'staff'),
  productValidator.create,
  validate,
  productController.createProduct
);

router.put('/:id',
  authMiddleware,
  authorizeRoles('admin', 'staff'),
  productValidator.update,
  validate,
  productController.updateProduct
);

router.delete('/:id',
  authMiddleware,
  authorizeRoles('admin'),
  productValidator.getById,
  validate,
  productController.deleteProduct
);

router.post('/:id/variants',
  authMiddleware,
  authorizeRoles('admin', 'staff'),
  productValidator.addVariant,
  validate,
  productController.addVariant
);

router.post('/:id/images',
  authMiddleware,
  authorizeRoles('admin', 'staff'),
  productValidator.addImage,
  validate,
  productController.addImage
);

module.exports = router;
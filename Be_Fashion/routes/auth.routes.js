const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authValidator = require('../validators/auth.validator');
const validate = require('../middlewares/validator.middleware');
const { authMiddleware } = require('../middlewares/auth.middleware');

// Public routes
router.post('/register', 
  authValidator.register, 
  validate, 
  authController.register
);

router.post('/login', 
  authValidator.login, 
  validate, 
  authController.login
);

router.post('/refresh-token', 
  authValidator.refreshToken, 
  validate, 
  authController.refreshToken
);

router.post('/forgot-password', 
  authValidator.forgotPassword, 
  validate, 
  authController.forgotPassword
);

router.post('/reset-password', 
  authValidator.resetPassword, 
  validate, 
  authController.resetPassword
);

// Protected routes (require authentication)
router.post('/logout', 
  authMiddleware, 
  authController.logout
);

router.get('/me', 
  authMiddleware, 
  authController.getCurrentUser
);

module.exports = router;
const AuthService = require('../services/auth.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const authController = {
  // Register
  register: asyncHandler(async (req, res) => {
    const result = await AuthService.register(req.body);
    
    res.status(201).json(
      new ApiResponse(201, result, 'User registered successfully')
    );
  }),

  // Login
  login: asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    
    res.status(200).json(
      new ApiResponse(200, result, 'Login successful')
    );
  }),

  // Refresh Token
  refreshToken: asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const result = await AuthService.refreshToken(refreshToken);
    
    res.status(200).json(
      new ApiResponse(200, result, 'Token refreshed successfully')
    );
  }),

  // Logout
  logout: asyncHandler(async (req, res) => {
    await AuthService.logout(req.user.userId);
    
    res.status(200).json(
      new ApiResponse(200, null, 'Logout successful')
    );
  }),

  // Forgot Password
  forgotPassword: asyncHandler(async (req, res) => {
    const { email } = req.body;
    const result = await AuthService.forgotPassword(email);
    
    res.status(200).json(
      new ApiResponse(200, result, result.message)
    );
  }),

  // Reset Password
  resetPassword: asyncHandler(async (req, res) => {
    const { email, token, newPassword } = req.body;
    const result = await AuthService.resetPassword(email, token, newPassword);
    
    res.status(200).json(
      new ApiResponse(200, result, result.message)
    );
  }),

  // Get Current User
  getCurrentUser: asyncHandler(async (req, res) => {
    const user = await AuthService.getCurrentUser(req.user.userId);
    
    res.status(200).json(
      new ApiResponse(200, user, 'User retrieved successfully')
    );
  })
};

module.exports = authController;
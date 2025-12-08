const User = require('../models/user.model');
const TokenService = require('./token.service');
const EmailService = require('./email.service');
const ApiError = require('../utils/ApiError');

class AuthService {
  // Register new user
  static async register(userData) {
    const { email, password, full_name, phone } = userData;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new ApiError(409, 'Email already registered');
    }

    // Create user
    const userId = await User.create({
      full_name,
      email,
      password,
      phone,
      role_id: 1 // default customer role
    });

    // Get created user
    const user = await User.findById(userId);

    // Generate tokens
    const accessToken = TokenService.generateAccessToken(user);
    const refreshToken = TokenService.generateRefreshToken(user);

    // Store refresh token
    await TokenService.storeRefreshToken(userId, refreshToken);

    // Send welcome email (non-blocking)
    EmailService.sendWelcomeEmail(email, full_name).catch(err => 
      console.error('Welcome email failed:', err)
    );

    return {
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role_name
      },
      accessToken,
      refreshToken
    };
  }

  // Login
  static async login(email, password) {
    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Check if account is active
    if (!user.is_active) {
      throw new ApiError(403, 'Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await User.verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Generate tokens
    const accessToken = TokenService.generateAccessToken(user);
    const refreshToken = TokenService.generateRefreshToken(user);

    // Store refresh token
    await TokenService.storeRefreshToken(user.user_id, refreshToken);

    return {
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role_name
      },
      accessToken,
      refreshToken
    };
  }

  // Refresh Token
  static async refreshToken(refreshToken) {
    // Verify refresh token
    let decoded;
    try {
      decoded = TokenService.verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }

    // Check if token exists in Redis
    const storedToken = await TokenService.getStoredRefreshToken(decoded.userId);
    if (!storedToken || storedToken !== refreshToken) {
      throw new ApiError(401, 'Refresh token not found or already used');
    }

    // Get user
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (!user.is_active) {
      throw new ApiError(403, 'Account is deactivated');
    }

    // Generate new tokens
    const newAccessToken = TokenService.generateAccessToken(user);
    const newRefreshToken = TokenService.generateRefreshToken(user);

    // Store new refresh token (replace old one)
    await TokenService.storeRefreshToken(user.user_id, newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }

  // Logout
  static async logout(userId) {
    await TokenService.deleteRefreshToken(userId);
    return true;
  }

  // Forgot Password - Send Reset Email
  static async forgotPassword(email) {
    // Check if user exists
    const user = await User.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists or not (security)
      return { message: 'If email exists, reset link has been sent' };
    }

    // Generate reset token
    const resetToken = TokenService.generateResetToken();

    // Store reset token in Redis
    await TokenService.storeResetToken(email, resetToken);

    // Send reset email
    await EmailService.sendPasswordResetEmail(email, resetToken);

    return { message: 'Password reset link has been sent to your email' };
  }

  // Reset Password
  static async resetPassword(email, token, newPassword) {
    // Verify reset token
    const isValid = await TokenService.verifyResetToken(email, token);
    if (!isValid) {
      throw new ApiError(400, 'Invalid or expired reset token');
    }

    // Check if user exists
    const user = await User.findByEmail(email);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Update password
    await User.updatePassword(user.user_id, newPassword);

    // Delete reset token
    await TokenService.deleteResetToken(email);

    // Delete all refresh tokens (logout from all devices)
    await TokenService.deleteRefreshToken(user.user_id);

    return { message: 'Password reset successfully' };
  }

  // Get Current User Profile
  static async getCurrentUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return {
      user_id: user.user_id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      avatar_url: user.avatar_url,
      role: user.role_name,
      created_at: user.created_at
    };
  }
}

module.exports = AuthService;
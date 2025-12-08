const jwt = require('jsonwebtoken');
const redis = require('../config/redis');
const crypto = require('crypto');

class TokenService {
  // Generate Access Token
  static generateAccessToken(user) {
    const payload = {
      userId: user.user_id,
      email: user.email,
      role: user.role_name || 'customer'
    };

    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m'
    });
  }

  // Generate Refresh Token
  static generateRefreshToken(user) {
    const payload = {
      userId: user.user_id,
      email: user.email
    };

    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
    });
  }

  // Store Refresh Token in Redis
  static async storeRefreshToken(userId, refreshToken) {
    const key = `refresh_token:${userId}`;
    const expiresIn = 7 * 24 * 60 * 60; // 7 days in seconds
    await redis.setex(key, expiresIn, refreshToken);
  }

  // Verify Access Token
  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  // Verify Refresh Token
  static verifyRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  // Get stored Refresh Token from Redis
  static async getStoredRefreshToken(userId) {
    const key = `refresh_token:${userId}`;
    return await redis.get(key);
  }

  // Delete Refresh Token (Logout)
  static async deleteRefreshToken(userId) {
    const key = `refresh_token:${userId}`;
    await redis.del(key);
  }

  // Generate Password Reset Token
  static generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Store Reset Token in Redis (expires in 1 hour)
  static async storeResetToken(email, token) {
    const key = `reset_token:${email}`;
    const expiresIn = 60 * 60; // 1 hour
    await redis.setex(key, expiresIn, token);
  }

  // Verify Reset Token
  static async verifyResetToken(email, token) {
    const key = `reset_token:${email}`;
    const storedToken = await redis.get(key);
    return storedToken === token;
  }

  // Delete Reset Token
  static async deleteResetToken(email) {
    const key = `reset_token:${email}`;
    await redis.del(key);
  }
}

module.exports = TokenService;
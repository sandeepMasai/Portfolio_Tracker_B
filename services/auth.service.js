const User = require('../models/User');
const { generateToken, verifyToken } = require('../config/jwt');
const createHttpError = require('http-errors');
const logger = require('../utils/logger');
require('dotenv').config();

class AuthService {
  async register(name, email, password) {
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw createHttpError(409, 'User with this email already exists');
      }

      const user = new User({ name, email, password });
      await user.save();

      logger.info(`New user registered: ${user.email}`);

      // Remove sensitive fields
      const sanitizedUser = user.toObject();
      delete sanitizedUser.password;

      return sanitizedUser;
    } catch (error) {
      logger.error(`Error registering user: ${error.message}`);
      throw error;
    }
  }

  async login(email, password) {
    try {
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        throw createHttpError(401, 'Invalid credentials');
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw createHttpError(401, 'Invalid credentials');
      }

      const token = generateToken(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        process.env.JWT_EXPIRY
      );

      logger.info(`User logged in: ${user.email}`);

      const sanitizedUser = user.toObject();
      delete sanitizedUser.password;

      return { user: sanitizedUser, token };
    } catch (error) {
      logger.error(`Error logging in user: ${error.message}`);
      throw error;
    }
  }

  async refreshToken(oldRefreshToken) {
    try {
      const decoded = verifyToken(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET);
      if (!decoded?.userId) {
        throw createHttpError(403, 'Invalid or expired refresh token');
      }

      const user = await User.findById(decoded.userId);
      if (!user) {
        throw createHttpError(404, 'User not found');
      }

      const newToken = generateToken(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        process.env.JWT_EXPIRY
      );

      logger.info(`Token refreshed for user: ${user.email}`);
      return { token: newToken };
    } catch (error) {
      logger.error(`Error refreshing token: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new AuthService();

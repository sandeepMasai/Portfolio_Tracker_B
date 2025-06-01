const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const Asset = require('../models/Asset');
const Transaction = require('../models/Transaction');
const createHttpError = require('http-errors');
const logger = require('../utils/logger');

class UserService {
  async getUserProfile(userId) {
    try {
      const user = await User.findById(userId).select('-password').lean();
      if (!user) {
        throw createHttpError(404, 'User not found');
      }
      logger.info(`Fetched profile for user: ${userId}`);
      return user;
    } catch (error) {
      logger.error(`Error fetching user profile ${userId}: ${error.message}`);
      throw error;
    }
  }

  async updateProfile(userId, updateData) {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { ...updateData, updatedAt: Date.now() },
        { new: true, runValidators: true }
      ).select('-password').lean();

      if (!updatedUser) {
        throw createHttpError(404, 'User not found');
      }
      logger.info(`Updated profile for user: ${userId}`);
      return updatedUser;
    } catch (error) {
      logger.error(`Error updating user profile ${userId}: ${error.message}`);
      throw error;
    }
  }

  async deleteAccount(userId) {
    try {
      // Delete associated portfolios, assets, and transactions first
      await Portfolio.deleteMany({ userId });
      await Asset.deleteMany({ userId });
      await Transaction.deleteMany({ userId });

      const result = await User.findByIdAndDelete(userId);
      if (!result) {
        throw createHttpError(404, 'User not found');
      }
      logger.info(`User account and all associated data deleted: ${userId}`);
      return { message: 'Account and all associated data deleted successfully' };
    } catch (error) {
      logger.error(`Error deleting account for user ${userId}: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new UserService();
const Portfolio = require('../models/Portfolio');
const Asset = require('../models/Asset'); 
const createHttpError = require('http-errors');
const logger = require('../utils/logger');

class PortfolioService {
  async createPortfolio(userId, name, description) {
    try {
      const portfolio = new Portfolio({ userId, name, description });
      await portfolio.save();
      logger.info(`Portfolio created: ${name} by user ${userId}`);
      return portfolio;
    } catch (error) {
      logger.error(`Error creating portfolio for user ${userId}: ${error.message}`);
      throw error;
    }
  }

  async getPortfolios(userId) {
    try {
      const portfolios = await Portfolio.find({ userId }).lean(); // .lean() for faster reads
      return portfolios;
    } catch (error) {
      logger.error(`Error fetching portfolios for user ${userId}: ${error.message}`);
      throw error;
    }
  }

  async getPortfolioById(userId, portfolioId) {
    try {
      const portfolio = await Portfolio.findOne({ _id: portfolioId, userId }).lean();
      return portfolio;
    } catch (error) {
      logger.error(`Error fetching portfolio ${portfolioId} for user ${userId}: ${error.message}`);
      throw error;
    }
  }

  async updatePortfolio(userId, portfolioId, name, description) {
    try {
      const updatedPortfolio = await Portfolio.findOneAndUpdate(
        { _id: portfolioId, userId },
        { name, description, updatedAt: Date.now() },
        { new: true, runValidators: true }
      ).lean();
      if (!updatedPortfolio) {
        throw createHttpError(404, 'Portfolio not found or unauthorized');
      }
      logger.info(`Portfolio updated: ${portfolioId} by user ${userId}`);
      return updatedPortfolio;
    } catch (error) {
      logger.error(`Error updating portfolio ${portfolioId} for user ${userId}: ${error.message}`);
      throw error;
    }
  }

  async deletePortfolio(userId, portfolioId) {
    try {
      const result = await Portfolio.findOneAndDelete({ _id: portfolioId, userId });
      if (!result) {
        throw createHttpError(404, 'Portfolio not found or unauthorized');
      }
      // Also delete all associated assets
      await Asset.deleteMany({ portfolioId });
      logger.info(`Portfolio and its assets deleted: ${portfolioId} by user ${userId}`);
      return { message: 'Portfolio and associated assets deleted successfully' };
    } catch (error) {
      logger.error(`Error deleting portfolio ${portfolioId} for user ${userId}: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new PortfolioService();
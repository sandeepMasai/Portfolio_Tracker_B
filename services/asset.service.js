const Asset = require('../models/Asset');
const Portfolio = require('../models/Portfolio');
const Transaction = require('../models/Transaction');
const createHttpError = require('http-errors');
const logger = require('../utils/logger');

class AssetService {
  async addAsset(userId, portfolioId, assetData) {
    try {
      // Verify portfolio ownership
      const portfolio = await Portfolio.findOne({ _id: portfolioId, userId });
      if (!portfolio) {
        throw createHttpError(404, 'Portfolio not found or unauthorized');
      }

      const newAsset = new Asset({ ...assetData, portfolioId, userId });
      await newAsset.save();

      // Create a BUY transaction for the added asset
      const transaction = new Transaction({
        userId,
        portfolioId,
        assetId: newAsset._id,
        symbol: newAsset.symbol,
        type: 'BUY',
        quantity: newAsset.quantity,
        pricePerUnit: newAsset.purchasePrice,
        amount: newAsset.quantity * newAsset.purchasePrice,
        transactionDate: newAsset.purchaseDate,
        notes: `Initial purchase of ${newAsset.symbol} for portfolio ${portfolio.name}`,
      });
      await transaction.save();

      logger.info(`Asset added: ${newAsset.symbol} to portfolio ${portfolioId} by user ${userId}`);
      return newAsset;
    } catch (error) {
      logger.error(`Error adding asset to portfolio ${portfolioId} for user ${userId}: ${error.message}`);
      throw error;
    }
  }

  async getAssetsByPortfolio(userId, portfolioId) {
    try {
      // Verify portfolio ownership
      const portfolio = await Portfolio.findOne({ _id: portfolioId, userId });
      if (!portfolio) {
        throw createHttpError(404, 'Portfolio not found or unauthorized');
      }
      const assets = await Asset.find({ portfolioId, userId }).lean();
      return assets;
    } catch (error) {
      logger.error(`Error fetching assets for portfolio ${portfolioId} by user ${userId}: ${error.message}`);
      throw error;
    }
  }

  async getAssetById(userId, assetId) {
    try {
      const asset = await Asset.findOne({ _id: assetId, userId }).lean();
      return asset;
    } catch (error) {
      logger.error(`Error fetching asset ${assetId} for user ${userId}: ${error.message}`);
      throw error;
    }
  }

  async updateAsset(userId, assetId, updateData) {
    try {
      const updatedAsset = await Asset.findOneAndUpdate(
        { _id: assetId, userId },
        { ...updateData, updatedAt: Date.now() },
        { new: true, runValidators: true }
      ).lean();
      if (!updatedAsset) {
        throw createHttpError(404, 'Asset not found or unauthorized');
      }
      logger.info(`Asset updated: ${assetId} by user ${userId}`);
      return updatedAsset;
    } catch (error) {
      logger.error(`Error updating asset ${assetId} for user ${userId}: ${error.message}`);
      throw error;
    }
  }

  async deleteAsset(userId, assetId) {
    try {
      const result = await Asset.findOneAndDelete({ _id: assetId, userId });
      if (!result) {
        throw createHttpError(404, 'Asset not found or unauthorized');
      }
     
      logger.info(`Asset deleted: ${assetId} by user ${userId}`);
      return { message: 'Asset deleted successfully' };
    } catch (error) {
      logger.error(`Error deleting asset ${assetId} for user ${userId}: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new AssetService();
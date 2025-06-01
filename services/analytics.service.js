const Portfolio = require('../models/Portfolio');
const Asset = require('../models/Asset');
const Transaction = require('../models/Transaction');
const MarketDataService = require('./marketData.service'); 
const createHttpError = require('http-errors');
const logger = require('../utils/logger');
const _ = require('lodash'); 

class AnalyticsService {
  async getPortfolioValue(userId, portfolioId) {
    try {
      const portfolio = await Portfolio.findOne({ _id: portfolioId, userId });
      if (!portfolio) {
        throw createHttpError(404, 'Portfolio not found or unauthorized');
      }

      const assets = await Asset.find({ portfolioId, userId }).lean();
      let totalValue = 0;

      for (const asset of assets) {
        try {
          const currentPrice = await MarketDataService.getRealTimePrice(asset.symbol);
          totalValue += asset.quantity * currentPrice;
        } catch (priceError) {
          logger.warn(`Could not get real-time price for ${asset.symbol}. Using last known price or 0. Error: ${priceError.message}`);
          // Optionally use asset.currentPrice if available, or just skip
          totalValue += asset.quantity * (asset.currentPrice || 0);
        }
      }
      logger.info(`Calculated total value for portfolio ${portfolioId}: ${totalValue}`);
      return totalValue;
    } catch (error) {
      logger.error(`Error calculating portfolio value for ${portfolioId}: ${error.message}`);
      throw error;
    }
  }

  async getGainsLosses(userId, portfolioId) {
    try {
      const portfolio = await Portfolio.findOne({ _id: portfolioId, userId });
      if (!portfolio) {
        throw createHttpError(404, 'Portfolio not found or unauthorized');
      }

      const assets = await Asset.find({ portfolioId, userId }).lean();
      let totalRealizedGains = 0;
      let totalUnrealizedGains = 0;

      for (const asset of assets) {
        // Unrealized Gains/Losses
        try {
          const currentPrice = await MarketDataService.getRealTimePrice(asset.symbol);
          totalUnrealizedGains += (currentPrice - asset.purchasePrice) * asset.quantity;
        } catch (priceError) {
          logger.warn(`Could not get real-time price for ${asset.symbol} for unrealized gains. Error: ${priceError.message}`);
          totalUnrealizedGains += (asset.currentPrice - asset.purchasePrice) * asset.quantity;
        }
      }

      // Realized Gains/Losses (requires tracking BUY and SELL transactions)
      const transactions = await Transaction.find({
        userId,
        portfolioId,
        type: { $in: ['BUY', 'SELL'] },
      }).sort({ transactionDate: 1 }).lean();

      // This is a simplified FIFO calculation. A more robust solution would track cost basis per lot.
      const assetHoldings = {}; // {symbol: [{quantity, purchasePrice, purchaseDate}]}

      for (const trans of transactions) {
        const symbol = trans.symbol;
        if (trans.type === 'BUY') {
          if (!assetHoldings[symbol]) {
            assetHoldings[symbol] = [];
          }
          assetHoldings[symbol].push({
            quantity: trans.quantity,
            pricePerUnit: trans.pricePerUnit,
            date: trans.transactionDate,
          });
        } else if (trans.type === 'SELL') {
          let quantityToSell = trans.quantity;
          let costBasisOfSoldAssets = 0;

          if (assetHoldings[symbol]) {
            while (quantityToSell > 0 && assetHoldings[symbol].length > 0) {
              const oldestLot = assetHoldings[symbol][0];
              const quantityFromLot = Math.min(quantityToSell, oldestLot.quantity);

              costBasisOfSoldAssets += quantityFromLot * oldestLot.pricePerUnit;
              oldestLot.quantity -= quantityFromLot;
              quantityToSell -= quantityFromLot;

              if (oldestLot.quantity === 0) {
                assetHoldings[symbol].shift(); 
              }
            }
          }
          totalRealizedGains += (trans.amount - costBasisOfSoldAssets);
        }
      }

      logger.info(`Calculated gains/losses for portfolio ${portfolioId}: Realized=${totalRealizedGains}, Unrealized=${totalUnrealizedGains}`);
      return { realized: totalRealizedGains, unrealized: totalUnrealizedGains };
    } catch (error) {
      logger.error(`Error calculating gains/losses for portfolio ${portfolioId}: ${error.message}`);
      throw error;
    }
  }

  async getHistoricalPerformance(userId, portfolioId, startDate, endDate) {
    try {
      const portfolio = await Portfolio.findOne({ _id: portfolioId, userId });
      if (!portfolio) {
        throw createHttpError(404, 'Portfolio not found or unauthorized');
      }

     

      const assets = await Asset.find({ portfolioId, userId }).lean();
      const performanceData = [];
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Generate dates between start and end
      const dates = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }

      for (const date of dates) {
        let dailyPortfolioValue = 0;
        for (const asset of assets) {
          try {
           
            const historicalPrices = await MarketDataService.getHistoricalData(asset.symbol, 'daily', 'full'); 
            const priceOnDate = historicalPrices.find(p => {
              const pDate = new Date(p.date);
              return pDate.getFullYear() === date.getFullYear() &&
                     pDate.getMonth() === date.getMonth() &&
                     pDate.getDate() === date.getDate();
            });
            dailyPortfolioValue += asset.quantity * (priceOnDate ? priceOnDate.close : asset.purchasePrice); 
          } catch (priceError) {
            logger.warn(`Could not get historical price for ${asset.symbol} on ${date.toISOString().split('T')[0]}. Error: ${priceError.message}`);
            dailyPortfolioValue += asset.quantity * asset.purchasePrice; 
          }
        }
        performanceData.push({
          date: date.toISOString().split('T')[0],
          value: dailyPortfolioValue,
        });
      }

      logger.info(`Calculated historical performance for portfolio ${portfolioId} from ${startDate} to ${endDate}`);
      return performanceData;
    } catch (error) {
      logger.error(`Error calculating historical performance for portfolio ${portfolioId}: ${error.message}`);
      throw error;
    }
  }

  async getDiversificationAnalysis(userId, portfolioId) {
    try {
      const portfolio = await Portfolio.findOne({ _id: portfolioId, userId });
      if (!portfolio) {
        throw createHttpError(404, 'Portfolio not found or unauthorized');
      }

      const assets = await Asset.find({ portfolioId, userId }).lean();
      if (assets.length === 0) {
        return { message: 'No assets in portfolio for diversification analysis.' };
      }

      let totalPortfolioValue = 0;
      const assetValues = await Promise.all(assets.map(async asset => {
        try {
          const currentPrice = await MarketDataService.getRealTimePrice(asset.symbol);
          const value = asset.quantity * currentPrice;
          totalPortfolioValue += value;
          return { ...asset, currentValue: value };
        } catch (priceError) {
          logger.warn(`Could not get real-time price for ${asset.symbol} for diversification. Error: ${priceError.message}`);
          const value = asset.quantity * (asset.currentPrice || asset.purchasePrice);
          totalPortfolioValue += value;
          return { ...asset, currentValue: value };
        }
      }));

      // Group by asset type
      const diversificationByType = _.groupBy(assetValues, 'type');
      const typeDistribution = Object.entries(diversificationByType).map(([type, assetsOfType]) => {
        const typeValue = assetsOfType.reduce((sum, asset) => sum + asset.currentValue, 0);
        return {
          type: type,
          value: typeValue,
          percentage: (typeValue / totalPortfolioValue) * 100,
        };
      });

      // Group by symbol (top holdings)
      const diversificationBySymbol = _.groupBy(assetValues, 'symbol');
      const symbolDistribution = Object.entries(diversificationBySymbol).map(([symbol, assetsOfSymbol]) => {
        const symbolValue = assetsOfSymbol.reduce((sum, asset) => sum + asset.currentValue, 0);
        return {
          symbol: symbol,
          value: symbolValue,
          percentage: (symbolValue / totalPortfolioValue) * 100,
        };
      }).sort((a, b) => b.percentage - a.percentage); 

      logger.info(`Performed diversification analysis for portfolio ${portfolioId}`);
      return {
        totalPortfolioValue,
        typeDistribution,
        symbolDistribution: symbolDistribution.slice(0, 10), 
      };
    } catch (error) {
      logger.error(`Error performing diversification analysis for portfolio ${portfolioId}: ${error.message}`);
      throw error;
    }
  }

  async getRiskAnalysis(userId, portfolioId) {
    try {
      const portfolio = await Portfolio.findOne({ _id: portfolioId, userId });
      if (!portfolio) {
        throw createHttpError(404, 'Portfolio not found or unauthorized');
      }

      const assets = await Asset.find({ portfolioId, userId }).lean();
      if (assets.length === 0) {
        return { message: 'No assets in portfolio for risk analysis.' };
      }

     
      const riskScores = {
        'Stock': 0.7,
        'Crypto': 0.9,
        'Bond': 0.2,
        'Mutual Fund': 0.4,
        'ETF': 0.5,
        'Other': 0.6,
      };

      let totalWeightedRisk = 0;
      let totalValue = 0;

      const assetValues = await Promise.all(assets.map(async asset => {
        try {
          const currentPrice = await MarketDataService.getRealTimePrice(asset.symbol);
          const value = asset.quantity * currentPrice;
          return { ...asset, currentValue: value };
        } catch (priceError) {
          logger.warn(`Could not get real-time price for ${asset.symbol} for risk analysis. Error: ${priceError.message}`);
          return { ...asset, currentValue: asset.quantity * (asset.currentPrice || asset.purchasePrice) };
        }
      }));

      assetValues.forEach(asset => {
        totalValue += asset.currentValue;
        totalWeightedRisk += asset.currentValue * (riskScores[asset.type] || riskScores['Other']);
      });

      const averageRiskScore = totalValue > 0 ? totalWeightedRisk / totalValue : 0;
      let riskLevel;
      if (averageRiskScore < 0.3) riskLevel = 'Low';
      else if (averageRiskScore < 0.6) riskLevel = 'Medium';
      else riskLevel = 'High';

      logger.info(`Performed risk analysis for portfolio ${portfolioId}: Average Risk Score=${averageRiskScore}, Level=${riskLevel}`);
      return {
        averageRiskScore: parseFloat(averageRiskScore.toFixed(2)),
        riskLevel: riskLevel,
       
      };
    } catch (error) {
      logger.error(`Error performing risk analysis for portfolio ${portfolioId}: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new AnalyticsService();
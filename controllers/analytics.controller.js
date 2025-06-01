const AnalyticsService = require('../services/analytics.service');
const createHttpError = require('http-errors');

class AnalyticsController {
  async getPortfolioValue(req, res, next) {
    try {
      const { portfolioId } = req.params;
      const userId = req.user._id;
      const value = await AnalyticsService.getPortfolioValue(userId, portfolioId);
      res.json({ portfolioId, currentValue: value });
    } catch (error) {
      next(error);
    }
  }

  async getGainsLosses(req, res, next) {
    try {
      const { portfolioId } = req.params;
      const userId = req.user._id;
      const { realized, unrealized } = await AnalyticsService.getGainsLosses(userId, portfolioId);
      res.json({ portfolioId, realizedGains: realized, unrealizedGains: unrealized });
    } catch (error) {
      next(error);
    }
  }

  async getHistoricalPerformance(req, res, next) {
    try {
      const { portfolioId } = req.params;
      const userId = req.user._id;
      const { startDate, endDate } = req.query; // Expect YYYY-MM-DD format
      const performance = await AnalyticsService.getHistoricalPerformance(userId, portfolioId, startDate, endDate);
      res.json({ portfolioId, historicalPerformance: performance });
    } catch (error) {
      next(error);
    }
  }

  async getDiversificationAnalysis(req, res, next) {
    try {
      const { portfolioId } = req.params;
      const userId = req.user._id;
      const diversification = await AnalyticsService.getDiversificationAnalysis(userId, portfolioId);
      res.json({ portfolioId, diversification });
    } catch (error) {
      next(error);
    }
  }

  async getRiskAnalysis(req, res, next) {
    try {
      const { portfolioId } = req.params;
      const userId = req.user._id;
      const riskAnalysis = await AnalyticsService.getRiskAnalysis(userId, portfolioId);
      res.json({ portfolioId, riskAnalysis });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnalyticsController();
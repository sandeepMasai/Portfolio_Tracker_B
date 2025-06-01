const MarketDataService = require('../services/marketData.service');
const createHttpError = require('http-errors');

class MarketDataController {
  async getRealTimePrice(req, res, next) {
    try {
      const { symbol } = req.query;
      if (!symbol) {
        throw createHttpError(400, 'Symbol is required');
      }
      const price = await MarketDataService.getRealTimePrice(symbol);
      res.json({ symbol, price });
    } catch (error) {
      next(error);
    }
  }

  async getHistoricalData(req, res, next) {
    try {
      const { symbol, interval, range } = req.query;
      if (!symbol || !interval || !range) {
        throw createHttpError(400, 'Symbol, interval, and range are required');
      }
      const historicalData = await MarketDataService.getHistoricalData(symbol, interval, range);
      res.json({ symbol, historicalData });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MarketDataController();
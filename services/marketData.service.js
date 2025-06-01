const axios = require('axios');
const MarketData = require('../models/MarketData');
const createHttpError = require('http-errors');
const logger = require('../utils/logger');
const cacheService = require('./cache.service'); 
require('dotenv').config();

const ALPHA_VANTAGE_API_KEY = process.env.MARKET_DATA_API_KEY;
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';
const CACHE_TTL = 60 * 5; 

class MarketDataService {
  async getRealTimePrice(symbol) {
    const cacheKey = `realtime_price:${symbol}`;
    let price = await cacheService.get(cacheKey);

    if (price) {
      logger.info(`Serving real-time price for ${symbol} from cache.`);
      return parseFloat(price);
    }

    try {
      // Alpha Vantage for stocks
      const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol,
          apikey: ALPHA_VANTAGE_API_KEY,
        },
      });

      const data = response.data['Global Quote'];
      if (data && data['05. price']) {
        price = parseFloat(data['05. price']);
        await cacheService.set(cacheKey, price, CACHE_TTL); 
        logger.info(`Fetched real-time price for ${symbol}: ${price}`);
        return price;
      } else {
        
        throw createHttpError(404, `Could not fetch real-time price for ${symbol}. Check symbol or API.`);
      }
    } catch (error) {
      logger.error(`Error fetching real-time price for ${symbol}: ${error.message}`);
      if (error.response) {
        logger.error(`API Response Error: ${JSON.stringify(error.response.data)}`);
      }
      throw createHttpError(error.response?.status || 500, `Failed to fetch real-time price for ${symbol}`);
    }
  }

  async getHistoricalData(symbol, interval, range) {
    const cacheKey = `historical_data:${symbol}:${interval}:${range}`;
    let historicalData = await cacheService.get(cacheKey);

    if (historicalData) {
      logger.info(`Serving historical data for ${symbol} from cache.`);
      return JSON.parse(historicalData);
    }

    try {
      let functionName;
      switch (interval) {
        case '1min': functionName = 'TIME_SERIES_INTRADAY'; break;
        case '5min': functionName = 'TIME_SERIES_INTRADAY'; break;
        case '15min': functionName = 'TIME_SERIES_INTRADAY'; break;
        case '30min': functionName = 'TIME_SERIES_INTRADAY'; break;
        case '60min': functionName = 'TIME_SERIES_INTRADAY'; break;
        case 'daily': functionName = 'TIME_SERIES_DAILY'; break;
        case 'weekly': functionName = 'TIME_SERIES_WEEKLY'; break;
        case 'monthly': functionName = 'TIME_SERIES_MONTHLY'; break;
        default: throw createHttpError(400, 'Invalid interval provided');
      }

      const params = {
        function: functionName,
        symbol: symbol,
        apikey: ALPHA_VANTAGE_API_KEY,
      };

      if (['1min', '5min', '15min', '30min', '60min'].includes(interval)) {
        params.interval = interval.replace('min', 'min');
      }
      
      params.outputsize = 'full';


      const response = await axios.get(ALPHA_VANTAGE_BASE_URL, { params });
      const dataKey = Object.keys(response.data).find(key => key.includes('Time Series') || key.includes('Daily') || key.includes('Weekly') || key.includes('Monthly'));
      const timeSeries = response.data[dataKey];

      if (!timeSeries) {
        throw createHttpError(404, `No historical data found for ${symbol} with interval ${interval}.`);
      }

      const formattedData = Object.entries(timeSeries).map(([date, values]) => ({
        date: date,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume']),
      })).sort((a, b) => new Date(a.date) - new Date(b.date));
       // Sort by date ascending

      const now = new Date();
      let filterDate;
      if (range === '1mo') filterDate = new Date(now.setMonth(now.getMonth() - 1));
      else if (range === '3mo') filterDate = new Date(now.setMonth(now.getMonth() - 3));
      else if (range === '1yr') filterDate = new Date(now.setFullYear(now.getFullYear() - 1));
      else if (range === '5yr') filterDate = new Date(now.setFullYear(now.getFullYear() - 5));
      else filterDate = new Date(0);
       // All time if range is not recognized

      const filteredData = formattedData.filter(item => new Date(item.date) >= filterDate);

      await cacheService.set(cacheKey, JSON.stringify(filteredData), CACHE_TTL * 6);
       // Cache historical data longer
      logger.info(`Fetched historical data for ${symbol} (interval: ${interval}, range: ${range})`);
      return filteredData;
    } catch (error) {
      logger.error(`Error fetching historical data for ${symbol}: ${error.message}`);
      if (error.response) {
        logger.error(`API Response Error: ${JSON.stringify(error.response.data)}`);
      }
      throw createHttpError(error.response?.status || 500, `Failed to fetch historical data for ${symbol}`);
    }
  }
}

module.exports = new MarketDataService();
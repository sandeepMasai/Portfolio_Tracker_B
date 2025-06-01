const express = require('express');
const MarketDataController = require('../controllers/marketData.controller');

const router = express.Router();

router.get('/realtime', MarketDataController.getRealTimePrice);
router.get('/historical', MarketDataController.getHistoricalData);

module.exports = router;
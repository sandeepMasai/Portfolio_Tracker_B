const express = require('express');
const AnalyticsController = require('../controllers/analytics.controller');
const { analyticsValidation } = require('../middleware/validation.middleware');

const router = express.Router();

router.get('/:portfolioId/value', AnalyticsController.getPortfolioValue);
router.get('/:portfolioId/gains-losses', AnalyticsController.getGainsLosses);
router.get('/:portfolioId/historical-performance', analyticsValidation.historicalPerformance, AnalyticsController.getHistoricalPerformance);
router.get('/:portfolioId/diversification', AnalyticsController.getDiversificationAnalysis);
router.get('/:portfolioId/risk', AnalyticsController.getRiskAnalysis);

module.exports = router;
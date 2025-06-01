const express = require('express');
const PortfolioController = require('../controllers/portfolio.controller');
const { portfolioValidation } = require('../middleware/validation.middleware');

const router = express.Router();

router.route('/')
  .post(portfolioValidation.create, PortfolioController.createPortfolio)
  .get(PortfolioController.getPortfolios);

router.route('/:portfolioId')
  .get(portfolioValidation.id, PortfolioController.getPortfolioById)
  .put(portfolioValidation.update, PortfolioController.updatePortfolio)
  .delete(portfolioValidation.id, PortfolioController.deletePortfolio);

module.exports = router;
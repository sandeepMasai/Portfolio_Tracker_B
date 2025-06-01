const PortfolioService = require('../services/portfolio.service');
const { validationResult } = require('express-validator');
const createHttpError = require('http-errors');

class PortfolioController {
  async createPortfolio(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createHttpError(400, { errors: errors.array() });
      }
      const { name, description } = req.body;
      const userId = req.user._id;
      const portfolio = await PortfolioService.createPortfolio(userId, name, description);
      res.status(201).json(portfolio);
    } catch (error) {
      next(error);
    }
  }

  async getPortfolios(req, res, next) {
    try {
      const userId = req.user._id;
      const portfolios = await PortfolioService.getPortfolios(userId);
      res.json(portfolios);
    } catch (error) {
      next(error);
    }
  }

  async getPortfolioById(req, res, next) {
    try {
      const { portfolioId } = req.params;
      const userId = req.user._id;
      const portfolio = await PortfolioService.getPortfolioById(userId, portfolioId);
      if (!portfolio) {
        throw createHttpError(404, 'Portfolio not found');
      }
      res.json(portfolio);
    } catch (error) {
      next(error);
    }
  }

  async updatePortfolio(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createHttpError(400, { errors: errors.array() });
      }
      const { portfolioId } = req.params;
      const userId = req.user._id;
      const { name, description } = req.body;
      const updatedPortfolio = await PortfolioService.updatePortfolio(userId, portfolioId, name, description);
      if (!updatedPortfolio) {
        throw createHttpError(404, 'Portfolio not found');
      }
      res.json(updatedPortfolio);
    } catch (error) {
      next(error);
    }
  }

  async deletePortfolio(req, res, next) {
    try {
      const { portfolioId } = req.params;
      const userId = req.user._id;
      await PortfolioService.deletePortfolio(userId, portfolioId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PortfolioController();
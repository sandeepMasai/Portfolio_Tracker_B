const AssetService = require('../services/asset.service');
const { validationResult } = require('express-validator');
const createHttpError = require('http-errors');

class AssetController {
  async addAsset(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createHttpError(400, { errors: errors.array() });
      }
      const { portfolioId } = req.params;
      const userId = req.user._id;
      const assetData = req.body;
      const newAsset = await AssetService.addAsset(userId, portfolioId, assetData);
      res.status(201).json(newAsset);
    } catch (error) {
      next(error);
    }
  }

  async getAssetsByPortfolio(req, res, next) {
    try {
      const { portfolioId } = req.params;
      const userId = req.user._id;
      const assets = await AssetService.getAssetsByPortfolio(userId, portfolioId);
      res.json(assets);
    } catch (error) {
      next(error);
    }
  }

  async getAssetById(req, res, next) {
    try {
      const { assetId } = req.params;
      const userId = req.user._id;
      const asset = await AssetService.getAssetById(userId, assetId);
      if (!asset) {
        throw createHttpError(404, 'Asset not found');
      }
      res.json(asset);
    } catch (error) {
      next(error);
    }
  }

  async updateAsset(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createHttpError(400, { errors: errors.array() });
      }
      const { assetId } = req.params;
      const userId = req.user._id;
      const assetData = req.body;
      const updatedAsset = await AssetService.updateAsset(userId, assetId, assetData);
      if (!updatedAsset) {
        throw createHttpError(404, 'Asset not found');
      }
      res.json(updatedAsset);
    } catch (error) {
      next(error);
    }
  }

  async deleteAsset(req, res, next) {
    try {
      const { assetId } = req.params;
      const userId = req.user._id;
      await AssetService.deleteAsset(userId, assetId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AssetController();
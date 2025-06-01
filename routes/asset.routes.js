const express = require('express');
const AssetController = require('../controllers/asset.controller');
const { assetValidation } = require('../middleware/validation.middleware');

const router = express.Router();

// Routes for assets within a specific portfolio
router.route('/portfolio/:portfolioId')
  .post(assetValidation.add, AssetController.addAsset)
  .get(assetValidation.id, AssetController.getAssetsByPortfolio);
   // Reusing assetValidation.id for portfolioId param

// Routes for individual assets
router.route('/:assetId')
  .get(assetValidation.id, AssetController.getAssetById)
  .put(assetValidation.update, AssetController.updateAsset)
  .delete(assetValidation.id, AssetController.deleteAsset);

module.exports = router;
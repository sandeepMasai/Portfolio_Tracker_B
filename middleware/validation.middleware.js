const { body, param, query } = require('express-validator');

const authValidation = {
  register: [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  login: [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
};

const portfolioValidation = {
  create: [
    body('name').notEmpty().withMessage('Portfolio name is required'),
    body('description').optional().isString().withMessage('Description must be a string'),
  ],
  update: [
    param('portfolioId').isMongoId().withMessage('Invalid portfolio ID'),
    body('name').optional().notEmpty().withMessage('Portfolio name cannot be empty'),
    body('description').optional().isString().withMessage('Description must be a string'),
  ],
  id: [
    param('portfolioId').isMongoId().withMessage('Invalid portfolio ID'),
  ],
};

const assetValidation = {
  add: [
    param('portfolioId').isMongoId().withMessage('Invalid portfolio ID'),
    body('symbol').notEmpty().withMessage('Asset symbol is required'),
    body('quantity').isFloat({ gt: 0 }).withMessage('Quantity must be a positive number'),
    body('purchasePrice').isFloat({ gt: 0 }).withMessage('Purchase price must be a positive number'),
    body('purchaseDate').isISO8601().toDate().withMessage('Invalid purchase date format (YYYY-MM-DD)'),
    body('type').optional().isIn(['Stock', 'Crypto', 'Bond', 'Mutual Fund', 'ETF', 'Other']).withMessage('Invalid asset type'),
  ],
  update: [
    param('assetId').isMongoId().withMessage('Invalid asset ID'),
    body('quantity').optional().isFloat({ gt: 0 }).withMessage('Quantity must be a positive number'),
    body('purchasePrice').optional().isFloat({ gt: 0 }).withMessage('Purchase price must be a positive number'),
    body('purchaseDate').optional().isISO8601().toDate().withMessage('Invalid purchase date format (YYYY-MM-DD)'),
    body('type').optional().isIn(['Stock', 'Crypto', 'Bond', 'Mutual Fund', 'ETF', 'Other']).withMessage('Invalid asset type'),
  ],
  id: [
    param('assetId').isMongoId().withMessage('Invalid asset ID'),
  ],
};

const userValidation = {
  update: [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Invalid email format'),
  ],
};

const analyticsValidation = {
  historicalPerformance: [
    param('portfolioId').isMongoId().withMessage('Invalid portfolio ID'),
    query('startDate').isISO8601().toDate().withMessage('Invalid start date format (YYYY-MM-DD)'),
    query('endDate').isISO8601().toDate().withMessage('Invalid end date format (YYYY-MM-DD)'),
  ],
};

module.exports = {
  authValidation,
  portfolioValidation,
  assetValidation,
  userValidation,
  analyticsValidation,
};
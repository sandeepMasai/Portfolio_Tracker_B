const mongoose = require('mongoose');
const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const Asset = require('../models/Asset');
const Transaction = require('../models/Transaction');
const MarketData = require('../models/MarketData');
const logger = require('../utils/logger');
require('dotenv').config();

const cleanupData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('MongoDB Connected for cleanup...');

    await User.deleteMany({});
    await Portfolio.deleteMany({});
    await Asset.deleteMany({});
    await Transaction.deleteMany({});
    await MarketData.deleteMany({});
    logger.info('All data cleared from database.');

    process.exit(0);
  } catch (error) {
    logger.error('Error during cleanup:', error);
    process.exit(1);
  }
};

cleanupData();
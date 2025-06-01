const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const Asset = require('../models/Asset');
const Transaction = require('../models/Transaction');
const logger = require('../utils/logger');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('MongoDB Connected for seeding...');

    // Clear existing data (optional, for fresh start)
    await User.deleteMany({});
    await Portfolio.deleteMany({});
    await Asset.deleteMany({});
    await Transaction.deleteMany({});
    logger.info('Existing data cleared.');

    // Create a test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      role: 'user',
    });
    logger.info(`Created user: ${user.email}`);

    // Create a portfolio for the user
    const portfolio = await Portfolio.create({
      userId: user._id,
      name: 'My First Portfolio',
      description: 'A diversified portfolio for testing.',
    });
    logger.info(`Created portfolio: ${portfolio.name} for user ${user.email}`);

    // Add assets to the portfolio
    const asset1 = await Asset.create({
      portfolioId: portfolio._id,
      userId: user._id,
      symbol: 'AAPL',
      name: 'Apple Inc.',
      quantity: 10,
      purchasePrice: 150.00,
      purchaseDate: new Date('2023-01-15'),
      type: 'Stock',
    });
    logger.info(`Added asset: ${asset1.symbol}`);

    const asset2 = await Asset.create({
      portfolioId: portfolio._id,
      userId: user._id,
      symbol: 'GOOGL',
      name: 'Alphabet Inc. (Class A)',
      quantity: 5,
      purchasePrice: 100.00,
      purchaseDate: new Date('2023-02-01'),
      type: 'Stock',
    });
    logger.info(`Added asset: ${asset2.symbol}`);

    const asset3 = await Asset.create({
      portfolioId: portfolio._id,
      userId: user._id,
      symbol: 'BTC',
      name: 'Bitcoin',
      quantity: 0.5,
      purchasePrice: 30000.00,
      purchaseDate: new Date('2023-03-10'),
      type: 'Crypto',
    });
    logger.info(`Added asset: ${asset3.symbol}`);

    // Add some transactions
    await Transaction.create({
      userId: user._id,
      portfolioId: portfolio._id,
      assetId: asset1._id,
      symbol: asset1.symbol,
      type: 'BUY',
      quantity: 10,
      pricePerUnit: 150.00,
      amount: 1500.00,
      transactionDate: new Date('2023-01-15'),
      notes: 'Initial buy of AAPL',
    });

    await Transaction.create({
      userId: user._id,
      portfolioId: portfolio._id,
      assetId: asset2._id,
      symbol: asset2.symbol,
      type: 'BUY',
      quantity: 5,
      pricePerUnit: 100.00,
      amount: 500.00,
      transactionDate: new Date('2023-02-01'),
      notes: 'Initial buy of GOOGL',
    });

    await Transaction.create({
      userId: user._id,
      portfolioId: portfolio._id,
      assetId: asset3._id,
      symbol: asset3.symbol,
      type: 'BUY',
      quantity: 0.5,
      pricePerUnit: 30000.00,
      amount: 15000.00,
      transactionDate: new Date('2023-03-10'),
      notes: 'Initial buy of BTC',
    });

    await Transaction.create({
      userId: user._id,
      portfolioId: portfolio._id,
      type: 'DEPOSIT',
      amount: 5000.00,
      transactionDate: new Date('2023-01-01'),
      notes: 'Initial cash deposit',
    });

    logger.info('Seeding complete!');
    process.exit(0);
  } catch (error) {
    logger.error('Error during seeding:', error);
    process.exit(1);
  }
};

seedData();
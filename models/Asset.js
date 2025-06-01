const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  portfolioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Portfolio',
    required: true,
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  symbol: {
    type: String,
    required: [true, 'Asset symbol is required'],
    trim: true,
    uppercase: true,
  },
  name: { 
    type: String,
    trim: true,
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
  },
  purchasePrice: { 
    type: Number,
    required: [true, 'Purchase price is required'],
    min: [0, 'Purchase price cannot be negative'],
  },
  purchaseDate: {
    type: Date,
    required: [true, 'Purchase date is required'],
  },
  type: {
    type: String,
    enum: ['Stock', 'Crypto', 'Bond', 'Mutual Fund', 'ETF', 'Other'],
    default: 'Other',
  },
  currentPrice: { 
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update updatedAt field on save
assetSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Asset = mongoose.model('Asset', assetSchema);
module.exports = Asset;
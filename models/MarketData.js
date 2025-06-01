const mongoose = require('mongoose');

const marketDataSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },
  currentPrice: {
    type: Number,
    required: true,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  historical: [{
    date: Date,
    open: Number,
    high: Number,
    low: Number,
    close: Number,
    volume: Number,
  }],
});

// Update lastUpdated field on save
marketDataSchema.pre('save', function (next) {
  this.lastUpdated = Date.now();
  next();
});

const MarketData = mongoose.model('MarketData', marketDataSchema);
module.exports = MarketData;
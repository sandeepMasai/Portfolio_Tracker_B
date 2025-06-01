const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  portfolioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Portfolio',
    required: true,
  },
  assetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: false, 
  },
  symbol: { 
    type: String,
    trim: true,
    uppercase: true,
  },
  type: {
    type: String,
    enum: ['BUY', 'SELL', 'DEPOSIT', 'WITHDRAWAL', 'DIVIDEND'],
    required: true,
  },
  quantity: { // For BUY/SELL
    type: Number,
    min: [0, 'Quantity cannot be negative'],
    default: 0,
  },
  pricePerUnit: { // For BUY/SELL
    type: Number,
    min: [0, 'Price per unit cannot be negative'],
    default: 0,
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative'],
  },
  transactionDate: {
    type: Date,
    required: [true, 'Transaction date is required'],
  },
  notes: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
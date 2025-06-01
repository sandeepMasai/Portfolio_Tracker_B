
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const path = require('path');
const http = require('http');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const portfolioRoutes = require('./routes/portfolio.routes');
const assetRoutes = require('./routes/asset.routes');
const marketDataRoutes = require('./routes/marketData.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const userRoutes = require('./routes/user.routes');
const errorMiddleware = require('./middleware/error.middleware');
const logger = require('./utils/logger');
const { jwtStrategy } = require('./config/passport');
const { initSocket } = require('./services/socket.service');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('dev', { stream: { write: (message) => logger.info(message.trim()) } }));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api/', limiter);

// Passport JWT strategy
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// ✅ Removed Swagger section

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/portfolios', passport.authenticate('jwt', { session: false }), portfolioRoutes);
app.use('/api/assets', passport.authenticate('jwt', { session: false }), assetRoutes);
app.use('/api/market-data', passport.authenticate('jwt', { session: false }), marketDataRoutes);
app.use('/api/analytics', passport.authenticate('jwt', { session: false }), analyticsRoutes);
app.use('/api/users', passport.authenticate('jwt', { session: false }), userRoutes);

// Error Middleware
app.use(errorMiddleware);

// MongoDB connection & server start
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    logger.info('Connected to MongoDB');

    const server = app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
    });

    initSocket(server); 
  })
  .catch((err) => {
    logger.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  });

module.exports = app;

const { Server } = require('socket.io');
const logger = require('../utils/logger');
const MarketDataService = require('./marketData.service'); 

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
       // Allow all origins for development, restrict in production
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Example: Join a room for a specific portfolio to receive updates
    socket.on("joinPortfolio", (portfolioId) => {
      socket.join(portfolioId);
      logger.info(`Socket ${socket.id} joined portfolio room: ${portfolioId}`);
    });

    // Example: Request real-time price for a symbol
    socket.on("requestPrice", async (symbol) => {
      try {
        const price = await MarketDataService.getRealTimePrice(symbol);
        socket.emit("priceUpdate", { symbol, price, timestamp: new Date() });
      } catch (error) {
        logger.error(
          `Error fetching price via socket for ${symbol}: ${error.message}`
        );
        socket.emit("priceError", { symbol, error: error.message });
      }
    });

    socket.on("disconnect", () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  // Periodic price update (e.g., every 1 minute)
  setInterval(async () => {
    const symbolsToUpdate = ["IBM", "GOOGL", "MSFT", "BTC"]; 
    for (const symbol of symbolsToUpdate) {
      try {
        const price = await MarketDataService.getRealTimePrice(symbol);
        io.emit("priceUpdate", { symbol, price, timestamp: new Date() }); 
      } catch (error) {
        logger.error(
          `Error in periodic price update for ${symbol}: ${error.message}`
        );
      }
    }
  }, 60 * 1000); 

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = { initSocket, getIo };
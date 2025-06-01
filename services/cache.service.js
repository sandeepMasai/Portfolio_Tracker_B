
const logger = require('../utils/logger');

class CacheService {
  async set(key, value, ttlSeconds) {
    logger.debug(`Cache set skipped (no Redis): ${key}`);
  }

  async get(key) {
    logger.debug(`Cache get skipped (no Redis): ${key}`);
    return null;
  }

  async del(key) {
    logger.debug(`Cache delete skipped (no Redis): ${key}`);
  }
}

module.exports = new CacheService();

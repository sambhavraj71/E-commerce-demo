const Redis = require('redis');
const logger = require('../utils/logger');

const redisClient = Redis.createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
});

redisClient.on('connect', () => {
  logger.info('Redis client connected');
});

redisClient.on('error', (err) => {
  logger.error('Redis error: ', err);
});

(async () => {
  await redisClient.connect();
})();

module.exports = redisClient;
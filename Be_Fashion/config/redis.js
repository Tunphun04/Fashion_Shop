const Redis = require('ioredis');
require('dotenv').config();

const REDIS_ENABLED = process.env.REDIS_ENABLED !== 'false';

let redis = null;
const memoryStore = new Map();

if (REDIS_ENABLED) {
  redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    retryStrategy: (times) => {
      if (times > 3) {
        console.warn('⚠️  Redis unavailable. Using in-memory storage.');
        return null;
      }
      return Math.min(times * 50, 2000);
    },
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    enableOfflineQueue: false
  });

  redis.connect().then(() => {
    console.log('✅ Redis connected successfully');
  }).catch(() => {
    console.warn('⚠️  Redis not available. Using in-memory storage.');
    redis = null;
  });

  redis.on('error', () => {
    // Suppress subsequent errors
  });
} else {
  console.log('ℹ️  Redis disabled. Using in-memory token storage.');
}

const redisWrapper = {
  async setex(key, seconds, value) {
    if (redis && redis.status === 'ready') {
      return redis.setex(key, seconds, value);
    }
    memoryStore.set(key, { value, expiresAt: Date.now() + seconds * 1000 });
    return 'OK';
  },

  async get(key) {
    if (redis && redis.status === 'ready') {
      return redis.get(key);
    }
    const item = memoryStore.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      memoryStore.delete(key);
      return null;
    }
    return item.value;
  },

  async del(key) {
    if (redis && redis.status === 'ready') {
      return redis.del(key);
    }
    memoryStore.delete(key);
    return 1;
  }
};

module.exports = redisWrapper;
import redis from "redis";
import { promisify } from "util";

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
//   password: process.env.REDIS_PASSWORD || "",
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        return new Error("Retry limit reached");
      }
      // Exponential backoff: 2^retries * 100ms, max 10 seconds
      const delay = Math.min(Math.pow(2, retries) * 100, 10000);
      console.log(`Redis reconnecting in ${delay}ms...`);
      return delay;
    },
  },
});

// handling redis connection events
redisClient.on("connect",() => {
    console.log("Redis client connected");
})


redisClient.on('error', (err) => {
    console.error('❌ Redis Client Error:', err);
});

redisClient.on('reconnecting', () => {
    console.log('🔄 Redis client reconnecting...');
});

redisClient.on('end', () => {
    console.log('🔴 Redis client disconnected');
});

// Promisify Redis methods for easier use
const getAsync = (key) => redisClient.get(key);

const setAsync = (key, value) => redisClient.set(key, value);

const setExAsync = (key, seconds, value) =>
  redisClient.setEx(key, seconds, value);

const delAsync = (key) => redisClient.del(key);

const flushAllAsync = () => redisClient.flushAll();
// Connect to Redis
const connectRedis = async () => {
    try {
        await redisClient.connect();
        return redisClient;
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
        // Don't exit process, just log error
        return redisClient;
    }
};

// Helper functions
const cacheData = async (key, data, expiration = 300) => {
    try {
        const jsonData = JSON.stringify(data);
        await setExAsync(key, expiration, jsonData);
        return true;
    } catch (error) {
        console.error('Cache set error:', error);
        return false;
    }
};

const getCachedData = async (key) => {
    try {
        const data = await getAsync(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Cache get error:', error);
        return null;
    }
};

const deleteCachedData = async (pattern) => {
  try {
    if (pattern.includes("*")) {
      const keys = await redisClient.keys(pattern);

      if (keys.length > 0) {
        await redisClient.del(keys);
      }

      return keys.length;
    } else {
      return await redisClient.del(pattern);
    }
  } catch (error) {
    console.error("Cache delete error:", error);
    return 0;
  }
};

const clearAllCache = async () => {
    try {
        await flushAllAsync();
        console.log('All cache cleared');
        return true;
    } catch (error) {
        console.error('Clear all cache error:', error);
        return false;
    }
};

// Connect on import
connectRedis();

export {
    redisClient,
    getAsync,
    setAsync,
    setExAsync,
    delAsync,
    cacheData,
    getCachedData,
    deleteCachedData,
    clearAllCache,
    connectRedis
};
import Redis from "ioredis";

import { env } from "../config/env.js";
import { logger } from "../middlewares/request-logger.middleware.js";

export const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on("connect", () => {
  logger.info("Redis connecting...");
});

redis.on("ready", () => {
  logger.info("Redis connected & ready");
});

redis.on("error", (error) => {
  logger.error({ error: error.message }, "Redis error");
});

redis.on("close", () => {
  logger.info("Redis connection closed");
});

import Redis from "ioredis";

import { env } from "./env.js";
import { logger } from "./logger.js";

export const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
  // Fail fast while disconnected so the rate limiter can fail open instead of stalling requests
  enableOfflineQueue: false,
});

redis.on("ready", () => logger.info("Redis connected"));
redis.on("error", (error) => logger.error({ error: error.message }, "Redis error"));

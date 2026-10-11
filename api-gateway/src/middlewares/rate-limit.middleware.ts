import type { RequestHandler } from "express";

import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { redis } from "../config/redis.js";
import { AppError } from "../errors.js";

const { RATE_LIMIT_WINDOW_SECONDS: windowSeconds, RATE_LIMIT_MAX_REQUESTS: maxRequests } = env;

const consumeRequest = async (key: string) => {
  const results = await redis
    .multi()
    .incr(key)
    .expire(key, windowSeconds, "NX")
    .ttl(key)
    .exec();

  if (!results || results.some(([error]) => error)) {
    throw new Error("Rate limit transaction failed");
  }

  const [count = 0, , ttl = 0] = results.map(([, value]) => Number(value));
  return { count, resetIn: ttl > 0 ? ttl : windowSeconds };
};

export const rateLimitMiddleware: RequestHandler = async (req, res, next) => {
  let usage: Awaited<ReturnType<typeof consumeRequest>>;

  try {
    usage = await consumeRequest(`ratelimit:${req.ip}`);
  } catch (error) {
    logger.warn({ error: (error as Error).message }, "Rate limiter unavailable, allowing request");
    return next();
  }

  res.setHeader("X-RateLimit-Limit", maxRequests);
  res.setHeader("X-RateLimit-Remaining", Math.max(0, maxRequests - usage.count));
  res.setHeader("X-RateLimit-Reset", usage.resetIn);

  if (usage.count > maxRequests) {
    return next(
      new AppError(429, "Too many requests, please try again later", "ERR_TOO_MANY_REQUESTS", usage.resetIn),
    );
  }

  next();
};

import { Request, Response, NextFunction } from "express";

import { redis } from "../redis/redis.js";
import { logger } from "./request-logger.middleware.js";
import { ClientIdentifierResolver } from "../utils/client-identifier.util.js";
import {
  IDENTIFIER_TYPE,
  RATE_LIMIT,
} from "../constants/rate-limit.constants.js";
import { TooManyRequestsError } from "../errors/app-error.js";

export const rateLimitMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const clientIdentifier = ClientIdentifierResolver.resolveIdentifier(
    req,
    IDENTIFIER_TYPE.IP,
  );

  const key = `ratelimit:${clientIdentifier}`;

  try {
    const currentRequests = await redis.incr(key);

    if (currentRequests === 1) {
      await redis.expire(key, RATE_LIMIT.WINDOW_SIZE_IN_SECONDS);
    }

    const ttl = await redis.ttl(key);

    res.setHeader("X-RateLimit-Limit", RATE_LIMIT.MAX_REQUEST_LIMIT);
    res.setHeader(
      "X-RateLimit-Remaining",
      Math.max(0, RATE_LIMIT.MAX_REQUEST_LIMIT - currentRequests),
    );
    res.setHeader(
      "X-RateLimit-Reset",
      ttl > 0 ? ttl : RATE_LIMIT.WINDOW_SIZE_IN_SECONDS,
    );

    if (currentRequests > RATE_LIMIT.MAX_REQUEST_LIMIT) {
      return next(
        new TooManyRequestsError(
          "Too many requests, please try again later",
          ttl > 0 ? ttl : RATE_LIMIT.WINDOW_SIZE_IN_SECONDS,
        ),
      );
    }

    next();
  } catch (error) {
    logger.warn(
      { error: (error as Error).message },
      "Rate limiter Redis check failed, allowing request",
    );
    next();
  }
};

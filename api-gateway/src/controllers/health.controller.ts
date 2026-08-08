import type { Request, Response } from "express";

import { env } from "../config/env.js";
import { redis } from "../redis/redis.js";
import { ApiResponse } from "../utils/api-response.js";
import { HTTP_STATUS } from "../constants/http-status.js";
import { REQUEST_ID_HEADER } from "../middlewares/request-id.middleware.js";
import { asyncHandler } from "../errors/async-handler.js";

const checkRedisHealth = async (): Promise<boolean> => {
  try {
    const ping = await redis.ping();
    return ping === "PONG";
  } catch {
    return false;
  }
};

const getMeta = (req: Request) => {
  const requestId = req.headers[REQUEST_ID_HEADER];
  return {
    version: env.API_VERSION,
    ...(typeof requestId === "string" && { requestId }),
  };
};

/**
 * Liveness Controller: Checks if Gateway process is running
 */
export const getLivenessController = (req: Request, res: Response): Response => {
  const response = ApiResponse.success({
    statusCode: HTTP_STATUS.OK,
    message: "Gateway is alive",
    data: { status: "up" },
    meta: getMeta(req),
  });

  return res.status(response.statusCode).json(response);
};

/**
 * Readiness Controller: Checks if Redis is ready to accept traffic
 */
export const getReadinessController = asyncHandler(
  async (req: Request, res: Response) => {
    const isHealthy = await checkRedisHealth();
    const statusCode = isHealthy ? HTTP_STATUS.OK : HTTP_STATUS.SERVICE_UNAVAILABLE;

    const response = ApiResponse.success({
      statusCode,
      message: isHealthy ? "Gateway is ready" : "Gateway dependencies unavailable",
      data: {
        status: isHealthy ? "ready" : "not_ready",
        dependencies: { redis: isHealthy ? "up" : "down" },
      },
      meta: getMeta(req),
    });

    res.status(statusCode).json(response);
  },
);

/**
 * Health Controller: Overall Gateway Health Check Endpoint
 */
export const getHealthController = asyncHandler(
  async (req: Request, res: Response) => {
    const isHealthy = await checkRedisHealth();
    const statusCode = isHealthy ? HTTP_STATUS.OK : HTTP_STATUS.SERVICE_UNAVAILABLE;

    const response = ApiResponse.success({
      statusCode,
      message: isHealthy ? "Gateway is healthy" : "Gateway service degraded",
      data: {
        service: "api-gateway",
        status: isHealthy ? "healthy" : "unhealthy",
        dependencies: { redis: isHealthy ? "healthy" : "unhealthy" },
      },
      meta: getMeta(req),
    });

    res.status(statusCode).json(response);
  },
);

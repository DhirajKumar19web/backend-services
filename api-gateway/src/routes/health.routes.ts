import { Router, type RequestHandler, type Response } from "express";

import { env } from "../config/env.js";
import { redis } from "../config/redis.js";
import { REQUEST_ID_HEADER } from "../middlewares/request-logger.middleware.js";

const sendResponse = (res: Response, statusCode: number, message: string, data: object) => {
  res.status(statusCode).json({
    success: statusCode < 400,
    statusCode,
    message,
    data,
    meta: { version: env.API_VERSION, requestId: res.getHeader(REQUEST_ID_HEADER) },
    timestamp: new Date().toISOString(),
  });
};

const readiness: RequestHandler = async (_req, res) => {
  const redisUp = (await redis.ping().catch(() => null)) === "PONG";

  sendResponse(res, redisUp ? 200 : 503, redisUp ? "Gateway is ready" : "Gateway dependencies unavailable", {
    service: "api-gateway",
    status: redisUp ? "ready" : "not_ready",
    dependencies: { redis: redisUp ? "up" : "down" },
  });
};

export const healthRoutes = Router();

healthRoutes.get("/health/liveness", (_req, res) => {
  sendResponse(res, 200, "Gateway is alive", { status: "up" });
});
healthRoutes.get(["/health", "/health/readiness"], readiness);

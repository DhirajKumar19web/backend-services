import { Request, Response } from "express";
import { Socket } from "node:net";

import { logger } from "../middlewares/request-logger.middleware.js";

export interface ProxyError extends Error {
  code?: string;
  statusCode?: number;
}

export const proxyErrorHandler = (
  err: ProxyError,
  _req: Request,
  res: Response | Socket,
): void => {
  logger.error({ error: err.message, code: err.code }, "Gateway Proxy Error");

  // If this is a socket connection (e.g. WebSocket) or headers already sent
  if (!("status" in res) || res.headersSent) {
    if ("destroy" in res && typeof res.destroy === "function") {
      res.destroy();
    }
    return;
  }

  let statusCode = 502;
  let message = "Upstream service error";

  if (err.code === "ECONNREFUSED") {
    statusCode = 503;
    message = "Upstream service unavailable";
  } else if (err.code === "ETIMEDOUT" || err.code === "ESOCKETTIMEDOUT") {
    statusCode = 504;
    message = "Upstream service timeout";
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code:
        statusCode === 503
          ? "SERVICE_UNAVAILABLE"
          : statusCode === 504
            ? "GATEWAY_TIMEOUT"
            : "BAD_GATEWAY",
      message,
    },
  });
};

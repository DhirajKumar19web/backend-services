import { Request, Response } from "express";
import { Socket } from "node:net";

import { logger } from "../middlewares/request-logger.middleware.js";
import {
  AppError,
  BadGatewayError,
  ServiceUnavailableError,
  GatewayTimeoutError,
} from "../errors/app-error.js";

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

  let appError: AppError;

  if (err.code === "ECONNREFUSED") {
    appError = new ServiceUnavailableError();
  } else if (err.code === "ETIMEDOUT" || err.code === "ESOCKETTIMEDOUT") {
    appError = new GatewayTimeoutError();
  } else {
    appError = new BadGatewayError();
  }

  res.status(appError.statusCode).json({
    success: false,
    error: {
      code: appError.errorCode,
      message: appError.message,
    },
  });
};


import type { ErrorRequestHandler, RequestHandler } from "express";

import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { AppError } from "../errors.js";

export const notFoundMiddleware: RequestHandler = (req, _res, next) => {
  next(new AppError(404, `Route ${req.method} ${req.originalUrl} not found`, "ERR_NOT_FOUND"));
};

export const errorMiddleware: ErrorRequestHandler = (err, req, res, _next) => {
  const cause = err instanceof Error ? err : new Error(String(err));
  const error =
    err instanceof AppError ? err : new AppError(500, "Internal Server Error", "ERR_INTERNAL_SERVER");

  logger.error(
    { method: req.method, path: req.originalUrl, errorCode: error.errorCode, err: cause },
    error.message,
  );

  if (error.retryAfter !== undefined) res.setHeader("Retry-After", error.retryAfter);

  res.status(error.statusCode).json({
    success: false,
    statusCode: error.statusCode,
    errorCode: error.errorCode,
    message: error.message,
    ...(error.retryAfter !== undefined && { retryAfter: error.retryAfter }),
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    ...(env.NODE_ENV !== "production" && { stack: cause.stack }),
  });
};

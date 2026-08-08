import { ZodError } from "zod";
import type { NextFunction, Request, Response } from "express";

import { env } from "../config/env.js";
import { HTTP_STATUS } from "../constants/index.js";
import { AppError, TooManyRequestsError } from "../errors/app-error.js";
import { logger } from "./request-logger.middleware.js";

export const errorMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = "Internal Server Error";
  let errorCode = "ERR_INTERNAL_SERVER";
  let errors: unknown[] = [];
  let retryAfter: number | undefined;

  const errorObj = err instanceof Error ? err : new Error(String(err));

  if (err instanceof TooManyRequestsError) {
    statusCode = err.statusCode;
    message = err.message;
    errorCode = err.errorCode ?? "ERR_TOO_MANY_REQUESTS";
    retryAfter = err.retryAfter;
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorCode = err.errorCode ?? "ERR_APPLICATION";
    errors = err.errors;
  } else if (err instanceof ZodError) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = "Validation Failed";
    errorCode = "ERR_VALIDATION";
    errors = err.issues;
  } else if (errorObj.name === "JsonWebTokenError") {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = "Invalid Authentication Token";
    errorCode = "ERR_INVALID_TOKEN";
  } else if (errorObj.name === "TokenExpiredError") {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = "Authentication Token Expired";
    errorCode = "ERR_TOKEN_EXPIRED";
  } else if (errorObj.name === "ValidationError") {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = errorObj.message;
    errorCode = "ERR_DB_VALIDATION";
  } else if (errorObj.name === "CastError") {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = errorObj.message;
    errorCode = "ERR_INVALID_PARAMETER";
  } else {
    message = errorObj.message;
  }

  logger.error(
    {
      method: req.method,
      path: req.originalUrl,
      statusCode,
      errorCode,
      error: message,
      stack: env.NODE_ENV !== "production" ? errorObj.stack : undefined,
    },
    "API Error",
  );

  if (retryAfter !== undefined) {
    res.setHeader("Retry-After", retryAfter.toString());
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    errorCode,
    message,
    ...(retryAfter !== undefined && { retryAfter }),
    ...(errors.length > 0 && { errors }),
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    ...(env.NODE_ENV !== "production" && {
      stack: errorObj.stack,
    }),
  });
};

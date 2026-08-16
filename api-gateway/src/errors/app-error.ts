import { HTTP_STATUS } from "../constants/index.js";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly success: boolean = false;
  public readonly errors: unknown[];
  public readonly errorCode: string | undefined;

  constructor(
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    errorCode?: string,
    errors: unknown[] = [],
    isOperational = true,
    stack = ""
  ) {
    super(message);

    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errors = errors;
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized access", errorCode = "ERR_UNAUTHORIZED") {
    super(message, HTTP_STATUS.UNAUTHORIZED, errorCode);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found", errorCode = "ERR_NOT_FOUND") {
    super(message, HTTP_STATUS.NOT_FOUND, errorCode);
  }
}

export class TooManyRequestsError extends AppError {
  public readonly retryAfter: number;

  constructor(
    message = "Too many requests. Try again later.",
    retryAfter = 60,
    errorCode = "ERR_TOO_MANY_REQUESTS"
  ) {
    super(message, HTTP_STATUS.TOO_MANY_REQUESTS, errorCode);
    this.retryAfter = retryAfter;
  }
}

export class BadGatewayError extends AppError {
  constructor(message = "Upstream service error", errorCode = "BAD_GATEWAY") {
    super(message, HTTP_STATUS.BAD_GATEWAY, errorCode);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = "Upstream service unavailable", errorCode = "SERVICE_UNAVAILABLE") {
    super(message, HTTP_STATUS.SERVICE_UNAVAILABLE, errorCode);
  }
}

export class GatewayTimeoutError extends AppError {
  constructor(message = "Upstream service timeout", errorCode = "GATEWAY_TIMEOUT") {
    super(message, HTTP_STATUS.GATEWAY_TIMEOUT, errorCode);
  }
}


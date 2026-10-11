import { Router, type NextFunction, type Response } from "express";
import proxy from "express-http-proxy";

import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { AppError } from "../errors.js";

const UNAVAILABLE_CODES = new Set(["ECONNREFUSED", "ENOTFOUND", "EAI_AGAIN", "EHOSTUNREACH"]);
const TIMEOUT_CODES = new Set(["ETIMEDOUT", "ESOCKETTIMEDOUT", "ECONNABORTED"]);

const toAppError = (code: string | undefined) => {
  if (code && UNAVAILABLE_CODES.has(code)) {
    return new AppError(503, "Upstream service unavailable", "ERR_SERVICE_UNAVAILABLE");
  }
  if (code && TIMEOUT_CODES.has(code)) {
    return new AppError(504, "Upstream service timeout", "ERR_GATEWAY_TIMEOUT");
  }
  return new AppError(502, "Upstream service error", "ERR_BAD_GATEWAY");
};

const handleProxyError = (err: NodeJS.ErrnoException, res: Response, next: NextFunction) => {
  logger.error({ error: err.message, code: err.code }, "Proxy error");

  if (res.headersSent) {
    res.destroy();
    return;
  }
  next(toAppError(err.code));
};

export const proxyRoutes = Router();

// Express strips the mount prefix from req.url, which express-http-proxy forwards as the path:
// /api/v1/auth/login -> <AUTH_SERVICE_URL>/login. Bodies are streamed, not parsed.
for (const { url, prefix } of env.SERVICES) {
  proxyRoutes.use(
    prefix,
    proxy(url, {
      parseReqBody: false,
      timeout: env.PROXY_TIMEOUT_MS,
      proxyErrorHandler: handleProxyError,
    }),
  );
}

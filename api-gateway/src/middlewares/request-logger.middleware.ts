import { randomUUID } from "node:crypto";
import { pinoHttp } from "pino-http";

import { logger } from "../config/logger.js";

export const REQUEST_ID_HEADER = "x-request-id";

export const requestLoggerMiddleware = pinoHttp({
  logger,
  genReqId: (req, res) => {
    const incoming = req.headers[REQUEST_ID_HEADER];
    const requestId = typeof incoming === "string" && incoming.trim() ? incoming : randomUUID();

    req.headers[REQUEST_ID_HEADER] = requestId;
    res.setHeader(REQUEST_ID_HEADER, requestId);
    return requestId;
  },
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return "error";
    return res.statusCode >= 400 ? "warn" : "info";
  },
  customSuccessMessage: (req, res) => `${req.method} ${req.url} ${res.statusCode}`,
});

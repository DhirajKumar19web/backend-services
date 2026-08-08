import { pinoHttp } from "pino-http";
import { pino } from "pino";
import { REQUEST_ID_HEADER } from "./request-id.middleware.js";

export const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
});

export const requestLoggerMiddleware = pinoHttp({
  logger,
  genReqId: (req) => {
    return (req.headers[REQUEST_ID_HEADER] as string) || "unknown-id";
  },
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },
  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} ${res.statusCode} - ${err.message}`;
  },
});

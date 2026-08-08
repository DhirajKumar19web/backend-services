import { createProxyMiddleware } from "http-proxy-middleware";
import { ClientRequest, IncomingMessage } from "node:http";

import { env } from "../config/env.js";
import { proxyErrorHandler } from "./proxy-error.js";
import { REQUEST_ID_HEADER } from "../middlewares/request-id.middleware.js";

const FORWARD_HEADERS = [REQUEST_ID_HEADER, "x-user-id"];

/**
 * Forwards correlation ID & user context headers to downstream microservices
 */
const handleProxyReq = (
  proxyReq: ClientRequest,
  req: IncomingMessage,
): void => {
  for (const header of FORWARD_HEADERS) {
    const val = req.headers[header];
    if (val && typeof val === "string") {
      proxyReq.setHeader(header, val);
    }
  }
};

/**
 * Factory helper to create microservice proxies dynamically
 */
const createServiceProxy = (targetUrl: string, routePrefix: string) =>
  createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    pathRewrite: {
      [`^${routePrefix}`]: "",
    },
    on: {
      proxyReq: handleProxyReq,
      error: proxyErrorHandler,
    },
  });

export const authProxy = createServiceProxy(
  env.AUTH_SERVICE_URL,
  env.AUTH_ROUTE_PREFIX,
);

export const userProxy = createServiceProxy(
  env.USER_SERVICE_URL,
  env.USER_ROUTE_PREFIX,
);

export const courseProxy = createServiceProxy(
  env.COURSE_SERVICE_URL,
  env.COURSE_ROUTE_PREFIX,
);
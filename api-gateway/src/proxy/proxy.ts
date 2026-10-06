import proxy from "express-http-proxy";
import { Request } from "express";

import { env } from "../config/env.js";
import { proxyErrorHandler } from "./proxy-error.js";
import { REQUEST_ID_HEADER } from "../middlewares/request-id.middleware.js";

const FORWARD_HEADERS = [REQUEST_ID_HEADER, "x-user-id"];

/**
 * Factory helper to create microservice proxies dynamically
 */
const createServiceProxy = (targetUrl: string, routePrefix: string) =>
  proxy(targetUrl, {
    proxyReqPathResolver: (req: Request) => {
      return req.originalUrl.replace(new RegExp(`^${routePrefix}`), "");
    },
    proxyReqOptDecorator: (proxyReqOpts, srcReq: Request) => {
      if (!proxyReqOpts.headers) {
        proxyReqOpts.headers = {};
      }
      for (const header of FORWARD_HEADERS) {
        const val = srcReq.headers[header];
        if (val && typeof val === "string") {
          proxyReqOpts.headers[header] = val;
        }
      }
      return proxyReqOpts;
    },
    proxyErrorHandler: proxyErrorHandler,
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
import cors from "cors";
import express from "express";
import helmet from "helmet";

import { env } from "./config/env.js";
import { authContextMiddleware } from "./middlewares/auth.middleware.js";
import { errorMiddleware, notFoundMiddleware } from "./middlewares/error.middleware.js";
import { rateLimitMiddleware } from "./middlewares/rate-limit.middleware.js";
import { requestLoggerMiddleware } from "./middlewares/request-logger.middleware.js";
import { healthRoutes } from "./routes/health.routes.js";
import { proxyRoutes } from "./routes/proxy.routes.js";

export const app = express();

app.set("trust proxy", env.TRUST_PROXY);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    frameguard: { action: "deny" },
    referrerPolicy: { policy: "no-referrer" },
  }),
);
app.use(requestLoggerMiddleware);
app.use(cors({ origin: env.CORS_ORIGINS, credentials: true }));
app.use(rateLimitMiddleware);
app.use(authContextMiddleware);

app.use(healthRoutes);
app.use(proxyRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

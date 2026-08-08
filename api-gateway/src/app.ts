import express from "express";
import cors from "cors";

import {
  securityMiddleware,
  requestIdMiddleware,
  requestLoggerMiddleware,
  rateLimitMiddleware,
  optionalAuthMiddleware,
  notFoundMiddleware,
  errorMiddleware,
} from "./middlewares/index.js";

import { healthRoutes, gatewayRoutes } from "./routes/index.js";

const app = express();

// Security & Core Middlewares
app.disable("x-powered-by");
app.use(securityMiddleware);
app.use(requestIdMiddleware);
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

// Logging & Rate Limiting
app.use(requestLoggerMiddleware);
app.use(rateLimitMiddleware);

// Auth Context & Body Parsers
app.use(optionalAuthMiddleware);
app.use(
  express.json({
    limit: "1mb",
  }),
);
app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  }),
);

// Routes & Microservice Proxies
app.use(healthRoutes);
app.use(gatewayRoutes);

// Error Handling Middlewares
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export { app };
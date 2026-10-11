import { app } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { redis } from "./config/redis.js";

const server = app.listen(env.GATEWAY_PORT, env.GATEWAY_HOST, () => {
  logger.info(`API Gateway running on http://${env.GATEWAY_HOST}:${env.GATEWAY_PORT}`);
});

let isShuttingDown = false;

const shutdown = (signal: string) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  logger.info(`${signal} received, shutting down`);

  setTimeout(() => {
    logger.error(`Shutdown timed out after ${env.SHUTDOWN_TIMEOUT_MS}ms, forcing exit`);
    process.exit(1);
  }, env.SHUTDOWN_TIMEOUT_MS).unref();

  server.close(async (error) => {
    if (error) logger.error({ error: error.message }, "Error closing HTTP server");
    await redis.quit().catch(() => undefined);
    process.exit(error ? 1 : 0);
  });
  server.closeIdleConnections();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (reason) => logger.error({ reason }, "Unhandled promise rejection"));

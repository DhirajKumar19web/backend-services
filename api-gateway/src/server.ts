import { app } from "./app.js";
import { env } from "./config/env.js";
import { redis } from "./redis/redis.js";
import { logger } from "./middlewares/request-logger.middleware.js";

const server = app.listen(
  env.GATEWAY_PORT,
  env.GATEWAY_HOST,
  () => {
    logger.info(
      `🚀 API Gateway running on http://${env.GATEWAY_HOST}:${env.GATEWAY_PORT}`,
    );
  },
);

const shutdown = async (signal: string) => {
  logger.info(`${signal} received. Gracefully shutting down...`);

  server.close(async () => {
    logger.info("HTTP server closed");

    await redis.quit();

    logger.info("Redis connection closed");

    process.exit(0);
  });
};

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});
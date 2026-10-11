import "dotenv/config";
import { z } from "zod";

import { logger } from "../middlewares/request-logger.middleware.js";

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]),

    GATEWAY_HOST: z.string().min(1),

    GATEWAY_PORT: z
      .coerce
      .number()
      .int()
      .min(1)
      .max(65535),

    JWT_SECRET: z.string().min(1),

    API_PREFIX: z.string().min(1),

    API_VERSION: z.string().min(1),

    REDIS_HOST: z.string().min(1),

    REDIS_PORT: z
      .coerce
      .number()
      .int()
      .min(1)
      .max(65535),

    REDIS_PASSWORD: z.string().min(1),

    AUTH_SERVICE_URL: z.url(),
    AUTH_ROUTE_PREFIX: z.string().min(1),

    USER_SERVICE_URL: z.url(),
    USER_ROUTE_PREFIX: z.string().min(1),

    COURSE_SERVICE_URL: z.url(),
    COURSE_ROUTE_PREFIX: z.string().min(1),

    NOTIFICATION_SERVICE_URL: z.url(),
    NOTIFICATION_ROUTE_PREFIX: z.string().min(1),

    ENROLLMENT_SERVICE_URL: z.url(),
    ENROLLMENT_ROUTE_PREFIX: z.string().min(1),

    PAYMENT_SERVICE_URL: z.url(),
    PAYMENT_ROUTE_PREFIX: z.string().min(1),

    PROGRESS_SERVICE_URL: z.url(),
    PROGRESS_ROUTE_PREFIX: z.string().min(1),

    ASSESSMENT_SERVICE_URL: z.url(),
    ASSESSMENT_ROUTE_PREFIX: z.string().min(1),

    CERTIFICATE_SERVICE_URL: z.url(),
    CERTIFICATE_ROUTE_PREFIX: z.string().min(1),
  })
  .transform((data) => {
    const apiBase = `${data.API_PREFIX.replace(/\/+$/, "")}/${data.API_VERSION.replace(/^\/+|\/+$/g, "")}`;
    const formatPrefix = (prefix: string) => {
      if (prefix.startsWith(apiBase)) return prefix;
      const cleanPrefix = prefix.startsWith("/") ? prefix : `/${prefix}`;
      return `${apiBase}${cleanPrefix}`;
    };

    return {
      ...data,
      AUTH_ROUTE_PREFIX: formatPrefix(data.AUTH_ROUTE_PREFIX),
      USER_ROUTE_PREFIX: formatPrefix(data.USER_ROUTE_PREFIX),
      COURSE_ROUTE_PREFIX: formatPrefix(data.COURSE_ROUTE_PREFIX),
      NOTIFICATION_ROUTE_PREFIX: formatPrefix(data.NOTIFICATION_ROUTE_PREFIX),
      ENROLLMENT_ROUTE_PREFIX: formatPrefix(data.ENROLLMENT_ROUTE_PREFIX),
      PAYMENT_ROUTE_PREFIX: formatPrefix(data.PAYMENT_ROUTE_PREFIX),
      PROGRESS_ROUTE_PREFIX: formatPrefix(data.PROGRESS_ROUTE_PREFIX),
      ASSESSMENT_ROUTE_PREFIX: formatPrefix(data.ASSESSMENT_ROUTE_PREFIX),
      CERTIFICATE_ROUTE_PREFIX: formatPrefix(data.CERTIFICATE_ROUTE_PREFIX),
    };
  });

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  logger.error(
    { errors: parsedEnv.error.issues },
    "Invalid environment variables",
  );

  process.exit(1);
}

export const env = parsedEnv.data;
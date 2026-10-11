import "dotenv/config";
import { z } from "zod";

const SERVICE_NAMES = [
  "auth",
  "user",
  "course",
  "notification",
  "enrollment",
  "payment",
  "progress",
  "assessment",
  "certificate",
] as const;

const port = z.coerce.number().int().min(1).max(65535);
const positiveInt = z.coerce.number().int().positive();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]),
  GATEWAY_HOST: z.string().min(1),
  GATEWAY_PORT: port,
  API_PREFIX: z.string().min(1),
  API_VERSION: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  REDIS_HOST: z.string().min(1),
  REDIS_PORT: port,
  REDIS_PASSWORD: z.string().min(1),
  RATE_LIMIT_WINDOW_SECONDS: positiveInt,
  RATE_LIMIT_MAX_REQUESTS: positiveInt,
  TRUST_PROXY: z.string().min(1),
  CORS_ORIGINS: z.string().min(1),
  PROXY_TIMEOUT_MS: positiveInt,
  SHUTDOWN_TIMEOUT_MS: positiveInt,
  SERVICES: z.array(
    z.object({ name: z.string(), url: z.url(), prefix: z.string().min(1) }),
  ),
});

const parsed = envSchema.safeParse({
  ...process.env,
  SERVICES: SERVICE_NAMES.map((name) => ({
    name,
    url: process.env[`${name.toUpperCase()}_SERVICE_URL`],
    prefix: process.env[`${name.toUpperCase()}_ROUTE_PREFIX`],
  })),
});

if (!parsed.success) {
  console.error(`Invalid environment variables:\n${z.prettifyError(parsed.error)}`);
  process.exit(1);
}

const { SERVICES, TRUST_PROXY, CORS_ORIGINS, ...config } = parsed.data;

const joinPath = (...parts: string[]) =>
  `/${parts.join("/")}`.replace(/\/+/g, "/").replace(/\/$/, "");

// "true" | "false" | hop count | IP/subnet list, as accepted by Express "trust proxy"
const parseTrustProxy = (value: string) => {
  if (value === "true") return true;
  if (value === "false") return false;
  return /^\d+$/.test(value) ? Number(value) : value;
};

export const env = {
  ...config,
  TRUST_PROXY: parseTrustProxy(TRUST_PROXY),
  CORS_ORIGINS: CORS_ORIGINS === "*" ? true : CORS_ORIGINS.split(",").map((origin) => origin.trim()),
  SERVICES: SERVICES.map((service) => ({
    ...service,
    prefix: joinPath(config.API_PREFIX, config.API_VERSION, service.prefix),
  })),
};

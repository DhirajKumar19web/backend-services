import { Request, Response, NextFunction } from "express";
import { createHmac, timingSafeEqual } from "node:crypto";

import { env } from "../config/env.js";
import { logger } from "./request-logger.middleware.js";

export interface DecodedJwtPayload {
  id?: string;
  userId?: string;
  sub?: string;
  role?: string;
  email?: string;
  exp?: number;
  [key: string]: unknown;
}

/**
 * Verifies HS256 JWT signature & returns decoded payload
 */
export const verifyJwtToken = (
  token: string,
  secret: string,
): DecodedJwtPayload | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      if (env.NODE_ENV !== "production") {
        logger.debug("JWT verification failed: Malformed token format");
      }
      return null;
    }

    const [headerB64, payloadB64, signatureB64] = parts;
    if (!headerB64 || !payloadB64 || !signatureB64) {
      if (env.NODE_ENV !== "production") {
        logger.debug("JWT verification failed: Missing token header, payload, or signature");
      }
      return null;
    }

    const hmac = createHmac("sha256", secret)
      .update(`${headerB64}.${payloadB64}`)
      .digest("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    const sigBuffer = Buffer.from(signatureB64);
    const expectedSigBuffer = Buffer.from(hmac);

    if (
      sigBuffer.length !== expectedSigBuffer.length ||
      !timingSafeEqual(sigBuffer, expectedSigBuffer)
    ) {
      if (env.NODE_ENV !== "production") {
        logger.warn("JWT verification failed: Invalid signature mismatch");
      }
      return null;
    }

    const base64 = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(
      Buffer.from(base64, "base64").toString("utf-8"),
    ) as DecodedJwtPayload;

    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      if (env.NODE_ENV !== "production") {
        logger.warn({ exp: payload.exp }, "JWT verification failed: Token expired");
      }
      return null;
    }

    return payload;
  } catch (err) {
    if (env.NODE_ENV !== "production") {
      logger.debug({ error: (err as Error).message }, "JWT parsing error");
    }
    return null;
  }
};

/**
 * Extracts Bearer token from Authorization header
 */
const extractBearerToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.substring(7).trim() || null;
};

/**
 * Attaches decoded user ID to request headers for downstream microservices
 */
const attachUserContext = (req: Request, payload: DecodedJwtPayload): void => {
  const userId = payload.userId || payload.id || payload.sub;
  if (userId) req.headers["x-user-id"] = String(userId);
};

/**
 * Optional Auth Middleware: Extracts user context if token is present
 */
export const optionalAuthMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const token = extractBearerToken(req);
  if (token) {
    const payload = verifyJwtToken(token, env.JWT_SECRET);
    if (payload) {
      attachUserContext(req, payload);
    } else if (env.NODE_ENV !== "production") {
      logger.debug("Optional Auth: Token present but verification failed");
    }
  }
  next();
};

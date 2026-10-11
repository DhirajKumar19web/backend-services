import type { RequestHandler } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

interface TokenPayload extends JwtPayload {
  id?: string;
  userId?: string;
  role?: string;
  email?: string;
}

const USER_CONTEXT_HEADERS = ["x-user-id", "x-user-role", "x-user-email"] as const;

const verifyToken = (authorization: string | undefined): TokenPayload | null => {
  if (!authorization?.startsWith("Bearer ")) return null;

  try {
    const payload = jwt.verify(authorization.slice(7).trim(), env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
    return typeof payload === "string" ? null : payload;
  } catch (error) {
    logger.debug({ error: (error as Error).message }, "JWT verification failed");
    return null;
  }
};

// Identity headers are trusted downstream, so only a verified token may set them.
export const authContextMiddleware: RequestHandler = (req, _res, next) => {
  for (const header of USER_CONTEXT_HEADERS) delete req.headers[header];

  const payload = verifyToken(req.headers.authorization);
  const userId = payload?.userId ?? payload?.id ?? payload?.sub;

  if (userId) req.headers["x-user-id"] = String(userId);
  if (payload?.role) req.headers["x-user-role"] = payload.role;
  if (payload?.email) req.headers["x-user-email"] = payload.email;

  next();
};

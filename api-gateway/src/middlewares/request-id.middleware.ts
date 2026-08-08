import { randomUUID } from "node:crypto";
import { Request, Response, NextFunction } from "express";

export const REQUEST_ID_HEADER = "x-request-id";

export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const existingId = req.headers[REQUEST_ID_HEADER];
  const requestId =
    typeof existingId === "string" && existingId.trim() !== ""
      ? existingId
      : randomUUID();

  req.headers[REQUEST_ID_HEADER] = requestId;
  res.setHeader(REQUEST_ID_HEADER, requestId);

  next();
};

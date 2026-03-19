import { randomUUID } from "crypto";
import { Request, Response, NextFunction } from "express";
import pinoHttp from "pino-http";
import { logger } from "../lib/logger";

const HEADER_NAME = "x-request-id";

const getOrCreateRequestId = (req: Request): string => {
  const incoming = req.header(HEADER_NAME)?.trim();
  if (incoming) return incoming;
  return randomUUID();
};

export const requestContextMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = getOrCreateRequestId(req);
  req.requestId = requestId;
  res.setHeader(HEADER_NAME, requestId);
  next();
};

export const requestLoggerMiddleware = pinoHttp({
  logger,
  autoLogging: true,
  customAttributeKeys: {
    req: "request",
    res: "response",
    err: "error",
    responseTime: "durationMs",
  },
  customProps: (req) => ({ requestId: (req as Request).requestId }),
  serializers: {
    req: (req) => ({
      id: (req as Request).requestId,
      method: req.method,
      url: req.url,
      remoteAddress: req.socket.remoteAddress,
      remotePort: req.socket.remotePort,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
});

import { NextFunction, Request, Response } from "express";
import { rateLimit } from "express-rate-limit";

const isProduction = process.env.NODE_ENV === "production";

const getEnvNumber = (key: string, fallback: number): number => {
  const raw = process.env[key];
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
};

const rateLimitHandler =
  (defaultMessage: string) =>
  (req: Request & { rateLimit?: { resetTime?: Date } }, res: Response): void => {
    const resetTime = req.rateLimit?.resetTime;
    const retryAfterSeconds = resetTime
      ? Math.max(1, Math.ceil((resetTime.getTime() - Date.now()) / 1000))
      : undefined;

    res.status(429).json({
      success: false,
      code: "RATE_LIMIT_EXCEEDED",
      message: defaultMessage,
      details: retryAfterSeconds ? { retryAfterSeconds } : undefined,
    });
  };

const passthrough = (_req: Request, _res: Response, next: NextFunction): void => {
  next();
};

const apiWindowMs = getEnvNumber("RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000);
const apiMax = getEnvNumber("RATE_LIMIT_API_MAX", 200);
const uploadMax = getEnvNumber("RATE_LIMIT_UPLOAD_MAX", 20);

export const apiLimiter = isProduction
  ? rateLimit({
      windowMs: apiWindowMs,
      limit: apiMax,
      standardHeaders: true,
      legacyHeaders: false,
      handler: rateLimitHandler("Too many requests. Please try again later."),
    })
  : passthrough;

export const uploadLimiter = isProduction
  ? rateLimit({
      windowMs: apiWindowMs,
      limit: uploadMax,
      standardHeaders: true,
      legacyHeaders: false,
      handler: rateLimitHandler("Upload rate limit exceeded. Please try again later."),
    })
  : passthrough;


import express, { Request, Response } from "express";
import cors, { CorsOptions } from "cors";
import helmet from "helmet";

import imageToPdfRoute from "./routes/imageToPdfRoute";
import mergePdfRoute from "./routes/mergePdfRoute";
import { AppError } from "./errors/AppError";
import { errorHandler } from "./middlewares/errorHandler";
import {
  requestContextMiddleware,
  requestLoggerMiddleware,
} from "./middlewares/requestContextMiddleware";
import { apiLimiter } from "./middlewares/rateLimitMiddleware";
import { metricsMiddleware, registerMetricsEndpoint } from "./observability/metrics";

const app = express();

const parseTrustProxy = (): boolean | number => {
  const trustProxy = process.env.TRUST_PROXY;
  if (!trustProxy) {
    return process.env.NODE_ENV === "production" ? 1 : false;
  }

  if (trustProxy === "true") return true;
  if (trustProxy === "false") return false;

  const parsed = Number(trustProxy);
  return Number.isNaN(parsed) ? false : parsed;
};

app.set("trust proxy", parseTrustProxy());
app.disable("x-powered-by");
app.use(helmet());
app.use(requestContextMiddleware);
app.use(requestLoggerMiddleware);

const envAllowedOrigins =
  process.env.CORS_ORIGINS
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];

const defaultDevOrigins = process.env.NODE_ENV !== "production" ? ["http://localhost:5173"] : [];
const allowedOrigins = new Set(
  envAllowedOrigins.length > 0 ? envAllowedOrigins : defaultDevOrigins
);

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    return callback(
      new AppError(403, "CORS_ORIGIN_NOT_ALLOWED", "Origin is not allowed", {
        origin,
        allowedOrigins: Array.from(allowedOrigins),
      })
    );
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-request-id"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("/{*any}", cors(corsOptions));

const bodyLimit = process.env.BODY_LIMIT ?? "1mb";
app.use(express.json({ limit: bodyLimit }));
app.use(express.urlencoded({ extended: true, limit: bodyLimit, parameterLimit: 1000 }));

app.use(metricsMiddleware);
app.use("/api", apiLimiter);

app.use("/api/convert", imageToPdfRoute);
app.use("/api/convert", mergePdfRoute);

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "OK", message: "Server running" });
});

registerMetricsEndpoint(app);

app.use(errorHandler);

export default app;

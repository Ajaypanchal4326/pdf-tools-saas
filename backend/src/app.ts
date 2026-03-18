import express, { Request, Response } from "express";
import cors, { CorsOptions } from "cors";

import imageToPdfRoute from "./routes/imageToPdfRoute";
import mergePdfRoute from "./routes/mergePdfRoute";
import { AppError } from "./errors/AppError";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

const staticAllowedOrigins = [
  "https://pdf-tools-saas-amyc.vercel.app",
  "http://localhost:5173",
];

const envAllowedOrigins =
  process.env.CORS_ORIGINS
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];

const allowedOrigins = new Set([...staticAllowedOrigins, ...envAllowedOrigins]);

const isLocalhostOrigin = (origin: string): boolean =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.has(origin) || isLocalhostOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new AppError(403, "CORS_ORIGIN_NOT_ALLOWED", "Origin is not allowed", { origin }));
  },
  methods: ["GET", "POST", "OPTIONS"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("/{*any}", cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/convert", imageToPdfRoute);
app.use("/api/convert", mergePdfRoute);

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "OK", message: "Server running" });
});

app.use(errorHandler);

export default app;

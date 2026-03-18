import express, { Request, Response, NextFunction } from "express";
import cors, { CorsOptions } from "cors";

import imageToPdfRoute from "./routes/imageToPdfRoute";
import mergePdfRoute from "./routes/mergePdfRoute";

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
    // Allow server-to-server and tools that don't send Origin.
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.has(origin) || isLocalhostOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error("CORS_ORIGIN_NOT_ALLOWED"));
  },
  methods: ["GET", "POST", "OPTIONS"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("/{*any}", cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============ ROUTES ============
app.use("/api/convert", imageToPdfRoute);
app.use("/api/convert", mergePdfRoute);

// ============ HEALTH ROUTE ============
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "OK", message: "Server running" });
});

// ============ ERROR HANDLER ============
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error("Server Error:", err);

  if (err?.message === "CORS_ORIGIN_NOT_ALLOWED") {
    return res.status(403).json({
      success: false,
      code: "CORS_ORIGIN_NOT_ALLOWED",
      message: `Origin ${req.headers.origin ?? "unknown"} is not allowed`,
    });
  }

  res.status(500).json({ success: false, message: err.message });
});

export default app;

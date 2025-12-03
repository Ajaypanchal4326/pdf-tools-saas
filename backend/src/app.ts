import express, { Request, Response, NextFunction } from "express";
import cors from "cors";

import imageToPdfRoute from "./routes/imageToPdfRoute";
import mergePdfRoute from "./routes/mergePdfRoute";


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/convert", imageToPdfRoute);
app.use("/api/convert", mergePdfRoute);

// Health Check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "OK", message: "Server running" });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error("❌ Server Error:", err);

  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Something went wrong!",
  });
});

export default app;

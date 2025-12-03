import express, { Request, Response, NextFunction } from "express";
import cors from "cors";

import imageToPdfRoute from "./routes/imageToPdfRoute";
import mergePdfRoute from "./routes/mergePdfRoute";

const app = express();

// ---------------- CORS FIX ----------------
app.use(
  cors({
    origin: [
      "https://pdf-tools-saas-amyc.vercel.app",   // NEW frontend
      "https://pdf-tools-saas-ten.vercel.app",    // OLD frontend (optional)
      "http://localhost:5173"
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
  })
);

// ------------------------------------------

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

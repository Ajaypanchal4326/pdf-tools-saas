import express, { Request, Response, NextFunction } from "express";
import cors from "cors";

import imageToPdfRoute from "./routes/imageToPdfRoute";
import mergePdfRoute from "./routes/mergePdfRoute";

const app = express();

// ======================================
// CORS MUST BE THE FIRST MIDDLEWARE
// ======================================
app.use(
  cors({
    origin: [
      "https://pdf-tools-saas-amyc.vercel.app",  // your frontend
      "http://localhost:5173"
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

app.options("/{*any}", cors());
// ======================================

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
  res.status(500).json({ success: false, message: err.message });
});

export default app;

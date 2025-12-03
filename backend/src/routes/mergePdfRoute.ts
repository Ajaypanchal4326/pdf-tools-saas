import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { mergePdf } from "../controllers/mergePdfController";

const router = express.Router();

// Make sure upload directory exists (works on Render)
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const uploadPdf = multer({
  storage,
  fileFilter: (_, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files allowed"));
    }
    cb(null, true);
  },
});

router.post("/merge-pdf", uploadPdf.array("files", 20), mergePdf);

export default router;

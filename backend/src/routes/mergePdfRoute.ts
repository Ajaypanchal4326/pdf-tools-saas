import express from "express";
import multer from "multer";
import { mergePdf } from "../controllers/mergePdfController";

const router = express.Router();

// Multer storage for PDF files
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, "uploads/"),
  filename: (_, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + ".pdf");
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

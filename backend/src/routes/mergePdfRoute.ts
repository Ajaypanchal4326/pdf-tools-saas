import express from "express";
import { mergePdf } from "../controllers/mergePdfController";
import { createUploader } from "../middlewares/uploadMiddleware";
import { validateUploadedFiles } from "../middlewares/validationMiddleware";

const router = express.Router();

const PDF_MIME_TYPES = ["application/pdf"];

const uploadPdfs = createUploader({
  allowedMimeTypes: PDF_MIME_TYPES,
  maxFileSizeBytes: 20 * 1024 * 1024,
});

router.post(
  "/merge-pdf",
  uploadPdfs.array("files", 20),
  validateUploadedFiles({
    minCount: 2,
    maxCount: 20,
    maxFileSizeBytes: 20 * 1024 * 1024,
    allowedMimeTypes: PDF_MIME_TYPES,
  }),
  mergePdf
);

export default router;

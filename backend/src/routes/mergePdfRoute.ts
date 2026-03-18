import express from "express";
import { mergePdf } from "../controllers/mergePdfController";
import { createUploader } from "../middlewares/uploadMiddleware";
import { validateUploadedFiles } from "../middlewares/validationMiddleware";

const router = express.Router();

const PDF_MIME_TYPES = ["application/pdf"];
const PDF_MAX_FILE_SIZE = 20 * 1024 * 1024;
const PDF_MAX_FILE_COUNT = 20;

const uploadPdfs = createUploader({
  allowedMimeTypes: PDF_MIME_TYPES,
  maxFileSizeBytes: PDF_MAX_FILE_SIZE,
  maxFileCount: PDF_MAX_FILE_COUNT,
});

router.post(
  "/merge-pdf",
  uploadPdfs.array("files", PDF_MAX_FILE_COUNT),
  validateUploadedFiles({
    minCount: 2,
    maxCount: PDF_MAX_FILE_COUNT,
    maxFileSizeBytes: PDF_MAX_FILE_SIZE,
    allowedMimeTypes: PDF_MIME_TYPES,
  }),
  mergePdf
);

export default router;

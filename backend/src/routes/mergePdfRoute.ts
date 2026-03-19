import express from "express";
import { mergePdf } from "../controllers/mergePdfController";
import { createUploader } from "../middlewares/uploadMiddleware";
import { validateUploadedFiles } from "../middlewares/validationMiddleware";
import {
  MAX_UPLOAD_FILE_COUNT,
  MAX_UPLOAD_FILE_SIZE_BYTES,
} from "../constants/uploadLimits";

const router = express.Router();

const PDF_MIME_TYPES = ["application/pdf"];

const uploadPdfs = createUploader({
  allowedMimeTypes: PDF_MIME_TYPES,
  maxFileSizeBytes: MAX_UPLOAD_FILE_SIZE_BYTES,
  maxFileCount: MAX_UPLOAD_FILE_COUNT,
});

router.post(
  "/merge-pdf",
  uploadPdfs.array("files", MAX_UPLOAD_FILE_COUNT),
  validateUploadedFiles({
    minCount: 2,
    maxCount: MAX_UPLOAD_FILE_COUNT,
    maxFileSizeBytes: MAX_UPLOAD_FILE_SIZE_BYTES,
    allowedMimeTypes: PDF_MIME_TYPES,
  }),
  mergePdf
);

export default router;

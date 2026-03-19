import express from "express";
import { convertImageToPdf } from "../controllers/imageToPdfController";
import { createUploader } from "../middlewares/uploadMiddleware";
import { validateUploadedFiles } from "../middlewares/validationMiddleware";
import {
  MAX_UPLOAD_FILE_COUNT,
  MAX_UPLOAD_FILE_SIZE_BYTES,
} from "../constants/uploadLimits";

const router = express.Router();

const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/tiff",
];

const uploadImages = createUploader({
  allowedMimeTypes: IMAGE_MIME_TYPES,
  maxFileSizeBytes: MAX_UPLOAD_FILE_SIZE_BYTES,
  maxFileCount: MAX_UPLOAD_FILE_COUNT,
});

router.post(
  "/image-to-pdf",
  uploadImages.array("files", MAX_UPLOAD_FILE_COUNT),
  validateUploadedFiles({
    minCount: 1,
    maxCount: MAX_UPLOAD_FILE_COUNT,
    maxFileSizeBytes: MAX_UPLOAD_FILE_SIZE_BYTES,
    allowedMimeTypes: IMAGE_MIME_TYPES,
  }),
  convertImageToPdf
);

export default router;

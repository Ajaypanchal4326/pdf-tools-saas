import express from "express";
import { convertImageToPdf } from "../controllers/imageToPdfController";
import { createUploader } from "../middlewares/uploadMiddleware";
import { validateUploadedFiles } from "../middlewares/validationMiddleware";

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

const IMAGE_MAX_FILE_SIZE = 20 * 1024 * 1024;
const IMAGE_MAX_FILE_COUNT = 20;

const uploadImages = createUploader({
  allowedMimeTypes: IMAGE_MIME_TYPES,
  maxFileSizeBytes: IMAGE_MAX_FILE_SIZE,
  maxFileCount: IMAGE_MAX_FILE_COUNT,
});

router.post(
  "/image-to-pdf",
  uploadImages.array("files", IMAGE_MAX_FILE_COUNT),
  validateUploadedFiles({
    minCount: 1,
    maxCount: IMAGE_MAX_FILE_COUNT,
    maxFileSizeBytes: IMAGE_MAX_FILE_SIZE,
    allowedMimeTypes: IMAGE_MIME_TYPES,
  }),
  convertImageToPdf
);

export default router;

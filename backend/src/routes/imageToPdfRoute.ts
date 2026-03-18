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

const uploadImages = createUploader({
  allowedMimeTypes: IMAGE_MIME_TYPES,
  maxFileSizeBytes: 20 * 1024 * 1024,
});

router.post(
  "/image-to-pdf",
  uploadImages.array("files", 20),
  validateUploadedFiles({
    minCount: 1,
    maxCount: 20,
    maxFileSizeBytes: 20 * 1024 * 1024,
    allowedMimeTypes: IMAGE_MIME_TYPES,
  }),
  convertImageToPdf
);

export default router;

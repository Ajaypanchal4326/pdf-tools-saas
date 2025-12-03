import express from "express";
import { upload } from "../utils/upload";
import { convertImageToPdf } from "../controllers/imageToPdfController";

const router = express.Router();

// POST /api/convert/image-to-pdf
router.post("/image-to-pdf", upload.array("files", 20), convertImageToPdf);

export default router;

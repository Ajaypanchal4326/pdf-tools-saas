import { randomUUID } from "crypto";
import { Request, Response } from "express";
import { PDFDocument } from "pdf-lib";
import { readFile, unlink } from "fs/promises";
import sharp from "sharp";
import { logger } from "../lib/logger";

type ControllerError = Error & {
  status?: number;
  code?: string;
};

const cleanupUploadedFiles = async (files: Express.Multer.File[] = []): Promise<void> => {
  await Promise.allSettled(files.map((file) => unlink(file.path)));
};

export const convertImageToPdf = async (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[]) ?? [];

  try {
    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        errorId: randomUUID(),
        code: "NO_FILES_UPLOADED",
        message: "No files uploaded",
      });
    }

    const pdfDoc = await PDFDocument.create();

    for (const file of files) {
      let inputBuffer: Buffer;
      try {
        inputBuffer = await readFile(file.path);
      } catch {
        throw Object.assign(new Error(`Failed to read uploaded file: ${file.originalname}`), {
          status: 500,
          code: "UPLOAD_FILE_READ_FAILED",
        }) as ControllerError;
      }

      let imgBuffer: Buffer;
      try {
        imgBuffer = await sharp(inputBuffer).png().toBuffer();
      } catch {
        throw Object.assign(new Error(`Unsupported or invalid image file: ${file.originalname}`), {
          status: 422,
          code: "IMAGE_PROCESSING_FAILED",
        }) as ControllerError;
      }

      let image;
      try {
        image = await pdfDoc.embedPng(imgBuffer);
      } catch {
        throw Object.assign(new Error(`Failed to embed image into PDF: ${file.originalname}`), {
          status: 500,
          code: "PDF_EMBED_IMAGE_FAILED",
        }) as ControllerError;
      }

      const { width, height } = image;
      const page = pdfDoc.addPage([width, height]);
      page.drawImage(image, { x: 0, y: 0, width, height });
    }

    const pdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=converted.pdf");
    res.setHeader("Content-Length", pdfBytes.length.toString());

    return res.send(Buffer.from(pdfBytes));
  } catch (error: unknown) {
    const err = error as ControllerError;
    const errorId = randomUUID();

    logger.error(
      {
        requestId: req.requestId,
        errorId,
        code: err.code ?? "IMAGE_TO_PDF_PROCESSING_FAILED",
        err,
      },
      "Image to PDF conversion failed"
    );

    return res.status(err.status ?? 500).json({
      success: false,
      errorId,
      code: err.code ?? "IMAGE_TO_PDF_PROCESSING_FAILED",
      message: err.message || "Conversion failed",
      error: err.message,
    });
  } finally {
    await cleanupUploadedFiles(files);
  }
};

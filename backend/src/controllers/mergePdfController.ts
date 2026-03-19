import { randomUUID } from "crypto";
import { Request, Response } from "express";
import { PDFDocument } from "pdf-lib";
import { readFile, unlink } from "fs/promises";
import { logger } from "../lib/logger";

type ControllerError = Error & {
  status?: number;
  code?: string;
};

const cleanupUploadedFiles = async (files: Express.Multer.File[] = []): Promise<void> => {
  await Promise.allSettled(files.map((file) => unlink(file.path)));
};

export const mergePdf = async (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[]) ?? [];

  try {
    if (files.length < 2) {
      return res.status(400).json({
        success: false,
        errorId: randomUUID(),
        code: "MINIMUM_FILES_REQUIRED",
        message: "Please upload at least two PDF files",
      });
    }

    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      let pdfBytes: Buffer;
      try {
        pdfBytes = await readFile(file.path);
      } catch {
        throw Object.assign(new Error(`Failed to read uploaded file: ${file.originalname}`), {
          status: 500,
          code: "UPLOAD_FILE_READ_FAILED",
        }) as ControllerError;
      }

      let pdf;
      try {
        pdf = await PDFDocument.load(pdfBytes);
      } catch {
        throw Object.assign(new Error(`Invalid PDF file: ${file.originalname}`), {
          status: 422,
          code: "INVALID_PDF_FILE",
        }) as ControllerError;
      }

      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((page) => mergedPdf.addPage(page));
    }

    const finalPdfBytes = await mergedPdf.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=merged.pdf");
    res.setHeader("Content-Length", finalPdfBytes.length.toString());

    return res.send(Buffer.from(finalPdfBytes));
  } catch (error: unknown) {
    const err = error as ControllerError;
    const errorId = randomUUID();

    logger.error(
      {
        requestId: req.requestId,
        errorId,
        code: err.code ?? "PDF_MERGE_PROCESSING_FAILED",
        err,
      },
      "Merge PDF failed"
    );

    return res.status(err.status ?? 500).json({
      success: false,
      errorId,
      code: err.code ?? "PDF_MERGE_PROCESSING_FAILED",
      message: err.message || "Failed to merge PDFs",
      error: err.message,
    });
  } finally {
    await cleanupUploadedFiles(files);
  }
};

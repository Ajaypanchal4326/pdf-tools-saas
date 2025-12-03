import { Request, Response } from "express";
import { PDFDocument } from "pdf-lib";
import fs from "fs";
import path from "path";

export const mergePdf = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Upload at least two PDF files"
      });
    }

    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      const pdfBytes = fs.readFileSync(file.path);
      const pdf = await PDFDocument.load(pdfBytes);

      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((page) => mergedPdf.addPage(page));
    }

    const finalPdf = await mergedPdf.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=merged.pdf");

    res.send(Buffer.from(finalPdf));

    // cleanup
    files.forEach((f) => fs.unlinkSync(f.path));
  } catch (error) {
    console.error("Merge error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to merge PDFs"
    });
  }
};

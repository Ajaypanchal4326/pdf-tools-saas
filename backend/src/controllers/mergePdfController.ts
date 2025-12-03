import { Request, Response } from "express";
import { PDFDocument } from "pdf-lib";
import fs from "fs";

export const mergePdf = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least two PDF files",
      });
    }

    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      try {
        const pdfBytes = fs.readFileSync(file.path);
        const pdf = await PDFDocument.load(pdfBytes);

        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));

      } catch (err) {
        console.error(`❌ Error merging file: ${file.originalname}`, err);
      }
    }

    const finalPdfBytes = await mergedPdf.save();

    // Response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=merged.pdf");
    res.setHeader("Content-Length", finalPdfBytes.length.toString());

    // Send PDF
    res.send(Buffer.from(finalPdfBytes));

    // Cleanup
    files.forEach((f) => {
      if (fs.existsSync(f.path)) {
        fs.unlinkSync(f.path);
      }
    });

  } catch (error: any) {
    console.error("❌ Merge PDF Error:", error);

    const files = req.files as Express.Multer.File[];
    files?.forEach((f) => fs.existsSync(f.path) && fs.unlinkSync(f.path));

    return res.status(500).json({
      success: false,
      message: "Failed to merge PDFs",
      error: error.message,
    });
  }
};

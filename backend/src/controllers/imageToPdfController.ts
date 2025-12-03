import { Request, Response } from "express";
import { PDFDocument } from "pdf-lib";
import fs from "fs";
import sharp from "sharp";

export const convertImageToPdf = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }

    const pdfDoc = await PDFDocument.create();

    for (const file of files) {
      try {
        // Read file buffer
        const inputBuffer = fs.readFileSync(file.path);

        // Convert image to PNG buffer (universal)
        const imgBuffer = await sharp(inputBuffer).png().toBuffer();

        // Embed into PDF
        const image = await pdfDoc.embedPng(imgBuffer);
        const { width, height } = image;

        const page = pdfDoc.addPage([width, height]);
        page.drawImage(image, { x: 0, y: 0, width, height });

      } catch (err) {
        console.error(`❌ Error processing file: ${file.originalname}`, err);
      }
    }

    const pdfBytes = await pdfDoc.save();

    // Headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=converted.pdf");
    res.setHeader("Content-Length", pdfBytes.length.toString());

    res.send(Buffer.from(pdfBytes));

    // Cleanup temp uploads
    files.forEach((file) => {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    });

  } catch (err: any) {
    console.error("❌ PDF Conversion Error:", err);

    const files = req.files as Express.Multer.File[];
    files?.forEach((f) => fs.existsSync(f.path) && fs.unlinkSync(f.path));

    return res.status(500).json({
      success: false,
      message: "Conversion failed",
      error: err.message,
    });
  }
};

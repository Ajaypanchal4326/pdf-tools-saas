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
        const imgBuffer = await sharp(file.path).png().toBuffer();
        const image = await pdfDoc.embedPng(imgBuffer);

        const { width, height } = image;
        const page = pdfDoc.addPage([width, height]);

        page.drawImage(image, { x: 0, y: 0, width, height });
      } catch (err) {
        console.error(`Error with file ${file.originalname}`, err);
      }
    }

    const pdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=converted.pdf");

    res.send(Buffer.from(pdfBytes));

    // Clean uploads
    files.forEach((f) => fs.existsSync(f.path) && fs.unlinkSync(f.path));

  } catch (err: any) {
    console.error("Image → PDF Error:", err);

    // Cleanup
    const files = req.files as Express.Multer.File[];
    files?.forEach((f) => fs.existsSync(f.path) && fs.unlinkSync(f.path));

    res.status(500).json({ success: false, message: "Conversion failed", error: err.message });
  }
};

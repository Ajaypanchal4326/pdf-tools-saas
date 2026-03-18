import multer from "multer";
import path from "path";
import fs from "fs";
import { AppError } from "../errors/AppError";

type UploadConfig = {
  allowedMimeTypes: string[];
  maxFileSizeBytes: number;
};

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

export const createUploader = ({ allowedMimeTypes, maxFileSizeBytes }: UploadConfig) =>
  multer({
    storage,
    limits: { fileSize: maxFileSizeBytes },
    fileFilter: (_, file, cb) => {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(
          new AppError(
            415,
            "UNSUPPORTED_FILE_TYPE",
            `Unsupported file type: ${file.mimetype || "unknown"}`,
            {
              allowedMimeTypes,
            }
          )
        );
      }

      return cb(null, true);
    },
  });

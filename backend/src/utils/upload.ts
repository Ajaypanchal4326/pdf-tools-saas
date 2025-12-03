import multer from "multer";
import path from "path";
import fs from "fs";

// Uploads folder
const uploadsDir = path.join(__dirname, "../../uploads");

// Create uploads folder if missing
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadsDir),
  filename: (_, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

// Allowed image types
const allowed = /jpeg|jpg|png|webp|gif|bmp|tiff/;

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const extOK = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeOK = allowed.test(file.mimetype);

  if (extOK && mimeOK) cb(null, true);
  else cb(new Error("Only image files are allowed!"));
};

// Multer export
export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
});

import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { AppError } from "../errors/AppError";

type FileValidationOptions = {
  minCount: number;
  maxCount: number;
  maxFileSizeBytes: number;
  allowedMimeTypes: string[];
};

const uploadedFileSchema = z.object({
  originalname: z.string().min(1),
  mimetype: z.string().min(1),
  size: z.number().int().nonnegative(),
  path: z.string().min(1),
});

export const validateUploadedFiles = ({
  minCount,
  maxCount,
  maxFileSizeBytes,
  allowedMimeTypes,
}: FileValidationOptions) => {
  const filesSchema = z.array(uploadedFileSchema);

  return (req: Request, _res: Response, next: NextFunction) => {
    const files = (req.files as Express.Multer.File[]) ?? [];

    const parsed = filesSchema.safeParse(files);
    if (!parsed.success) {
      return next(
        new AppError(400, "INVALID_UPLOAD_PAYLOAD", "Uploaded files payload is invalid", {
          issues: parsed.error.issues,
        })
      );
    }

    if (files.length < minCount || files.length > maxCount) {
      return next(
        new AppError(
          400,
          "INVALID_FILE_COUNT",
          `Expected between ${minCount} and ${maxCount} files, received ${files.length}`,
          {
            minCount,
            maxCount,
            received: files.length,
          }
        )
      );
    }

    const oversizedFile = files.find((file) => file.size > maxFileSizeBytes);
    if (oversizedFile) {
      return next(
        new AppError(
          413,
          "FILE_TOO_LARGE",
          `File exceeds size limit: ${oversizedFile.originalname}`,
          {
            maxFileSizeBytes,
            filename: oversizedFile.originalname,
            size: oversizedFile.size,
          }
        )
      );
    }

    const unsupportedFile = files.find((file) => !allowedMimeTypes.includes(file.mimetype));
    if (unsupportedFile) {
      return next(
        new AppError(
          415,
          "UNSUPPORTED_FILE_TYPE",
          `Unsupported file type: ${unsupportedFile.mimetype}`,
          {
            allowedMimeTypes,
            filename: unsupportedFile.originalname,
            mimetype: unsupportedFile.mimetype,
          }
        )
      );
    }

    return next();
  };
};

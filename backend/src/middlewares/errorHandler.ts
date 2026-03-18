import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { unlink } from "fs/promises";
import { AppError } from "../errors/AppError";

const cleanupUploadedFiles = async (req: Request): Promise<void> => {
  const files = (req.files as Express.Multer.File[]) ?? [];
  await Promise.allSettled(files.map((file) => unlink(file.path)));
};

export const errorHandler = async (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  await cleanupUploadedFiles(req);

  if (err instanceof AppError) {
    return res.status(err.status).json({
      success: false,
      code: err.code,
      message: err.message,
      details: err.details,
    });
  }

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        code: "FILE_TOO_LARGE",
        message: "One or more files exceed the allowed size",
      });
    }

    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        code: "INVALID_FILE_COUNT",
        message: "Too many files uploaded",
      });
    }

    return res.status(400).json({
      success: false,
      code: "UPLOAD_ERROR",
      message: err.message,
    });
  }

  const bodyParserError = err as { type?: string; status?: number; message?: string };

  if (bodyParserError.type === "entity.too.large" || bodyParserError.status === 413) {
    return res.status(413).json({
      success: false,
      code: "REQUEST_BODY_TOO_LARGE",
      message: "Request body exceeds the allowed limit",
    });
  }

  if (bodyParserError.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      code: "INVALID_JSON_PAYLOAD",
      message: "Malformed JSON payload",
    });
  }

  return res.status(500).json({
    success: false,
    code: "INTERNAL_SERVER_ERROR",
    message: bodyParserError.message ?? "Unexpected server error",
  });
};

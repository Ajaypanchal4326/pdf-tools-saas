import { randomUUID } from "crypto";
import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { unlink } from "fs/promises";
import { AppError } from "../errors/AppError";
import { logger } from "../lib/logger";

const cleanupUploadedFiles = async (req: Request): Promise<void> => {
  const files = (req.files as Express.Multer.File[]) ?? [];
  await Promise.allSettled(files.map((file) => unlink(file.path)));
};

const buildErrorId = () => randomUUID();

export const errorHandler = async (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  await cleanupUploadedFiles(req);

  if (err instanceof AppError) {
    const errorId = err.errorId ?? buildErrorId();
    logger.warn(
      {
        requestId: req.requestId,
        errorId,
        status: err.status,
        code: err.code,
        details: err.details,
      },
      "Handled application error"
    );

    return res.status(err.status).json({
      success: false,
      errorId,
      code: err.code,
      message: err.message,
      details: err.details,
    });
  }

  if (err instanceof multer.MulterError) {
    const errorId = buildErrorId();
    logger.warn(
      {
        requestId: req.requestId,
        errorId,
        code: err.code,
        message: err.message,
      },
      "Handled upload middleware error"
    );

    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        errorId,
        code: "FILE_TOO_LARGE",
        message: "One or more files exceed the allowed size",
      });
    }

    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        errorId,
        code: "INVALID_FILE_COUNT",
        message: "Too many files uploaded",
      });
    }

    return res.status(400).json({
      success: false,
      errorId,
      code: "UPLOAD_ERROR",
      message: err.message,
    });
  }

  const bodyParserError = err as { type?: string; status?: number; message?: string };
  const errorId = buildErrorId();

  if (bodyParserError.type === "entity.too.large" || bodyParserError.status === 413) {
    logger.warn({ requestId: req.requestId, errorId, bodyParserError }, "Request body too large");
    return res.status(413).json({
      success: false,
      errorId,
      code: "REQUEST_BODY_TOO_LARGE",
      message: "Request body exceeds the allowed limit",
    });
  }

  if (bodyParserError.type === "entity.parse.failed") {
    logger.warn({ requestId: req.requestId, errorId, bodyParserError }, "Invalid JSON payload");
    return res.status(400).json({
      success: false,
      errorId,
      code: "INVALID_JSON_PAYLOAD",
      message: "Malformed JSON payload",
    });
  }

  logger.error(
    {
      requestId: req.requestId,
      errorId,
      err,
    },
    "Unhandled server error"
  );

  return res.status(500).json({
    success: false,
    errorId,
    code: "INTERNAL_SERVER_ERROR",
    message: bodyParserError.message ?? "Unexpected server error",
  });
};

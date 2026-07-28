import multer from 'multer';
import type { RequestHandler } from 'express';
import { env } from '../../../config/env';
import { ALLOWED_IMAGE_MIME_TYPES } from '../../../types/media';
import { AppError } from '../../../utils/AppError';

const storage = multer.memoryStorage();

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if ((ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(file.mimetype)) {
    cb(null, true);
    return;
  }
  cb(AppError.badRequest('Only JPEG, PNG, and WebP images are allowed'));
};

export const uploadSingleImage = multer({
  storage,
  limits: { fileSize: env.UPLOAD_MAX_FILE_SIZE_MB * 1024 * 1024, files: 1 },
  fileFilter,
}).single('image');

export const uploadMultipleImages = multer({
  storage,
  limits: {
    fileSize: env.UPLOAD_MAX_FILE_SIZE_MB * 1024 * 1024,
    files: env.UPLOAD_MAX_FILES,
  },
  fileFilter,
}).array('images', env.UPLOAD_MAX_FILES);

export function handleMulterError(middleware: RequestHandler): RequestHandler {
  return (req, res, next) => {
    middleware(req, res, (err) => {
      if (!err) {
        next();
        return;
      }

      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          next(AppError.badRequest(`File too large. Max ${env.UPLOAD_MAX_FILE_SIZE_MB}MB`));
          return;
        }
        if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
          next(AppError.badRequest('Too many files uploaded'));
          return;
        }
        next(AppError.badRequest(err.message));
        return;
      }

      next(err);
    });
  };
}

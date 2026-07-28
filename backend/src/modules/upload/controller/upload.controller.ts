import type { Request, Response } from 'express';
import { body } from 'express-validator';
import { ApiResponse } from '../../../utils/ApiResponse';
import { AppError } from '../../../utils/AppError';
import { asyncHandler } from '../../../utils/asyncHandler';
import { uploadService } from '../service/upload.service';

export class UploadController {
  uploadOne = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw AppError.badRequest('Image file is required (field: image)');
    }
    const image = await uploadService.uploadImage(req.file);
    return ApiResponse.created(res, { image }, 'Image uploaded');
  });

  uploadMany = asyncHandler(async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files?.length) {
      throw AppError.badRequest('Image files are required (field: images)');
    }
    const images = await uploadService.uploadImages(files);
    return ApiResponse.created(res, { images }, 'Images uploaded');
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    await uploadService.deleteImage(req.body.publicId);
    return ApiResponse.success(res, null, 'Image deleted');
  });
}

export const uploadController = new UploadController();

export const deleteImageValidators = [
  body('publicId').isString().notEmpty().withMessage('publicId is required'),
];

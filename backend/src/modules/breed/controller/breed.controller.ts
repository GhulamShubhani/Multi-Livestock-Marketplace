import type { Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import { ApiResponse } from '../../../utils/ApiResponse';
import { asyncHandler } from '../../../utils/asyncHandler';
import { breedService } from '../service/breed.service';

export class BreedController {
  listPublic = asyncHandler(async (req: Request, res: Response) => {
    const result = await breedService.listPublic(req.query as Record<string, unknown>);
    return ApiResponse.success(res, { breeds: result.items }, 'OK', 200, result.meta);
  });

  listAdmin = asyncHandler(async (req: Request, res: Response) => {
    const result = await breedService.listAdmin(req.query as Record<string, unknown>);
    return ApiResponse.success(res, { breeds: result.items }, 'OK', 200, result.meta);
  });

  getBySlug = asyncHandler(async (req: Request, res: Response) => {
    const breed = await breedService.getBySlug(req.params.slug, true);
    return ApiResponse.success(res, { breed }, 'OK');
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const breed = await breedService.getById(req.params.id);
    return ApiResponse.success(res, { breed }, 'OK');
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const breed = await breedService.create(req.body, req.user!.id);
    return ApiResponse.created(res, { breed }, 'Breed created');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const breed = await breedService.update(req.params.id, req.body, req.user!.id);
    return ApiResponse.success(res, { breed }, 'Breed updated');
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    await breedService.remove(req.params.id, req.user!.id);
    return ApiResponse.success(res, null, 'Breed deleted');
  });
}

export const breedController = new BreedController();

export const breedListValidators = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('q').optional().isString().isLength({ max: 100 }),
  query('categoryId').optional().isMongoId(),
];

export const createBreedValidators = [
  body('name').trim().notEmpty().isLength({ max: 120 }),
  body('slug').optional().isString().isLength({ max: 140 }),
  body('description').optional().isString().isLength({ max: 5000 }),
  body('origin').optional().isString().isLength({ max: 120 }),
  body('temperament').optional().isArray(),
  body('temperament.*').optional().isString(),
  body('lifeSpan').optional().isString().isLength({ max: 50 }),
  body('categoryIds').optional().isArray(),
  body('categoryIds.*').optional().isMongoId(),
  body('isActive').optional().isBoolean().toBoolean(),
  body('image').optional().isObject(),
  body('image.url').optional().isURL(),
  body('image.publicId').optional().isString().notEmpty(),
];

export const updateBreedValidators = [
  param('id').isMongoId(),
  body('name').optional().trim().notEmpty().isLength({ max: 120 }),
  body('slug').optional().isString().isLength({ max: 140 }),
  body('description').optional().isString().isLength({ max: 5000 }),
  body('origin').optional().isString().isLength({ max: 120 }),
  body('temperament').optional().isArray(),
  body('lifeSpan').optional().isString().isLength({ max: 50 }),
  body('categoryIds').optional().isArray(),
  body('categoryIds.*').optional().isMongoId(),
  body('isActive').optional().isBoolean().toBoolean(),
  body('image').optional().isObject(),
];

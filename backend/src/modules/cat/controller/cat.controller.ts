import type { Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import { ApiResponse } from '../../../utils/ApiResponse';
import { asyncHandler } from '../../../utils/asyncHandler';
import { catService } from '../service/cat.service';

export class CatController {
  listPublic = asyncHandler(async (req: Request, res: Response) => {
    const result = await catService.listPublic(req.query as Record<string, unknown>);
    return ApiResponse.success(res, { cats: result.items }, 'OK', 200, result.meta);
  });

  listAdmin = asyncHandler(async (req: Request, res: Response) => {
    const result = await catService.listAdmin(req.query as Record<string, unknown>);
    return ApiResponse.success(res, { cats: result.items }, 'OK', 200, result.meta);
  });

  getBySlug = asyncHandler(async (req: Request, res: Response) => {
    const cat = await catService.getBySlug(req.params.slug, true);
    return ApiResponse.success(res, { cat }, 'OK');
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const cat = await catService.getById(req.params.id);
    return ApiResponse.success(res, { cat }, 'OK');
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const cat = await catService.create(req.body, req.user!.id);
    return ApiResponse.created(res, { cat }, 'Cat created');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const cat = await catService.update(req.params.id, req.body, req.user!.id);
    return ApiResponse.success(res, { cat }, 'Cat updated');
  });

  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const cat = await catService.updateStatus(req.params.id, req.body.status, req.user!.id);
    return ApiResponse.success(res, { cat }, 'Cat status updated');
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    await catService.remove(req.params.id, req.user!.id);
    return ApiResponse.success(res, null, 'Cat deleted');
  });
}

export const catController = new CatController();

export const catListValidators = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('q').optional().isString().isLength({ max: 100 }),
  query('breed').optional().isMongoId(),
  query('category').optional().isMongoId(),
  query('gender').optional().isIn(['male', 'female', 'unknown']),
  query('featured').optional().isIn(['true', 'false']),
  query('minPrice').optional().isInt({ min: 0 }).toInt(),
  query('maxPrice').optional().isInt({ min: 0 }).toInt(),
  query('sort').optional().isString(),
  query('status').optional().isIn(['draft', 'available', 'reserved', 'sold', 'archived']),
];

export const createCatValidators = [
  body('name').trim().notEmpty().isLength({ max: 120 }),
  body('slug').optional().isString().isLength({ max: 140 }),
  body('sku').optional().isString().isLength({ max: 64 }),
  body('description').trim().notEmpty().isLength({ max: 10000 }),
  body('shortDescription').optional().isString().isLength({ max: 500 }),
  body('breed').isMongoId().withMessage('Valid breed id required'),
  body('category').isMongoId().withMessage('Valid category id required'),
  body('ageMonths').isInt({ min: 0, max: 360 }).toInt(),
  body('gender').optional().isIn(['male', 'female', 'unknown']),
  body('color').optional().isString().isLength({ max: 80 }),
  body('price').isInt({ min: 0 }).withMessage('Price must be integer cents').toInt(),
  body('compareAtPrice').optional().isInt({ min: 0 }).toInt(),
  body('currency').optional().isLength({ min: 3, max: 3 }),
  body('stock').optional().isInt({ min: 0 }).toInt(),
  body('status').optional().isIn(['draft', 'available', 'reserved', 'sold', 'archived']),
  body('images').optional().isArray({ max: 20 }),
  body('images.*.url').optional().isURL(),
  body('images.*.publicId').optional().isString().notEmpty(),
  body('vaccinated').optional().isBoolean().toBoolean(),
  body('neutered').optional().isBoolean().toBoolean(),
  body('pedigree').optional().isBoolean().toBoolean(),
  body('featured').optional().isBoolean().toBoolean(),
];

export const updateCatValidators = [
  param('id').isMongoId(),
  body('name').optional().trim().notEmpty().isLength({ max: 120 }),
  body('description').optional().trim().notEmpty().isLength({ max: 10000 }),
  body('breed').optional().isMongoId(),
  body('category').optional().isMongoId(),
  body('ageMonths').optional().isInt({ min: 0, max: 360 }).toInt(),
  body('price').optional().isInt({ min: 0 }).toInt(),
  body('stock').optional().isInt({ min: 0 }).toInt(),
  body('status').optional().isIn(['draft', 'available', 'reserved', 'sold', 'archived']),
  body('featured').optional().isBoolean().toBoolean(),
];

export const updateCatStatusValidators = [
  param('id').isMongoId(),
  body('status').isIn(['draft', 'available', 'reserved', 'sold', 'archived']),
];

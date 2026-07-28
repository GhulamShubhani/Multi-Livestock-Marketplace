import type { Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import { ApiResponse } from '../../../utils/ApiResponse';
import { asyncHandler } from '../../../utils/asyncHandler';
import { categoryService } from '../service/category.service';

export class CategoryController {
  listPublic = asyncHandler(async (req: Request, res: Response) => {
    const result = await categoryService.listPublic(req.query as Record<string, unknown>);
    return ApiResponse.success(res, { categories: result.items }, 'OK', 200, result.meta);
  });

  listAdmin = asyncHandler(async (req: Request, res: Response) => {
    const result = await categoryService.listAdmin(req.query as Record<string, unknown>);
    return ApiResponse.success(res, { categories: result.items }, 'OK', 200, result.meta);
  });

  getBySlug = asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.getBySlug(req.params.slug, true);
    return ApiResponse.success(res, { category }, 'OK');
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.getById(req.params.id);
    return ApiResponse.success(res, { category }, 'OK');
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.create(req.body, req.user!.id);
    return ApiResponse.created(res, { category }, 'Category created');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.update(req.params.id, req.body, req.user!.id);
    return ApiResponse.success(res, { category }, 'Category updated');
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    await categoryService.remove(req.params.id, req.user!.id);
    return ApiResponse.success(res, null, 'Category deleted');
  });
}

export const categoryController = new CategoryController();

const mediaValidators = [
  body('image').optional().isObject(),
  body('image.url').optional().isURL(),
  body('image.publicId').optional().isString().notEmpty(),
];

export const categoryListValidators = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('q').optional().isString().isLength({ max: 100 }),
];

export const createCategoryValidators = [
  body('name').trim().notEmpty().isLength({ max: 120 }),
  body('slug').optional().isString().isLength({ max: 140 }),
  body('description').optional().isString().isLength({ max: 2000 }),
  body('parent').optional({ nullable: true }).isMongoId(),
  body('isActive').optional().isBoolean().toBoolean(),
  body('sortOrder').optional().isInt().toInt(),
  ...mediaValidators,
];

export const updateCategoryValidators = [
  param('id').isMongoId(),
  body('name').optional().trim().notEmpty().isLength({ max: 120 }),
  body('slug').optional().isString().isLength({ max: 140 }),
  body('description').optional().isString().isLength({ max: 2000 }),
  body('parent').optional({ nullable: true }).custom((v) => v === null || v === '' || /^[a-f\d]{24}$/i.test(v)),
  body('isActive').optional().isBoolean().toBoolean(),
  body('sortOrder').optional().isInt().toInt(),
  ...mediaValidators,
];

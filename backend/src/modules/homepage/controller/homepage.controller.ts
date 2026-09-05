import type { Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import { ApiResponse } from '../../../utils/ApiResponse';
import { asyncHandler } from '../../../utils/asyncHandler';
import { HOMEPAGE_SECTION_TYPES } from '../interface/homepage.interface';
import { homepageService } from '../service/homepage.service';

export class HomepageController {
  listPublic = asyncHandler(async (_req: Request, res: Response) => {
    const sections = await homepageService.listPublic();
    return ApiResponse.success(res, { sections }, 'OK');
  });

  listAdmin = asyncHandler(async (req: Request, res: Response) => {
    const result = await homepageService.listAdmin(req.query as Record<string, unknown>);
    return ApiResponse.success(res, { sections: result.items }, 'OK', 200, result.meta);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const section = await homepageService.getById(req.params.id);
    return ApiResponse.success(res, { section }, 'OK');
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const section = await homepageService.create(req.body, req.user!.id);
    return ApiResponse.created(res, { section }, 'Homepage section created');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const section = await homepageService.update(req.params.id, req.body, req.user!.id);
    return ApiResponse.success(res, { section }, 'Homepage section updated');
  });

  reorder = asyncHandler(async (req: Request, res: Response) => {
    const sections = await homepageService.reorder(req.body.items, req.user!.id);
    return ApiResponse.success(res, { sections }, 'Homepage sections reordered');
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    await homepageService.remove(req.params.id, req.user!.id);
    return ApiResponse.success(res, null, 'Homepage section deleted');
  });
}

export const homepageController = new HomepageController();

export const homepageListValidators = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('active').optional().isIn(['true', 'false']),
];

export const createHomepageValidators = [
  body('key').trim().notEmpty().isLength({ max: 80 }),
  body('type').isIn([...HOMEPAGE_SECTION_TYPES]),
  body('title').optional().isString().isLength({ max: 200 }),
  body('subtitle').optional().isString().isLength({ max: 200 }),
  body('description').optional().isString().isLength({ max: 2000 }),
  body('ctaText').optional().isString().isLength({ max: 80 }),
  body('ctaUrl').optional().isString().isLength({ max: 500 }),
  body('category').optional().isMongoId(),
  body('displayOrder').optional().isInt().toInt(),
  body('isActive').optional().isBoolean().toBoolean(),
];

export const updateHomepageValidators = [
  param('id').isMongoId(),
  body('key').optional().trim().notEmpty().isLength({ max: 80 }),
  body('type')
    .optional()
    .isIn([...HOMEPAGE_SECTION_TYPES]),
  body('isActive').optional().isBoolean().toBoolean(),
  body('displayOrder').optional().isInt().toInt(),
];

export const reorderHomepageValidators = [
  body('items').isArray({ min: 1 }),
  body('items.*.id').isMongoId(),
  body('items.*.displayOrder').isInt().toInt(),
];

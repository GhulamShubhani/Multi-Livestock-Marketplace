import type { Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import { ApiResponse } from '../../../utils/ApiResponse';
import { asyncHandler } from '../../../utils/asyncHandler';
import { cmsService } from '../service/cms.service';

export class CmsController {
  getBySlug = asyncHandler(async (req: Request, res: Response) => {
    const page = await cmsService.getPublishedBySlug(req.params.slug);
    return ApiResponse.success(res, { page }, 'OK');
  });

  listAdmin = asyncHandler(async (req: Request, res: Response) => {
    const result = await cmsService.listAdmin(req.query as Record<string, unknown>);
    return ApiResponse.success(res, { pages: result.items }, 'OK', 200, result.meta);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const page = await cmsService.getById(req.params.id);
    return ApiResponse.success(res, { page }, 'OK');
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const page = await cmsService.create(req.body, req.user!.id);
    return ApiResponse.created(res, { page }, 'Page created');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const page = await cmsService.update(req.params.id, req.body, req.user!.id);
    return ApiResponse.success(res, { page }, 'Page updated');
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    await cmsService.remove(req.params.id, req.user!.id);
    return ApiResponse.success(res, null, 'Page deleted');
  });
}

export const cmsController = new CmsController();

export const createCmsValidators = [
  body('title').trim().notEmpty().isLength({ max: 200 }),
  body('slug').optional().isString().isLength({ max: 200 }),
  body('content').trim().notEmpty(),
  body('status').optional().isIn(['draft', 'published']),
];

export const updateCmsValidators = [
  param('id').isMongoId(),
  body('title').optional().trim().notEmpty().isLength({ max: 200 }),
  body('content').optional().trim().notEmpty(),
  body('status').optional().isIn(['draft', 'published']),
];

export const listCmsValidators = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('status').optional().isIn(['draft', 'published']),
];

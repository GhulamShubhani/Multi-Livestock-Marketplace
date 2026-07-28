import type { Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import { ApiResponse } from '../../../utils/ApiResponse';
import { asyncHandler } from '../../../utils/asyncHandler';
import { bannerService } from '../service/banner.service';

export class BannerController {
  listPublic = asyncHandler(async (req: Request, res: Response) => {
    const banners = await bannerService.listPublic(
      typeof req.query.placement === 'string' ? req.query.placement : undefined,
    );
    return ApiResponse.success(res, { banners }, 'OK');
  });

  listAdmin = asyncHandler(async (req: Request, res: Response) => {
    const result = await bannerService.listAdmin(req.query as Record<string, unknown>);
    return ApiResponse.success(res, { banners: result.items }, 'OK', 200, result.meta);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const banner = await bannerService.getById(req.params.id);
    return ApiResponse.success(res, { banner }, 'OK');
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const banner = await bannerService.create(req.body, req.user!.id);
    return ApiResponse.created(res, { banner }, 'Banner created');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const banner = await bannerService.update(req.params.id, req.body, req.user!.id);
    return ApiResponse.success(res, { banner }, 'Banner updated');
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    await bannerService.remove(req.params.id, req.user!.id);
    return ApiResponse.success(res, null, 'Banner deleted');
  });
}

export const bannerController = new BannerController();

export const createBannerValidators = [
  body('title').trim().notEmpty().isLength({ max: 200 }),
  body('image').isObject(),
  body('image.url').isURL(),
  body('image.publicId').isString().notEmpty(),
  body('placement').isIn(['home_hero', 'home_secondary', 'sidebar']),
  body('linkUrl').optional().isURL(),
  body('sortOrder').optional().isInt().toInt(),
  body('isActive').optional().isBoolean().toBoolean(),
];

export const updateBannerValidators = [
  param('id').isMongoId(),
  body('title').optional().trim().notEmpty().isLength({ max: 200 }),
  body('placement').optional().isIn(['home_hero', 'home_secondary', 'sidebar']),
  body('isActive').optional().isBoolean().toBoolean(),
];

export const listBannerValidators = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('placement').optional().isIn(['home_hero', 'home_secondary', 'sidebar']),
];

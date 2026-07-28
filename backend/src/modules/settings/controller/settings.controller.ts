import type { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { ApiResponse } from '../../../utils/ApiResponse';
import { asyncHandler } from '../../../utils/asyncHandler';
import { settingsService } from '../service/settings.service';

export class SettingsController {
  getPublic = asyncHandler(async (req: Request, res: Response) => {
    const settings = await settingsService.getPublic(req.params.key);
    return ApiResponse.success(res, { settings }, 'OK');
  });

  listAdmin = asyncHandler(async (_req: Request, res: Response) => {
    const settings = await settingsService.listAdmin();
    return ApiResponse.success(res, { settings }, 'OK');
  });

  getAdmin = asyncHandler(async (req: Request, res: Response) => {
    const settings = await settingsService.getAdmin(req.params.key);
    return ApiResponse.success(res, { settings }, 'OK');
  });

  upsert = asyncHandler(async (req: Request, res: Response) => {
    const settings = await settingsService.upsert(req.params.key, req.body.value, req.user!.id);
    return ApiResponse.success(res, { settings }, 'Settings saved');
  });
}

export const settingsController = new SettingsController();

export const settingsKeyParam = [
  param('key').trim().notEmpty().isLength({ max: 60 }).matches(/^[a-z0-9_-]+$/i),
];

export const upsertSettingsValidators = [
  ...settingsKeyParam,
  body('value').isObject().withMessage('value must be an object'),
];

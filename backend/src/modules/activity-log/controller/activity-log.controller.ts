import type { Request, Response } from 'express';
import { query } from 'express-validator';
import { ApiResponse } from '../../../utils/ApiResponse';
import { asyncHandler } from '../../../utils/asyncHandler';
import { activityLogService } from '../service/activity-log.service';

export class ActivityLogController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const result = await activityLogService.list(req.query as Record<string, unknown>);
    return ApiResponse.success(res, { logs: result.items }, 'OK', 200, result.meta);
  });
}

export const activityLogController = new ActivityLogController();

export const listActivityLogValidators = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('module').optional().isString().isLength({ max: 80 }),
  query('action').optional().isString().isLength({ max: 120 }),
  query('severity').optional().isIn(['info', 'warn', 'critical']),
  query('actor').optional().isMongoId(),
  query('q').optional().isString().isLength({ max: 100 }),
];

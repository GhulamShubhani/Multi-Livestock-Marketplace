import type { Request, Response } from 'express';
import { query } from 'express-validator';
import { ApiResponse } from '../../../utils/ApiResponse';
import { asyncHandler } from '../../../utils/asyncHandler';
import { dashboardService } from '../service/dashboard.service';

export class DashboardController {
  overview = asyncHandler(async (_req: Request, res: Response) => {
    const data = await dashboardService.overview();
    return ApiResponse.success(res, data, 'OK');
  });

  sales = asyncHandler(async (req: Request, res: Response) => {
    const data = await dashboardService.sales(req.query as Record<string, unknown>);
    return ApiResponse.success(res, data, 'OK');
  });

  inventory = asyncHandler(async (_req: Request, res: Response) => {
    const data = await dashboardService.inventory();
    return ApiResponse.success(res, data, 'OK');
  });
}

export const dashboardController = new DashboardController();

export const salesQueryValidators = [
  query('days').optional().isInt({ min: 1, max: 90 }).toInt(),
];

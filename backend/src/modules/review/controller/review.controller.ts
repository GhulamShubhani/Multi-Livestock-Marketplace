import type { Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import { PERMISSIONS } from '../../../constants/auth';
import { ApiResponse } from '../../../utils/ApiResponse';
import { asyncHandler } from '../../../utils/asyncHandler';
import { reviewService } from '../service/review.service';

export class ReviewController {
  listPublic = asyncHandler(async (req: Request, res: Response) => {
    const result = await reviewService.listPublic(req.query as Record<string, unknown>);
    return ApiResponse.success(res, { reviews: result.items }, 'OK', 200, result.meta);
  });

  listAdmin = asyncHandler(async (req: Request, res: Response) => {
    const result = await reviewService.listAdmin(req.query as Record<string, unknown>);
    return ApiResponse.success(res, { reviews: result.items }, 'OK', 200, result.meta);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const review = await reviewService.create(req.user!.id, req.body);
    return ApiResponse.created(res, { review }, 'Review submitted');
  });

  moderate = asyncHandler(async (req: Request, res: Response) => {
    const review = await reviewService.moderate(req.params.id, req.body.status, req.user!.id);
    return ApiResponse.success(res, { review }, 'Review moderated');
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const isAdmin =
      req.user!.permissions.includes(PERMISSIONS.REVIEWS_DELETE) ||
      req.user!.role === 'super_admin' ||
      req.user!.role === 'admin';
    await reviewService.remove(req.params.id, req.user!.id, isAdmin);
    return ApiResponse.success(res, null, 'Review deleted');
  });
}

export const reviewController = new ReviewController();

export const listReviewValidators = [
  query('listingId').optional().isMongoId(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('status').optional().isIn(['pending', 'approved', 'rejected']),
];

export const createReviewValidators = [
  body('listingId').isMongoId(),
  body('rating').isInt({ min: 1, max: 5 }).toInt(),
  body('title').optional().isString().isLength({ max: 120 }),
  body('body').optional().isString().isLength({ max: 2000 }),
  body('orderId').optional().isMongoId(),
];

export const moderateReviewValidators = [
  param('id').isMongoId(),
  body('status').isIn(['pending', 'approved', 'rejected']),
];

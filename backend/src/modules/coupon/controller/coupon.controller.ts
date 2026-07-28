import type { Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import { ApiResponse } from '../../../utils/ApiResponse';
import { asyncHandler } from '../../../utils/asyncHandler';
import { couponService } from '../service/coupon.service';

export class CouponController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const result = await couponService.list(req.query as Record<string, unknown>);
    return ApiResponse.success(res, { coupons: result.items }, 'OK', 200, result.meta);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const coupon = await couponService.create(req.body, req.user!.id);
    return ApiResponse.created(res, { coupon }, 'Coupon created');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const coupon = await couponService.update(req.params.id, req.body, req.user!.id);
    return ApiResponse.success(res, { coupon }, 'Coupon updated');
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    await couponService.remove(req.params.id, req.user!.id);
    return ApiResponse.success(res, null, 'Coupon deleted');
  });

  validate = asyncHandler(async (req: Request, res: Response) => {
    const result = await couponService.validateForOrder(
      req.body.code,
      Number(req.body.subtotal),
      req.body.catIds ?? [],
      req.body.categoryIds ?? [],
    );
    return ApiResponse.success(
      res,
      {
        code: result.coupon.code,
        type: result.coupon.type,
        value: result.coupon.value,
        discount: result.discount,
      },
      'Coupon valid',
    );
  });
}

export const couponController = new CouponController();

export const createCouponValidators = [
  body('code').trim().notEmpty().isLength({ min: 3, max: 40 }),
  body('type').isIn(['percent', 'fixed']),
  body('value').isFloat({ gt: 0 }),
  body('minOrderAmount').optional().isInt({ min: 0 }).toInt(),
  body('maxDiscount').optional().isInt({ min: 0 }).toInt(),
  body('usageLimit').optional().isInt({ min: 1 }).toInt(),
  body('isActive').optional().isBoolean().toBoolean(),
];

export const updateCouponValidators = [
  param('id').isMongoId(),
  body('code').optional().trim().notEmpty().isLength({ min: 3, max: 40 }),
  body('type').optional().isIn(['percent', 'fixed']),
  body('value').optional().isFloat({ gt: 0 }),
  body('isActive').optional().isBoolean().toBoolean(),
];

export const validateCouponValidators = [
  body('code').trim().notEmpty(),
  body('subtotal').isInt({ min: 0 }).toInt(),
  body('catIds').optional().isArray(),
  body('categoryIds').optional().isArray(),
];

export const listCouponValidators = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

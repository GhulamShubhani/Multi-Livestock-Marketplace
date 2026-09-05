import type { Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import { ApiResponse } from '../../../utils/ApiResponse';
import { asyncHandler } from '../../../utils/asyncHandler';
import { sellerService } from '../service/seller.service';

export class SellerController {
  listPublic = asyncHandler(async (req: Request, res: Response) => {
    const result = await sellerService.listPublic(req.query as Record<string, unknown>);
    return ApiResponse.success(res, { sellers: result.items }, 'OK', 200, result.meta);
  });

  listAdmin = asyncHandler(async (req: Request, res: Response) => {
    const result = await sellerService.listAdmin(req.query as Record<string, unknown>);
    return ApiResponse.success(res, { sellers: result.items }, 'OK', 200, result.meta);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const seller = await sellerService.getById(req.params.id);
    return ApiResponse.success(res, { seller }, 'OK');
  });

  getMine = asyncHandler(async (req: Request, res: Response) => {
    const seller = await sellerService.getMine(req.user!.id);
    return ApiResponse.success(res, { seller }, 'OK');
  });

  upsertMine = asyncHandler(async (req: Request, res: Response) => {
    const seller = await sellerService.upsertMine(req.user!.id, req.body);
    return ApiResponse.success(res, { seller }, 'Seller profile saved');
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const seller = await sellerService.create(req.body, req.user!.id);
    return ApiResponse.created(res, { seller }, 'Seller created');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const seller = await sellerService.update(req.params.id, req.body, req.user!.id);
    return ApiResponse.success(res, { seller }, 'Seller updated');
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    await sellerService.remove(req.params.id, req.user!.id);
    return ApiResponse.success(res, null, 'Seller deleted');
  });
}

export const sellerController = new SellerController();

export const sellerListValidators = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('q').optional().isString().isLength({ max: 100 }),
  query('verificationStatus').optional().isIn(['unverified', 'pending', 'verified', 'rejected']),
  query('active').optional().isIn(['true', 'false']),
];

export const createSellerValidators = [
  body('businessName').trim().notEmpty().isLength({ max: 160 }),
  body('userId').optional().isMongoId(),
  body('sellerType')
    .optional()
    .isIn(['individual', 'farmer', 'breeder', 'farm', 'dealer', 'business']),
  body('yearsOfExperience').optional().isInt({ min: 0, max: 100 }).toInt(),
  body('whatsapp').optional().isString().isLength({ max: 20 }),
  body('phone').optional().isString().isLength({ max: 20 }),
  body('bio').optional().isString().isLength({ max: 2000 }),
  body('isActive').optional().isBoolean().toBoolean(),
];

export const updateSellerValidators = [
  param('id').isMongoId(),
  body('businessName').optional().trim().notEmpty().isLength({ max: 160 }),
  body('sellerType')
    .optional()
    .isIn(['individual', 'farmer', 'breeder', 'farm', 'dealer', 'business']),
  body('verificationStatus').optional().isIn(['unverified', 'pending', 'verified', 'rejected']),
  body('isActive').optional().isBoolean().toBoolean(),
];

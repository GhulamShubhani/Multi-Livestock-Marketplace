import type { Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import { ApiResponse } from '../../../utils/ApiResponse';
import { asyncHandler } from '../../../utils/asyncHandler';
import { listingService } from '../service/listing.service';

export class ListingController {
  listPublic = asyncHandler(async (req: Request, res: Response) => {
    const result = await listingService.listPublic(req.query as Record<string, unknown>);
    return ApiResponse.success(res, { listings: result.items }, 'OK', 200, result.meta);
  });

  listAdmin = asyncHandler(async (req: Request, res: Response) => {
    const result = await listingService.listAdmin(req.query as Record<string, unknown>);
    return ApiResponse.success(res, { listings: result.items }, 'OK', 200, result.meta);
  });

  getBySlug = asyncHandler(async (req: Request, res: Response) => {
    const listing = await listingService.getBySlug(req.params.slug, true);
    return ApiResponse.success(res, { listing }, 'OK');
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const listing = await listingService.getById(req.params.id);
    return ApiResponse.success(res, { listing }, 'OK');
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const listing = await listingService.create(req.body, req.user!.id);
    return ApiResponse.created(res, { listing }, 'Listing created');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const listing = await listingService.update(req.params.id, req.body, req.user!.id);
    return ApiResponse.success(res, { listing }, 'Listing updated');
  });

  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const listing = await listingService.updateStatus(
      req.params.id,
      req.body.availabilityStatus ?? req.body.status,
      req.user!.id,
    );
    return ApiResponse.success(res, { listing }, 'Listing status updated');
  });

  verify = asyncHandler(async (req: Request, res: Response) => {
    const listing = await listingService.verify(
      req.params.id,
      req.body.verificationStatus,
      req.user!.id,
    );
    return ApiResponse.success(res, { listing }, 'Listing verification updated');
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    await listingService.remove(req.params.id, req.user!.id);
    return ApiResponse.success(res, null, 'Listing deleted');
  });
}

export const listingController = new ListingController();

export const listingListValidators = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('q').optional().isString().isLength({ max: 100 }),
  query('breed').optional().isMongoId(),
  query('category').optional().isString().isLength({ max: 80 }),
  query('categorySlug').optional().isString().isLength({ max: 80 }),
  query('seller').optional().isMongoId(),
  query('gender').optional().isIn(['male', 'female', 'unknown']),
  query('featured').optional().isIn(['true', 'false']),
  query('minPrice').optional().isInt({ min: 0 }).toInt(),
  query('maxPrice').optional().isInt({ min: 0 }).toInt(),
  query('sort').optional().isString(),
  query('state').optional().isString().isLength({ max: 80 }),
  query('city').optional().isString().isLength({ max: 80 }),
  query('status').optional().isIn(['draft', 'available', 'reserved', 'sold', 'archived']),
  query('availabilityStatus')
    .optional()
    .isIn(['draft', 'available', 'reserved', 'sold', 'archived']),
  query('verificationStatus').optional().isIn(['unverified', 'pending', 'verified', 'rejected']),
];

export const createListingValidators = [
  body('title').trim().notEmpty().isLength({ max: 160 }),
  body('slug').optional().isString().isLength({ max: 180 }),
  body('description').trim().notEmpty().isLength({ max: 10000 }),
  body('shortDescription').optional().isString().isLength({ max: 500 }),
  body('category').isMongoId().withMessage('Valid category id required'),
  body('subcategory').optional().isMongoId(),
  body('breed').optional().isMongoId(),
  body('price').isInt({ min: 0 }).withMessage('Price must be integer minor units').toInt(),
  body('negotiable').optional().isBoolean().toBoolean(),
  body('currency').optional().isLength({ min: 3, max: 3 }),
  body('seller').optional().isMongoId(),
  body('sellerMobile').optional().isString().isLength({ max: 20 }),
  body('sellerWhatsApp').optional().isString().isLength({ max: 20 }),
  body('location').isObject(),
  body('location.country').trim().notEmpty().isLength({ max: 80 }),
  body('location.state').trim().notEmpty().isLength({ max: 80 }),
  body('location.city').trim().notEmpty().isLength({ max: 80 }),
  body('location.district').optional().isString().isLength({ max: 80 }),
  body('location.village').optional().isString().isLength({ max: 80 }),
  body('location.area').optional().isString().isLength({ max: 80 }),
  body('location.pincode').optional().isString().isLength({ max: 20 }),
  body('ageMonths').optional().isInt({ min: 0, max: 600 }).toInt(),
  body('gender').optional().isIn(['male', 'female', 'unknown']),
  body('weight').optional().isFloat({ min: 0 }).toFloat(),
  body('healthStatus').optional().isString().isLength({ max: 120 }),
  body('vaccinationStatus').optional().isString().isLength({ max: 120 }),
  body('availabilityStatus')
    .optional()
    .isIn(['draft', 'available', 'reserved', 'sold', 'archived']),
  body('verificationStatus').optional().isIn(['unverified', 'pending', 'verified', 'rejected']),
  body('featured').optional().isBoolean().toBoolean(),
  body('premium').optional().isBoolean().toBoolean(),
  body('isActive').optional().isBoolean().toBoolean(),
  body('images').optional().isArray({ max: 10 }),
  body('images.*.url').optional().isString().notEmpty(),
  body('images.*.publicId').optional().isString().notEmpty(),
  body('videos').optional().isArray({ max: 5 }),
  body('videos.*.url').optional().isString().notEmpty(),
  body('videos.*.publicId').optional().isString().notEmpty(),
];

export const updateListingValidators = [
  param('id').isMongoId(),
  body('title').optional().trim().notEmpty().isLength({ max: 160 }),
  body('description').optional().trim().notEmpty().isLength({ max: 10000 }),
  body('category').optional().isMongoId(),
  body('breed').optional().isMongoId(),
  body('price').optional().isInt({ min: 0 }).toInt(),
  body('availabilityStatus')
    .optional()
    .isIn(['draft', 'available', 'reserved', 'sold', 'archived']),
  body('featured').optional().isBoolean().toBoolean(),
  body('images').optional().isArray({ max: 10 }),
  body('videos').optional().isArray({ max: 5 }),
];

export const updateListingStatusValidators = [
  param('id').isMongoId(),
  body('availabilityStatus')
    .optional()
    .isIn(['draft', 'available', 'reserved', 'sold', 'archived']),
  body('status').optional().isIn(['draft', 'available', 'reserved', 'sold', 'archived']),
];

export const verifyListingValidators = [
  param('id').isMongoId(),
  body('verificationStatus').isIn(['unverified', 'pending', 'verified', 'rejected']),
];

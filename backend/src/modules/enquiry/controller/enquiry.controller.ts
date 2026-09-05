import type { Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import { ApiResponse } from '../../../utils/ApiResponse';
import { asyncHandler } from '../../../utils/asyncHandler';
import { enquiryService } from '../service/enquiry.service';

export class EnquiryController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const enquiry = await enquiryService.create(req.body, req.user?.id);
    return ApiResponse.created(res, { enquiry }, 'Enquiry submitted');
  });

  listMine = asyncHandler(async (req: Request, res: Response) => {
    const result = await enquiryService.listMine(
      req.user!.id,
      req.query as Record<string, unknown>,
    );
    return ApiResponse.success(res, { enquiries: result.items }, 'OK', 200, result.meta);
  });

  listSeller = asyncHandler(async (req: Request, res: Response) => {
    const result = await enquiryService.listSeller(
      req.user!.id,
      req.query as Record<string, unknown>,
    );
    return ApiResponse.success(res, { enquiries: result.items }, 'OK', 200, result.meta);
  });

  listAdmin = asyncHandler(async (req: Request, res: Response) => {
    const result = await enquiryService.listAdmin(req.query as Record<string, unknown>);
    return ApiResponse.success(res, { enquiries: result.items }, 'OK', 200, result.meta);
  });

  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const enquiry = await enquiryService.updateStatus(req.params.id, req.body.status, req.user!.id);
    return ApiResponse.success(res, { enquiry }, 'Enquiry status updated');
  });
}

export const enquiryController = new EnquiryController();

export const createEnquiryValidators = [
  body('listingId').isMongoId(),
  body('message').trim().notEmpty().isLength({ max: 2000 }),
  body('contactMethod').isIn(['call', 'whatsapp', 'enquiry', 'view_mobile']),
  body('buyerName').optional().isString().isLength({ max: 120 }),
  body('buyerPhone').optional().isString().isLength({ max: 20 }),
  body('buyerEmail').optional().isEmail(),
];

export const listEnquiryValidators = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('status')
    .optional()
    .isIn(['new', 'contacted', 'interested', 'negotiating', 'sold', 'closed']),
  query('listingId').optional().isMongoId(),
];

export const updateEnquiryStatusValidators = [
  param('id').isMongoId(),
  body('status').isIn(['new', 'contacted', 'interested', 'negotiating', 'sold', 'closed']),
];

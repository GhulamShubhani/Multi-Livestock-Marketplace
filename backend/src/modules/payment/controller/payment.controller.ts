import type { Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import { ApiResponse } from '../../../utils/ApiResponse';
import { asyncHandler } from '../../../utils/asyncHandler';
import { paymentService } from '../service/payment.service';

export class PaymentController {
  methods = asyncHandler(async (_req: Request, res: Response) => {
    const methods = await paymentService.getPublicMethods();
    return ApiResponse.success(res, { methods }, 'OK');
  });

  submit = asyncHandler(async (req: Request, res: Response) => {
    const payment = await paymentService.submitProof(req.user!.id, req.body, req.ip);
    return ApiResponse.success(res, { payment }, 'Payment proof submitted');
  });

  listMine = asyncHandler(async (req: Request, res: Response) => {
    const result = await paymentService.listMine(
      req.user!.id,
      req.query as Record<string, unknown>,
    );
    return ApiResponse.success(res, { payments: result.items }, 'OK', 200, result.meta);
  });

  listAdmin = asyncHandler(async (req: Request, res: Response) => {
    const result = await paymentService.listAdmin(req.query as Record<string, unknown>);
    return ApiResponse.success(res, { payments: result.items }, 'OK', 200, result.meta);
  });

  verify = asyncHandler(async (req: Request, res: Response) => {
    const payment = await paymentService.verify(req.params.id, req.user!.id, req.body.status, {
      adminNotes: req.body.adminNotes,
      rejectedReason: req.body.rejectedReason,
    });
    return ApiResponse.success(res, { payment }, 'Payment verification updated');
  });

  refund = asyncHandler(async (req: Request, res: Response) => {
    const payment = await paymentService.refund(req.params.id, req.user!.id, req.body.reason);
    return ApiResponse.success(res, { payment }, 'Payment marked refunded');
  });
}

export const paymentController = new PaymentController();

export const submitPaymentValidators = [
  body('orderId').isMongoId().withMessage('Valid orderId is required'),
  body('provider').optional().isIn(['upi', 'bank_transfer', 'cod', 'mobile']),
  body('method').optional().isString().isLength({ max: 80 }),
  body('transactionId').optional().isString().isLength({ max: 120 }),
  body('utr').optional().isString().isLength({ max: 120 }),
  body('paymentDate').optional().isISO8601(),
  body('screenshot').optional().isObject(),
  body('screenshot.url').optional().isString().notEmpty(),
  body('screenshot.publicId').optional().isString().notEmpty(),
];

export const verifyPaymentValidators = [
  param('id').isMongoId(),
  body('status').isIn(['verified', 'rejected']),
  body('adminNotes').optional().isString().isLength({ max: 1000 }),
  body('rejectedReason').optional().isString().isLength({ max: 500 }),
];

export const refundValidators = [
  param('id').isMongoId(),
  body('reason').optional().isString().isLength({ max: 200 }),
];

export const listPaymentValidators = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('status')
    .optional()
    .isIn(['pending', 'submitted', 'under_verification', 'verified', 'rejected', 'refunded']),
];

import type { NextFunction, Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import { ApiResponse } from '../../../utils/ApiResponse';
import { asyncHandler } from '../../../utils/asyncHandler';
import { paymentService } from '../service/payment.service';

export class PaymentController {
  checkoutSession = asyncHandler(async (req: Request, res: Response) => {
    const data = await paymentService.createCheckoutSession(req.user!.id, req.body.orderId, req.ip);
    return ApiResponse.created(res, data, 'Checkout session created');
  });

  paymentIntent = asyncHandler(async (req: Request, res: Response) => {
    const data = await paymentService.createPaymentIntent(req.user!.id, req.body.orderId, req.ip);
    return ApiResponse.created(res, data, 'Payment intent created');
  });

  mockComplete = asyncHandler(async (req: Request, res: Response) => {
    const payment = await paymentService.mockComplete(req.body.sessionId, req.user!.id);
    return ApiResponse.success(res, { payment }, 'Mock payment completed');
  });

  listMine = asyncHandler(async (req: Request, res: Response) => {
    const result = await paymentService.listMine(req.user!.id, req.query as Record<string, unknown>);
    return ApiResponse.success(res, { payments: result.items }, 'OK', 200, result.meta);
  });

  listAdmin = asyncHandler(async (req: Request, res: Response) => {
    const result = await paymentService.listAdmin(req.query as Record<string, unknown>);
    return ApiResponse.success(res, { payments: result.items }, 'OK', 200, result.meta);
  });

  refund = asyncHandler(async (req: Request, res: Response) => {
    const payment = await paymentService.refund(
      req.params.id,
      req.user!.id,
      req.body.amount,
      req.body.reason,
    );
    return ApiResponse.success(res, { payment }, 'Refund processed');
  });

  webhook = asyncHandler(async (req: Request, res: Response) => {
    const signature = req.header('stripe-signature') ?? undefined;
    const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
    if (!rawBody) {
      return ApiResponse.fail(res, 'Raw body required for webhook', 400);
    }
    const result = await paymentService.handleWebhook(rawBody, signature);
    return res.status(200).json(result);
  });
}

export const paymentController = new PaymentController();

/** Express middleware for Stripe webhook — uses raw body. */
export async function stripeWebhookHandler(req: Request, res: Response, next: NextFunction) {
  try {
    (req as Request & { rawBody?: Buffer }).rawBody = req.body as Buffer;
    const signature = req.header('stripe-signature') ?? undefined;
    const result = await paymentService.handleWebhook(req.body as Buffer, signature);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export const orderIdBodyValidators = [
  body('orderId').isMongoId().withMessage('Valid orderId is required'),
];

export const mockCompleteValidators = [
  body('sessionId').isString().notEmpty(),
];

export const refundValidators = [
  param('id').isMongoId(),
  body('amount').optional().isInt({ min: 1 }).toInt(),
  body('reason').optional().isString().isLength({ max: 200 }),
];

export const listPaymentValidators = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

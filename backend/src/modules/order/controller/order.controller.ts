import type { Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import { ApiResponse } from '../../../utils/ApiResponse';
import { asyncHandler } from '../../../utils/asyncHandler';
import { orderService } from '../service/order.service';

const addressShape = [
  body('shippingAddress.line1').trim().notEmpty(),
  body('shippingAddress.city').trim().notEmpty(),
  body('shippingAddress.postalCode').trim().notEmpty(),
  body('shippingAddress.country').trim().notEmpty(),
];

export class OrderController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.create(req.user!.id, req.body, req.ip);
    return ApiResponse.created(res, { order }, 'Order created');
  });

  listMine = asyncHandler(async (req: Request, res: Response) => {
    const result = await orderService.listMine(req.user!.id, req.query as Record<string, unknown>);
    return ApiResponse.success(res, { orders: result.items }, 'OK', 200, result.meta);
  });

  getMine = asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.getMine(req.user!.id, req.params.id);
    return ApiResponse.success(res, { order }, 'OK');
  });

  cancelMine = asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.cancel(req.params.id, req.user!.id, false);
    return ApiResponse.success(res, { order }, 'Order cancelled');
  });

  listAdmin = asyncHandler(async (req: Request, res: Response) => {
    const result = await orderService.listAdmin(req.query as Record<string, unknown>);
    return ApiResponse.success(res, { orders: result.items }, 'OK', 200, result.meta);
  });

  getAdmin = asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.getAdmin(req.params.id);
    return ApiResponse.success(res, { order }, 'OK');
  });

  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.updateStatus(req.params.id, req.body.status, req.user!.id);
    return ApiResponse.success(res, { order }, 'Order status updated');
  });

  cancelAdmin = asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.cancel(req.params.id, req.user!.id, true);
    return ApiResponse.success(res, { order }, 'Order cancelled');
  });
}

export const orderController = new OrderController();

export const createOrderValidators = [
  body('items').isArray({ min: 1 }),
  body('items.*.listingId').isMongoId(),
  body('items.*.quantity').isInt({ min: 1, max: 10 }).toInt(),
  body('couponCode').optional().isString().isLength({ max: 40 }),
  body('notes').optional().isString().isLength({ max: 500 }),
  ...addressShape,
];

export const orderIdParam = [param('id').isMongoId()];
export const listOrderValidators = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];
export const updateOrderStatusValidators = [
  ...orderIdParam,
  body('status').isIn([
    'pending',
    'paid',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded',
  ]),
];

import type { Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import { ApiResponse } from '../../../utils/ApiResponse';
import { asyncHandler } from '../../../utils/asyncHandler';
import { notificationService } from '../service/notification.service';

export class NotificationController {
  listMine = asyncHandler(async (req: Request, res: Response) => {
    const result = await notificationService.listMine(req.user!.id, req.query as Record<string, unknown>);
    return ApiResponse.success(
      res,
      { notifications: result.items, unreadCount: result.unreadCount },
      'OK',
      200,
      result.meta,
    );
  });

  markRead = asyncHandler(async (req: Request, res: Response) => {
    const notification = await notificationService.markRead(req.user!.id, req.params.id);
    return ApiResponse.success(res, { notification }, 'Marked as read');
  });

  markAllRead = asyncHandler(async (req: Request, res: Response) => {
    const result = await notificationService.markAllRead(req.user!.id);
    return ApiResponse.success(res, result, 'All notifications marked as read');
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const notification = await notificationService.createForUser(req.user!.id, req.body);
    return ApiResponse.created(res, { notification }, 'Notification created');
  });

  broadcast = asyncHandler(async (req: Request, res: Response) => {
    const result = await notificationService.broadcast(req.user!.id, req.body);
    return ApiResponse.created(res, result, 'Broadcast sent');
  });
}

export const notificationController = new NotificationController();

export const listNotificationValidators = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('unread').optional().isIn(['true', 'false']),
];

export const createNotificationValidators = [
  body('userId').isMongoId(),
  body('title').trim().notEmpty().isLength({ max: 200 }),
  body('body').trim().notEmpty().isLength({ max: 2000 }),
  body('type').optional().isString().isLength({ max: 80 }),
  body('channel').optional().isIn(['in_app', 'email']),
];

export const broadcastValidators = [
  body('title').trim().notEmpty().isLength({ max: 200 }),
  body('body').trim().notEmpty().isLength({ max: 2000 }),
  body('type').optional().isString().isLength({ max: 80 }),
  body('userIds').optional().isArray(),
  body('userIds.*').optional().isMongoId(),
  body('roleNames').optional().isArray(),
  body('roleNames.*').optional().isString(),
];

export const notificationIdParam = [param('id').isMongoId()];

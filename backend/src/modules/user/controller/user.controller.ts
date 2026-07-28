import type { Request, Response } from 'express';
import { ApiResponse } from '../../../utils/ApiResponse';
import { asyncHandler } from '../../../utils/asyncHandler';
import { userService } from '../service/user.service';

export class UserController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const result = await userService.list(req.query as Record<string, unknown>);
    return ApiResponse.success(res, { users: result.items }, 'OK', 200, result.meta);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.getById(req.params.id);
    return ApiResponse.success(res, { user }, 'OK');
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.create(req.body, req.user!.id, req.ip);
    return ApiResponse.created(res, { user }, 'User created');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.update(req.params.id, req.body, req.user!.id, req.ip);
    return ApiResponse.success(res, { user }, 'User updated');
  });

  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.updateStatus(req.params.id, req.body, req.user!.id, req.ip);
    return ApiResponse.success(res, { user }, 'User status updated');
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    await userService.remove(req.params.id, req.user!.id, req.ip);
    return ApiResponse.success(res, null, 'User deleted');
  });

  listSessions = asyncHandler(async (req: Request, res: Response) => {
    const sessions = await userService.listSessions(req.params.id);
    return ApiResponse.success(res, { sessions }, 'OK');
  });

  revokeAllSessions = asyncHandler(async (req: Request, res: Response) => {
    await userService.revokeAllSessions(req.params.id, req.user!.id, req.ip);
    return ApiResponse.success(res, null, 'All sessions revoked');
  });

  revokeSession = asyncHandler(async (req: Request, res: Response) => {
    await userService.revokeSession(req.params.id, req.params.sessionId, req.user!.id, req.ip);
    return ApiResponse.success(res, null, 'Session revoked');
  });
}

export const userController = new UserController();

import type { Request, Response } from 'express';
import { clearAuthCookies } from '../../../utils/cookies';
import { ApiResponse } from '../../../utils/ApiResponse';
import { asyncHandler } from '../../../utils/asyncHandler';
import { profileService } from '../service/profile.service';

export class ProfileController {
  get = asyncHandler(async (req: Request, res: Response) => {
    const profile = await profileService.getProfile(req.user!.id);
    return ApiResponse.success(res, { profile }, 'OK');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const profile = await profileService.updateProfile(req.user!.id, req.body, req.ip);
    return ApiResponse.success(res, { profile }, 'Profile updated');
  });

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    await profileService.changePassword(req.user!.id, req.body, req.ip);
    clearAuthCookies(res);
    return ApiResponse.success(res, null, 'Password changed. Please sign in again.');
  });

  listAddresses = asyncHandler(async (req: Request, res: Response) => {
    const addresses = await profileService.listAddresses(req.user!.id);
    return ApiResponse.success(res, { addresses }, 'OK');
  });

  addAddress = asyncHandler(async (req: Request, res: Response) => {
    const addresses = await profileService.addAddress(req.user!.id, req.body);
    return ApiResponse.created(res, { addresses }, 'Address added');
  });

  updateAddress = asyncHandler(async (req: Request, res: Response) => {
    const addresses = await profileService.updateAddress(req.user!.id, req.params.addressId, req.body);
    return ApiResponse.success(res, { addresses }, 'Address updated');
  });

  deleteAddress = asyncHandler(async (req: Request, res: Response) => {
    const addresses = await profileService.deleteAddress(req.user!.id, req.params.addressId);
    return ApiResponse.success(res, { addresses }, 'Address deleted');
  });

  listSessions = asyncHandler(async (req: Request, res: Response) => {
    const sessions = await profileService.listSessions(req.user!.id);
    return ApiResponse.success(res, { sessions }, 'OK');
  });

  revokeSession = asyncHandler(async (req: Request, res: Response) => {
    await profileService.revokeSession(req.user!.id, req.params.sessionId);
    return ApiResponse.success(res, null, 'Session revoked');
  });

  revokeAllSessions = asyncHandler(async (req: Request, res: Response) => {
    await profileService.revokeAllSessions(req.user!.id);
    clearAuthCookies(res);
    return ApiResponse.success(res, null, 'All sessions revoked');
  });
}

export const profileController = new ProfileController();

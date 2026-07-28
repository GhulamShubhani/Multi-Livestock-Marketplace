import type { Request, Response } from 'express';
import { COOKIE_NAMES } from '../../../constants/auth';
import { ApiResponse } from '../../../utils/ApiResponse';
import { clearAuthCookies, setAuthCookies } from '../../../utils/cookies';
import { asyncHandler } from '../../../utils/asyncHandler';
import { authService } from '../service/auth.service';
import type { AuthRequestContext } from '../dto/auth.dto';

function ctx(req: Request): AuthRequestContext {
  return {
    ip: req.ip,
    userAgent: req.get('user-agent') ?? undefined,
  };
}

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body, ctx(req));
    setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken, result.tokens.csrfToken);
    return ApiResponse.created(res, { user: result.user }, 'Registration successful');
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body, ctx(req));
    setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken, result.tokens.csrfToken);
    return ApiResponse.success(res, { user: result.user }, 'Login successful');
  });

  refresh = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.[COOKIE_NAMES.REFRESH] as string | undefined;
    const result = await authService.refresh(refreshToken, ctx(req));
    setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken, result.tokens.csrfToken);
    return ApiResponse.success(res, { user: result.user }, 'Token refreshed');
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.[COOKIE_NAMES.REFRESH] as string | undefined;
    await authService.logout(refreshToken, req.user!.id, ctx(req));
    clearAuthCookies(res);
    return ApiResponse.success(res, null, 'Logged out');
  });

  logoutAll = asyncHandler(async (req: Request, res: Response) => {
    await authService.logoutAll(req.user!.id, ctx(req));
    clearAuthCookies(res);
    return ApiResponse.success(res, null, 'Logged out from all devices');
  });

  me = asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.me(req.user!.id);
    return ApiResponse.success(res, { user }, 'OK');
  });

  verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.verifyEmail(req.body, ctx(req));
    return ApiResponse.success(res, { user }, 'Email verified');
  });

  resendVerification = asyncHandler(async (req: Request, res: Response) => {
    await authService.resendVerification(req.body.email, ctx(req));
    return ApiResponse.success(res, null, 'If the account exists, a verification email was sent');
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    await authService.forgotPassword(req.body, ctx(req));
    return ApiResponse.success(res, null, 'If the account exists, a reset email was sent');
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    await authService.resetPassword(req.body, ctx(req));
    clearAuthCookies(res);
    return ApiResponse.success(res, null, 'Password reset successful');
  });

  sendOtp = asyncHandler(async (req: Request, res: Response) => {
    await authService.sendOtp(req.body, ctx(req));
    return ApiResponse.success(res, null, 'If the account exists, an OTP was sent');
  });

  verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const data = await authService.verifyOtp(req.body, ctx(req));
    return ApiResponse.success(res, data, 'OTP verified');
  });
}

export const authController = new AuthController();

import type { NextFunction, Request, Response } from 'express';
import { COOKIE_NAMES } from '../constants/auth';
import { AppError } from '../utils/AppError';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Double-submit CSRF: browser must send X-CSRF-Token matching csrf_token cookie.
 * Stripe webhooks and other signed endpoints should skip this middleware.
 */
export function csrfProtection(req: Request, _res: Response, next: NextFunction): void {
  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  const cookieToken = req.cookies?.[COOKIE_NAMES.CSRF] as string | undefined;
  const headerToken = req.header('X-CSRF-Token');

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    next(AppError.forbidden('Invalid CSRF token'));
    return;
  }

  next();
}

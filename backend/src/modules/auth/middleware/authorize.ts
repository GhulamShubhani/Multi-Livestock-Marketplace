import type { RequestHandler } from 'express';
import { ROLES } from '../../../constants/auth';
import { AppError } from '../../../utils/AppError';

export function authorize(...requiredPermissions: string[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      next(AppError.unauthorized('Authentication required'));
      return;
    }

    if (req.user.role === ROLES.SUPER_ADMIN) {
      next();
      return;
    }

    const missing = requiredPermissions.filter((p) => !req.user!.permissions.includes(p));
    if (missing.length > 0) {
      next(AppError.forbidden('Insufficient permissions'));
      return;
    }

    next();
  };
}

export function requireRoles(...roles: string[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      next(AppError.unauthorized('Authentication required'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(AppError.forbidden('Insufficient role'));
      return;
    }

    next();
  };
}

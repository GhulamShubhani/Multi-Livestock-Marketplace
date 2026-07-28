import type { RequestHandler } from 'express';
import { AppError } from '../../../utils/AppError';

/** Enforce email verification for sensitive customer actions (e.g. checkout). */
export const requireEmailVerified: RequestHandler = (req, _res, next) => {
  if (!req.user) {
    next(AppError.unauthorized('Authentication required'));
    return;
  }

  if (!req.user.isEmailVerified) {
    next(AppError.forbidden('Email verification required'));
    return;
  }

  next();
};

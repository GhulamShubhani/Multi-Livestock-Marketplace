import type { RequestHandler } from 'express';
import { COOKIE_NAMES } from '../../../constants/auth';
import { AppError } from '../../../utils/AppError';
import { verifyAccessToken } from '../../../utils/token';
import { userRepository } from '../../user/repository/user.repository';
import { extractRoleAndPermissions } from '../helpers/user.mapper';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  permissions: string[];
  isEmailVerified: boolean;
  status: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthenticatedUser;
  }
}

export const authenticate: RequestHandler = async (req, _res, next) => {
  try {
    const token = req.cookies?.[COOKIE_NAMES.ACCESS] as string | undefined;
    if (!token) {
      next(AppError.unauthorized('Authentication required'));
      return;
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      next(AppError.unauthorized('Invalid or expired access token'));
      return;
    }

    const user = await userRepository.findByIdWithRole(payload.sub);
    if (!user || user.status === 'banned' || user.status === 'inactive') {
      next(AppError.unauthorized('Authentication required'));
      return;
    }

    const { roleName, permissions } = extractRoleAndPermissions(user);
    req.user = {
      id: String(user._id),
      email: user.email,
      role: roleName,
      permissions,
      isEmailVerified: user.isEmailVerified,
      status: user.status,
    };

    next();
  } catch (error) {
    next(error);
  }
};

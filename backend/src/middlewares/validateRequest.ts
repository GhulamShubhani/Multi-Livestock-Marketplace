import type { NextFunction, Request, Response } from 'express';
import { validationResult, type ValidationChain } from 'express-validator';
import { AppError } from '../utils/AppError';

export function validateRequest(validations: ValidationChain[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const result = validationResult(req);
    if (result.isEmpty()) {
      next();
      return;
    }

    const errors = result.array().map((err) => ({
      field: 'path' in err ? String(err.path) : undefined,
      message: err.msg,
    }));

    next(AppError.badRequest('Validation failed', errors));
  };
}

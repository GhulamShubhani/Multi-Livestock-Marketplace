import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { isProduction } from '../config/env';
import { logger } from '../config/logger';
import { HTTP_STATUS } from '../constants/httpStatus';
import { AppError } from '../utils/AppError';
import { ApiResponse } from '../utils/ApiResponse';
import type { ApiErrorItem } from '../interfaces/api.interface';

function isDuplicateKeyError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code?: number }).code === 11000
  );
}

function mapMongooseValidation(err: mongoose.Error.ValidationError): AppError {
  const errors: ApiErrorItem[] = Object.values(err.errors).map((e) => ({
    field: e.path,
    message: e.message,
  }));
  return AppError.badRequest('Validation failed', errors);
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  let appError: AppError;

  if (err instanceof AppError) {
    appError = err;
  } else if (err instanceof mongoose.Error.ValidationError) {
    appError = mapMongooseValidation(err);
  } else if (err instanceof mongoose.Error.CastError) {
    appError = AppError.badRequest(`Invalid value for ${err.path}`);
  } else if (isDuplicateKeyError(err)) {
    appError = AppError.conflict('Duplicate key value');
  } else if (err instanceof Error && err.message.startsWith('CORS blocked')) {
    appError = AppError.forbidden(err.message);
  } else if (err instanceof SyntaxError) {
    appError = AppError.badRequest('Invalid JSON payload');
  } else {
    appError = AppError.internal();
  }

  const statusCode = appError.statusCode || HTTP_STATUS.INTERNAL_ERROR;
  const isOperational = appError.isOperational;

  logger.error('Request failed', {
    requestId: req.requestId,
    statusCode,
    message: err instanceof Error ? err.message : 'Unknown error',
    stack: !isProduction && err instanceof Error ? err.stack : undefined,
    path: req.originalUrl,
    method: req.method,
    isOperational,
  });

  const clientMessage =
    isProduction && !isOperational
      ? 'Something went wrong'
      : appError.message || 'Something went wrong';

  ApiResponse.fail(res, clientMessage, statusCode, appError.errors);
}

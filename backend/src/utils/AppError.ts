import { HTTP_STATUS, type HttpStatusCode } from '../constants/httpStatus';
import type { ApiErrorItem } from '../interfaces/api.interface';

export class AppError extends Error {
  public readonly statusCode: HttpStatusCode;
  public readonly isOperational: boolean;
  public readonly errors: ApiErrorItem[];

  constructor(
    message: string,
    statusCode: HttpStatusCode = HTTP_STATUS.INTERNAL_ERROR,
    errors: ApiErrorItem[] = [],
    isOperational = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace?.(this, this.constructor);
  }

  static badRequest(message: string, errors: ApiErrorItem[] = []): AppError {
    return new AppError(message, HTTP_STATUS.BAD_REQUEST, errors);
  }

  static unauthorized(message = 'Unauthorized'): AppError {
    return new AppError(message, HTTP_STATUS.UNAUTHORIZED);
  }

  static forbidden(message = 'Forbidden'): AppError {
    return new AppError(message, HTTP_STATUS.FORBIDDEN);
  }

  static notFound(message = 'Resource not found'): AppError {
    return new AppError(message, HTTP_STATUS.NOT_FOUND);
  }

  static conflict(message: string): AppError {
    return new AppError(message, HTTP_STATUS.CONFLICT);
  }

  static tooManyRequests(message = 'Too many requests'): AppError {
    return new AppError(message, HTTP_STATUS.TOO_MANY_REQUESTS);
  }

  static internal(message = 'Internal server error'): AppError {
    return new AppError(message, HTTP_STATUS.INTERNAL_ERROR, [], false);
  }
}

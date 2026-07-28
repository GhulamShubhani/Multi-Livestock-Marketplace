import type { Response } from 'express';
import type { ApiErrorItem, PaginationMeta } from '../interfaces/api.interface';
import { HTTP_STATUS } from '../constants/httpStatus';

export class ApiResponse {
  static success<T>(
    res: Response,
    data: T,
    message = 'OK',
    statusCode: number = HTTP_STATUS.OK,
    meta?: PaginationMeta,
  ): Response {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      errors: [],
      ...(meta ? { meta } : {}),
    });
  }

  static created<T>(res: Response, data: T, message = 'Created'): Response {
    return ApiResponse.success(res, data, message, HTTP_STATUS.CREATED);
  }

  static fail(
    res: Response,
    message: string,
    statusCode: number = HTTP_STATUS.BAD_REQUEST,
    errors: ApiErrorItem[] = [],
  ): Response {
    return res.status(statusCode).json({
      success: false,
      message,
      data: null,
      errors,
    });
  }
}

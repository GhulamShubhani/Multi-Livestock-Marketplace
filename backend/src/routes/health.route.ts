import { Router } from 'express';
import { env } from '../config/env';
import { getDatabaseStatus } from '../database/connection';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { HTTP_STATUS } from '../constants/httpStatus';

const healthRouter = Router();

healthRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const dbStatus = getDatabaseStatus();
    const healthy = dbStatus === 'connected';

    const payload = {
      status: healthy ? 'ok' : 'degraded',
      service: 'cat-marketplace-api',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: dbStatus,
    };

    return ApiResponse.success(
      res,
      payload,
      healthy ? 'Service healthy' : 'Service degraded',
      healthy ? HTTP_STATUS.OK : HTTP_STATUS.SERVICE_UNAVAILABLE,
    );
  }),
);

export default healthRouter;

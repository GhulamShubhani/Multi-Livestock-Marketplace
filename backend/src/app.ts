import express, { type Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import { env } from './config/env';
import { corsOptions } from './config/cors';
import { requestIdMiddleware } from './middlewares/requestId';
import { requestLogger } from './middlewares/requestLogger';
import { globalRateLimiter } from './middlewares/rateLimiter';
import { sanitizeInput } from './middlewares/sanitize';
import { notFoundHandler } from './middlewares/notFound';
import { errorHandler } from './middlewares/errorHandler';
import routes from './routes';

export function createApp(): Application {
  const app = express();

  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(requestIdMiddleware);
  app.use(requestLogger);

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.use(cors(corsOptions));
  app.use(compression());
  app.use(cookieParser());

  app.use(express.json({ limit: env.BODY_LIMIT }));
  app.use(express.urlencoded({ extended: true, limit: env.BODY_LIMIT }));

  app.use(
    mongoSanitize({
      replaceWith: '_',
      allowDots: false,
    }),
  );
  app.use(hpp());
  app.use(sanitizeInput);
  app.use(globalRateLimiter);

  app.use(env.API_PREFIX, routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

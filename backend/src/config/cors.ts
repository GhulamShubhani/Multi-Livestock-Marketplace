import cors from 'cors';
import { corsOrigins, isProduction } from './env';

export const corsOptions: cors.CorsOptions = {
  origin(origin, callback) {
    // Allow non-browser clients (Postman, server-to-server) with no Origin
    if (!origin) {
      callback(null, true);
      return;
    }

    if (corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Request-Id'],
  exposedHeaders: ['X-Request-Id'],
  maxAge: isProduction ? 86400 : undefined,
};

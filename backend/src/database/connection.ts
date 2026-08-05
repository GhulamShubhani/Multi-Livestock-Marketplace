import mongoose from 'mongoose';
import { env } from '../config/env';
import { logger } from '../config/logger';

declare global {
  // Cache across Vercel serverless warm invocations
  // eslint-disable-next-line no-var
  var __catMarketplaceMongo: Promise<typeof mongoose> | undefined;
}

export async function connectDatabase(): Promise<typeof mongoose> {
  mongoose.set('strictQuery', true);

  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!global.__catMarketplaceMongo) {
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connected');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error', { error: err.message });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    // Windows antivirus / SSL inspection often breaks Atlas TLS ("unable to verify the first certificate").
    const allowInvalidCerts = process.env.MONGODB_TLS_ALLOW_INVALID_CERTS === 'true';

    global.__catMarketplaceMongo = mongoose
      .connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 20_000,
        ...(allowInvalidCerts ? { tlsAllowInvalidCertificates: true } : {}),
      })
      .catch((error) => {
        global.__catMarketplaceMongo = undefined;
        const message = error instanceof Error ? error.message : String(error);
        const cause =
          error instanceof Error && 'cause' in error && error.cause instanceof Error
            ? error.cause.message
            : undefined;

        if (message.includes('whitelist') || cause?.includes('certificate')) {
          logger.error('MongoDB Atlas connection failed', {
            error: message,
            cause,
            hint: 'Real cause is often TLS cert verification (not IP whitelist). For local dev set MONGODB_TLS_ALLOW_INVALID_CERTS=true in backend/.env.',
          });
        }

        throw error;
      });
  }

  await global.__catMarketplaceMongo;
  return mongoose;
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.connection.close();
  global.__catMarketplaceMongo = undefined;
  logger.info('MongoDB connection closed');
}

export function getDatabaseStatus():
  'connected' | 'disconnected' | 'connecting' | 'disconnecting' | 'unknown' {
  switch (mongoose.connection.readyState) {
    case 0:
      return 'disconnected';
    case 1:
      return 'connected';
    case 2:
      return 'connecting';
    case 3:
      return 'disconnecting';
    default:
      return 'unknown';
  }
}

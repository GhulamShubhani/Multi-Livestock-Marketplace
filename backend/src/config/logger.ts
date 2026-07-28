import winston from 'winston';
import { env, isProduction } from './env';

const { combine, timestamp, errors, colorize, printf, json } = winston.format;

const consoleFormat = printf(({ level, message, timestamp: ts, stack, requestId, ...meta }) => {
  const rid = requestId ? ` [${requestId}]` : '';
  const rest = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  const base = `${ts} ${level}${rid}: ${stack || message}${rest}`;
  return base;
});

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  defaultMeta: { service: 'cat-marketplace-api' },
  format: combine(timestamp(), errors({ stack: true }), json()),
  transports: [
    new winston.transports.Console({
      format: isProduction
        ? combine(timestamp(), errors({ stack: true }), json())
        : combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), consoleFormat),
    }),
  ],
});

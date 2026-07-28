import type { NextFunction, Request, Response } from 'express';

const XSS_PATTERN = /[<>]/g;

function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.replace(XSS_PATTERN, '');
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value !== null && typeof value === 'object') {
    const input = value as Record<string, unknown>;
    const output: Record<string, unknown> = {};
    for (const key of Object.keys(input)) {
      output[key] = sanitizeValue(input[key]);
    }
    return output;
  }

  return value;
}

/**
 * Lightweight XSS stripping for request body.
 * Query/params are validated by express-validator per route.
 * CMS HTML will use an allowlist sanitiser in the CMS module.
 */
export function sanitizeInput(req: Request, _res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  next();
}

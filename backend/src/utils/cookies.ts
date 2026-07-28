import type { CookieOptions, Response } from 'express';
import { env } from '../config/env';
import { COOKIE_NAMES } from '../constants/auth';
import { parseDurationToMs } from './token';

function baseCookieOptions(maxAgeMs: number): CookieOptions {
  const options: CookieOptions = {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    path: '/',
    maxAge: maxAgeMs,
  };

  if (env.COOKIE_DOMAIN) {
    options.domain = env.COOKIE_DOMAIN;
  }

  return options;
}

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
  csrfToken: string,
): void {
  res.cookie(COOKIE_NAMES.ACCESS, accessToken, baseCookieOptions(parseDurationToMs(env.JWT_ACCESS_EXPIRES_IN)));
  res.cookie(COOKIE_NAMES.REFRESH, refreshToken, baseCookieOptions(parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN)));
  res.cookie(COOKIE_NAMES.CSRF, csrfToken, {
    ...baseCookieOptions(parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN)),
    httpOnly: false,
  });
}

export function clearAuthCookies(res: Response): void {
  const clearOpts: CookieOptions = {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    path: '/',
  };
  if (env.COOKIE_DOMAIN) {
    clearOpts.domain = env.COOKIE_DOMAIN;
  }

  res.clearCookie(COOKIE_NAMES.ACCESS, clearOpts);
  res.clearCookie(COOKIE_NAMES.REFRESH, clearOpts);
  res.clearCookie(COOKIE_NAMES.CSRF, { ...clearOpts, httpOnly: false });
}

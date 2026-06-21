import rateLimit from 'express-rate-limit';
import { RequestHandler } from 'express';

const isDev = process.env.NODE_ENV !== 'production';

// In development, use a passthrough middleware that does no rate limiting.
// In production, enforce strict limits.
const noopMiddleware: RequestHandler = (_req, _res, next) => next();

export const apiLimiter: RequestHandler = isDev
  ? noopMiddleware
  : rateLimit({
      windowMs: 60 * 1000,
      max: 100,
      message: { error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
    });

export const authLimiter: RequestHandler = isDev
  ? noopMiddleware
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 50,
      message: { error: { code: 'RATE_LIMITED', message: 'Too many login attempts' } },
    });

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AuthenticationError } from '../utils/errors.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  gmailConnected: boolean;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

export function authGuard(req: Request, _res: Response, next: NextFunction): void {
  try {
    const token =
      req.cookies?.token ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new AuthenticationError());
    }

    const payload = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;

    (req as AuthenticatedRequest).user = {
      id: payload.sub as string,
      email: payload.email as string,
      name: payload.name as string,
      gmailConnected: payload.gmail_connected as boolean,
    };

    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return next(error);
    }
    next(new AuthenticationError('Invalid or expired token'));
  }
}

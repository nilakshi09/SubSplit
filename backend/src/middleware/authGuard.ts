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
  console.log('--- AUTH GUARD INVOKED ---', req.originalUrl);
  try {
    const cookieToken = req.cookies?.token;
    const headerToken = req.headers.authorization?.replace('Bearer ', '');
    console.log('--- AUTH GUARD RECEIVED COOKIE? ---', !!cookieToken, 'length:', cookieToken?.length);
    console.log('--- AUTH GUARD RECEIVED HEADER? ---', !!headerToken);
    
    const token = cookieToken || headerToken;

    if (!token) {
      console.error('--- AUTH GUARD FAILURE ---', 'No token provided in cookies or headers');
      return next(new AuthenticationError());
    }

    const payload = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
    console.log('--- AUTH GUARD DECODED JWT? ---', true, 'sub:', payload.sub);

    (req as AuthenticatedRequest).user = {
      id: payload.sub as string,
      email: payload.email as string,
      name: payload.name as string,
      gmailConnected: payload.gmail_connected as boolean,
    };

    console.log('--- AUTH GUARD SUCCESS ---', 'user id:', payload.sub);
    next();
  } catch (error) {
    console.error('--- AUTH GUARD FAILURE ---', 'Token verification failed:', error);
    if (error instanceof AuthenticationError) {
      return next(error);
    }
    next(new AuthenticationError('Invalid or expired token'));
  }
}

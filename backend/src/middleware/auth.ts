import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase.js';

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach user to request
    (req as any).user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Authentication error' });
  }
}

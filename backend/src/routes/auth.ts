import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { getAuthUrl, exchangeCodeForTokens } from '../config/gmail.js';
import { encryptToken } from '../utils/encryption.js';
import { supabaseAdmin } from '../utils/supabase.js';
import { authGuard, AuthenticatedRequest } from '../middleware/authGuard.js';
import { AuthenticationError } from '../utils/errors.js';

export const authRoutes = Router();

// GET /api/auth/google
authRoutes.get('/google', (_req: Request, res: Response) => {
  const authUrl = getAuthUrl();
  res.redirect(authUrl);
});

// GET /api/auth/google/callback
authRoutes.get('/google/callback', async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const code = req.query.code as string;
    if (!code) throw new AuthenticationError('Missing authorization code');

    const { refresh_token, userInfo } = await exchangeCodeForTokens(code);

    const upsertData: Record<string, unknown> = {
      google_id: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name,
      avatar_url: userInfo.picture,
      gmail_connected: true,
      updated_at: new Date().toISOString(),
    };

    if (refresh_token) {
      upsertData.gmail_token_enc = encryptToken(refresh_token);
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .upsert(upsertData, { onConflict: 'google_id' })
      .select('id, email, name')
      .single();

    if (error || !user) throw new AuthenticationError('Failed to create or update user');

    const token = jwt.sign(
      { sub: user.id, email: user.email, name: user.name, gmail_connected: true },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRY as jwt.SignOptions['expiresIn'] },
    );

    // Redirect with token in URL — localStorage approach for cross-domain
    res.redirect(`${env.FRONTEND_URL}/auth/callback?token=${token}`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect(`${env.FRONTEND_URL}/login?error=auth_failed`);
  }
});

// POST /api/auth/logout
authRoutes.post('/logout', (_req: Request, res: Response) => {
  res.status(200).json({ message: 'Logged out successfully' });
});

// GET /api/auth/me
authRoutes.get('/me', authGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, name, avatar_url, gmail_connected, currency, onboarding_step')
      .eq('id', authenticatedReq.user.id)
      .single();

    if (error || !user) throw new AuthenticationError('User not found');

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatar_url,
      gmailConnected: user.gmail_connected,
      currency: user.currency,
      onboardingStep: user.onboarding_step,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/auth/gmail-access
authRoutes.delete('/gmail-access', authGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const { error } = await supabaseAdmin
      .from('users')
      .update({ gmail_token_enc: null, gmail_connected: false, updated_at: new Date().toISOString() })
      .eq('id', authenticatedReq.user.id);

    if (error) throw new AuthenticationError('Failed to revoke Gmail access');
    res.status(200).json({ message: 'Gmail access revoked' });
  } catch (error) {
    next(error);
  }
});

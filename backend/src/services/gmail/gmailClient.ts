import { google } from 'googleapis';
import { decryptToken } from '../../utils/encryption.js';
import { supabaseAdmin } from '../../utils/supabase.js';
import { env } from '../../config/env.js';

interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  payload: {
    headers: { name: string; value: string }[];
    body?: { data?: string };
    parts?: { mimeType: string; body: { data?: string } }[];
  };
  internalDate: string;
}

export async function getGmailClient(userId: string) {
  // 1. Fetch user from Supabase
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('gmail_token_enc, gmail_history_id')
    .eq('id', userId)
    .single();

  if (!user?.gmail_token_enc) throw new Error('Gmail not connected');

  // 2. Decrypt refresh token
  const refreshToken = decryptToken(user.gmail_token_enc);

  // 3. Create OAuth client
  const oauthClient = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI
  );
  oauthClient.setCredentials({ refresh_token: refreshToken });

  // 4. Return gmail instance
  return {
    gmail: google.gmail({ version: 'v1', auth: oauthClient }),
    historyId: user.gmail_history_id,
  };
}

export function extractEmailBody(message: GmailMessage): string {
  // Try direct body first
  if (message.payload.body?.data) {
    return Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
  }
  // Try parts (multipart emails)
  if (message.payload.parts) {
    for (const part of message.payload.parts) {
      if (part.mimeType === 'text/plain' && part.body.data) {
        return Buffer.from(part.body.data, 'base64').toString('utf-8');
      }
    }
    // Fallback to HTML part
    for (const part of message.payload.parts) {
      if (part.mimeType === 'text/html' && part.body.data) {
        const html = Buffer.from(part.body.data, 'base64').toString('utf-8');
        // Strip HTML tags for text extraction
        return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      }
    }
  }
  return message.snippet || '';
}

export function getHeader(message: GmailMessage, headerName: string): string {
  return message.payload.headers.find(
    h => h.name.toLowerCase() === headerName.toLowerCase()
  )?.value || '';
}

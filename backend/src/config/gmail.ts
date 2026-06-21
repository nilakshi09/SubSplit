import { google } from 'googleapis';
import { env } from './env.js';

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

export const oauthClient = new google.auth.OAuth2(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_REDIRECT_URI,
);

export function getAuthUrl(): string {
  return oauthClient.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
  });
}

export async function exchangeCodeForTokens(code: string) {
  const { tokens } = await oauthClient.getToken(code);

  // Create a per-request client to avoid mutating the shared singleton.
  // If two users authenticate concurrently, mutating the shared client
  // would cause one user's credentials to overwrite the other's.
  const tempClient = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI,
  );
  tempClient.setCredentials(tokens);

  const oauth2 = google.oauth2({ version: 'v2', auth: tempClient });
  const { data: userInfo } = await oauth2.userinfo.get();

  return {
    access_token: tokens.access_token ?? '',
    refresh_token: tokens.refresh_token ?? '',
    userInfo: {
      email: userInfo.email!,
      name: userInfo.name ?? userInfo.email!,
      picture: userInfo.picture ?? null,
      sub: userInfo.id!,
    },
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<string> {
  const tempClient = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI,
  );
  tempClient.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await tempClient.refreshAccessToken();
  return credentials.access_token!;
}

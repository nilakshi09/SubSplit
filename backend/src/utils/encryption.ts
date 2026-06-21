import CryptoJS from 'crypto-js';
import { env } from '../config/env.js';

export function encryptToken(token: string): string {
  return CryptoJS.AES.encrypt(token, env.TOKEN_ENCRYPTION_KEY).toString();
}

export function decryptToken(encrypted: string): string {
  const bytes = CryptoJS.AES.decrypt(encrypted, env.TOKEN_ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

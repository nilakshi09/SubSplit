// Generates a stable fingerprint for subscription deduplication

import crypto from 'crypto';

/**
 * Generate a deterministic fingerprint for a subscription.
 * Uses service name, currency, and bucketed amount to allow minor price fluctuations.
 * Returns a 16-char hex string (first 64 bits of SHA-256).
 */
export function generateFingerprint(
  serviceName: string,
  amount: number,
  currency: string,
): string {
  const normalizedName = serviceName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const amountBucket = Math.round(amount / 0.5) * 0.5;
  const input = `${normalizedName}:${currency}:${amountBucket}`;

  return crypto.createHash('sha256').update(input).digest('hex').substring(0, 16);
}

/**
 * Email Parser Utility
 * 
 * Parses billing confirmation emails to extract subscription
 * charge information (service name, amount, date).
 */

export interface ParsedCharge {
  service: string;
  amount: number;
  currency: string;
  date: string;
  raw: string;
}

/**
 * Known subscription patterns for email matching.
 */
const KNOWN_PATTERNS = [
  { regex: /netflix/i, service: 'Netflix' },
  { regex: /spotify/i, service: 'Spotify' },
  { regex: /chatgpt|openai/i, service: 'ChatGPT Plus' },
  { regex: /amazon\s*prime/i, service: 'Amazon Prime' },
  { regex: /icloud/i, service: 'iCloud' },
  { regex: /youtube\s*premium/i, service: 'YouTube Premium' },
];

/**
 * Parse an email subject/body for subscription charge info.
 */
export function parseChargeEmail(subject: string, body: string): ParsedCharge | null {
  for (const pattern of KNOWN_PATTERNS) {
    if (pattern.regex.test(subject) || pattern.regex.test(body)) {
      const amountMatch = body.match(/\$([\d,]+\.\d{2})/);
      if (amountMatch) {
        return {
          service: pattern.service,
          amount: parseFloat(amountMatch[1].replace(',', '')),
          currency: 'USD',
          date: new Date().toISOString(),
          raw: subject,
        };
      }
    }
  }
  return null;
}

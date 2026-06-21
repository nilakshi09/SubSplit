// Extracts monetary amounts from subscription email bodies

import type { SenderRule } from './senderRegistry.js';

export interface ExtractedAmount {
  value: number;
  currency: string;
  raw: string;
  confidence: number;
}

interface CurrencyPattern {
  pattern: RegExp;
  currency: string;
}

const GENERIC_CURRENCY_PATTERNS: CurrencyPattern[] = [
  { pattern: /(?:₹|Rs\.?|INR)\s*([\d,]+\.?\d{0,2})/gi, currency: 'INR' },
  { pattern: /\$\s*([\d,]+\.?\d{0,2})/gi, currency: 'USD' },
  { pattern: /€\s*([\d,]+\.?\d{0,2})/gi, currency: 'EUR' },
  { pattern: /£\s*([\d,]+\.?\d{0,2})/gi, currency: 'GBP' },
];

const MIN_AMOUNT = 1;
const MAX_AMOUNT = 100000;

function parseAmount(raw: string): number {
  return parseFloat(raw.replace(/,/g, ''));
}

function isValidAmount(value: number): boolean {
  return !isNaN(value) && value >= MIN_AMOUNT && value <= MAX_AMOUNT;
}

function extractWithPatterns(
  body: string,
  patterns: RegExp[],
  confidence: number,
  currency?: string,
): ExtractedAmount | null {
  for (const pattern of patterns) {
    // Reset lastIndex for global regexes
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(body)) !== null) {
      const rawValue = match[1];
      if (!rawValue) continue;

      const value = parseAmount(rawValue);
      if (!isValidAmount(value)) continue;

      return {
        value,
        currency: currency ?? detectCurrencyFromMatch(match[0]),
        raw: match[0],
        confidence,
      };
    }
  }
  return null;
}

function detectCurrencyFromMatch(matchStr: string): string {
  if (/₹|Rs\.?|INR/i.test(matchStr)) return 'INR';
  if (/\$/.test(matchStr)) return 'USD';
  if (/€/.test(matchStr)) return 'EUR';
  if (/£/.test(matchStr)) return 'GBP';
  return 'USD';
}

/**
 * Extract a monetary amount from an email body.
 * Uses sender-specific patterns first (higher confidence), then generic currency patterns.
 */
export function extractAmount(
  emailBody: string,
  senderRule?: SenderRule | null,
): ExtractedAmount | null {
  // 1. Try sender-specific patterns first (high confidence)
  if (senderRule) {
    const senderResult = extractWithPatterns(emailBody, senderRule.amountPatterns, 0.95);
    if (senderResult) return senderResult;
  }

  // 2. Try generic currency patterns (lower confidence)
  for (const { pattern, currency } of GENERIC_CURRENCY_PATTERNS) {
    const result = extractWithPatterns(emailBody, [pattern], 0.80, currency);
    if (result) return result;
  }

  return null;
}

/**
 * Email Parser — orchestrates the subscription parsing pipeline.
 *
 * Coordinates sender matching, amount extraction, date extraction,
 * and fingerprint generation to produce a fully parsed subscription
 * from a raw email.
 */

import { findSenderRule } from '../services/parser/senderRegistry.js';
import { extractAmount } from '../services/parser/amountExtractor.js';
import { extractBillingDate } from '../services/parser/dateExtractor.js';
import { generateFingerprint } from '../services/parser/fingerprintGenerator.js';

export interface ParsedSubscription {
  serviceName: string;
  serviceIcon: string;
  category: string;
  amount: number;
  currency: string;
  billingDate: Date;
  frequency: 'monthly' | 'quarterly' | 'semi_annual' | 'annual' | 'unknown';
  senderEmail: string;
  emailSubject: string;
  emailMessageId: string;
  fingerprint: string;
  confidence: number;
}

/**
 * Parse a raw email into a structured subscription record.
 * Returns null if the email doesn't match a known subscription sender
 * or if no amount can be extracted.
 */
export function parseEmail(
  emailBody: string,
  senderEmail: string,
  subject: string,
  emailDate: Date,
  messageId: string,
): ParsedSubscription | null {
  const senderRule = findSenderRule(senderEmail, subject);
  if (!senderRule) return null;

  const extractedAmount = extractAmount(emailBody, senderRule);
  if (!extractedAmount) return null;

  const billingDate = extractBillingDate(emailBody, emailDate);
  const fingerprint = generateFingerprint(
    senderRule.serviceName,
    extractedAmount.value,
    extractedAmount.currency,
  );

  return {
    serviceName: senderRule.serviceName,
    serviceIcon: senderRule.serviceIcon,
    category: senderRule.category,
    amount: extractedAmount.value,
    currency: extractedAmount.currency,
    billingDate,
    frequency: 'unknown',
    senderEmail,
    emailSubject: subject,
    emailMessageId: messageId,
    fingerprint,
    confidence: extractedAmount.confidence,
  };
}

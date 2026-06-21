// Extracts billing dates and detects subscription frequency from charge history

const DATE_PATTERNS: RegExp[] = [
  /(?:charged|billed|payment date)[:\s]+([A-Za-z]+ \d{1,2},? \d{4})/gi,
  /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g,
];

/**
 * Extract the billing date from an email body.
 * Falls back to the email's received date if no parseable date is found in the body.
 */
export function extractBillingDate(emailBody: string, emailDate: Date): Date {
  for (const pattern of DATE_PATTERNS) {
    pattern.lastIndex = 0;
    const match = pattern.exec(emailBody);

    if (match && match[1]) {
      const parsed = new Date(match[1]);

      // Validate the parsed date is real (not NaN) and within a reasonable range
      if (!isNaN(parsed.getTime())) {
        const year = parsed.getFullYear();
        if (year >= 2000 && year <= 2100) {
          return parsed;
        }
      }
    }
  }

  return emailDate;
}

export type Frequency = 'monthly' | 'quarterly' | 'semi_annual' | 'annual' | 'unknown';

/**
 * Detect subscription frequency from a list of charge dates.
 * Calculates average interval between sorted charges and maps to known billing cycles.
 */
export function detectFrequency(chargeHistory: Date[]): Frequency {
  if (chargeHistory.length < 2) return 'unknown';

  // Sort chronologically
  const sorted = [...chargeHistory].sort((a, b) => a.getTime() - b.getTime());

  // Calculate intervals between consecutive charges (in days)
  const intervals: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const diffMs = sorted[i].getTime() - sorted[i - 1].getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    intervals.push(diffDays);
  }

  const avgDays = intervals.reduce((sum, d) => sum + d, 0) / intervals.length;

  if (avgDays >= 25 && avgDays <= 35) return 'monthly';
  if (avgDays >= 85 && avgDays <= 95) return 'quarterly';
  if (avgDays >= 175 && avgDays <= 190) return 'semi_annual';
  if (avgDays >= 360 && avgDays <= 370) return 'annual';

  return 'unknown';
}

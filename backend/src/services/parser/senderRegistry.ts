// Subscription sender registry — maps known services to email patterns for detection

export interface SenderRule {
  serviceName: string;
  serviceIcon: string;
  category: 'streaming' | 'music' | 'cloud' | 'productivity' | 'ai' | 'gaming' | 'other';
  senderPatterns: string[];
  subjectPatterns: string[];
  amountPatterns: RegExp[];
}

const DEFAULT_SUBJECT_PATTERNS = [
  'receipt',
  'invoice',
  'payment',
  'billing',
  'subscription',
  'charge',
  'renewal',
  'order confirmation',
  'payment confirmation',
];

const DEFAULT_AMOUNT_PATTERNS: RegExp[] = [
  /(?:₹|Rs\.?|INR)\s*([\d,]+\.?\d{0,2})/gi,
  /\$\s*([\d,]+\.?\d{0,2})/gi,
  /(?:Total|Amount|Charged|Billed)[:\s]+(?:₹|Rs\.?|\$)?\s*([\d,]+\.?\d{0,2})/gi,
];

function rule(
  serviceName: string,
  serviceIcon: string,
  category: SenderRule['category'],
  senderPatterns: string[],
): SenderRule {
  return {
    serviceName,
    serviceIcon,
    category,
    senderPatterns,
    subjectPatterns: DEFAULT_SUBJECT_PATTERNS,
    amountPatterns: DEFAULT_AMOUNT_PATTERNS,
  };
}

export const SENDER_REGISTRY: SenderRule[] = [
  // Streaming
  rule('Netflix', '🎬', 'streaming', ['info@account.netflix.com', 'netflix.com']),
  rule('YouTube Premium', '▶️', 'streaming', ['no-reply@accounts.google.com', 'youtube.com']),
  rule('Amazon Prime', '📦', 'streaming', ['auto-confirm@amazon.in', 'amazon.com']),
  rule('Disney+', '🏰', 'streaming', ['disneyplus.com']),
  rule('HBO Max', '🎭', 'streaming', ['hbomax.com']),
  rule('Crunchyroll', '⛩️', 'streaming', ['crunchyroll.com']),
  rule('JioCinema', '🎞️', 'streaming', ['jiocinema.com']),
  rule('Hotstar', '⭐', 'streaming', ['hotstar.com', 'disneyplus.com']),
  rule('SonyLIV', '📺', 'streaming', ['sonyliv.com']),
  rule('Zee5', '🎪', 'streaming', ['zee5.com']),
  rule('MX Player', '▶️', 'streaming', ['mxplayer.in']),

  // Music
  rule('Spotify', '🎵', 'music', ['no-reply@spotify.com']),
  rule('JioSaavn', '🎶', 'music', ['jiosaavn.com']),

  // Cloud
  rule('Apple/iCloud', '🍎', 'cloud', ['no_reply@email.apple.com']),
  rule('Google One', '☁️', 'cloud', ['no-reply@accounts.google.com']),
  rule('Dropbox', '📁', 'cloud', ['no-reply@dropbox.com']),

  // AI
  rule('ChatGPT Plus', '🤖', 'ai', ['noreply@tm.openai.com']),

  // Productivity
  rule('Microsoft 365', '💼', 'productivity', ['microsoft.com', 'microsoftemail.com']),
  rule('Adobe Creative Cloud', '🎨', 'productivity', ['adobe.com']),
  rule('Notion', '📝', 'productivity', ['notion.so']),
  rule('Figma', '🎯', 'productivity', ['figma.com']),
  rule('Canva Pro', '🖼️', 'productivity', ['canva.com']),
  rule('Zoom', '📹', 'productivity', ['no-reply@zoom.us']),
  rule('GitHub', '🐙', 'productivity', ['github.com', 'noreply@github.com']),
  rule('Vercel', '▲', 'productivity', ['vercel.com']),
  rule('Slack', '💬', 'productivity', ['slack.com']),
  rule('Linear', '📐', 'productivity', ['linear.app']),
  rule('Grammarly', '✍️', 'productivity', ['grammarly.com']),
  rule('LinkedIn Premium', '💼', 'productivity', ['linkedin.com']),

  // Other
  rule('Duolingo', '🦉', 'other', ['duolingo.com']),
  rule('Headspace', '🧘', 'other', ['headspace.com']),
  rule('Calm', '😌', 'other', ['calm.com']),
  rule('Strava', '🏃', 'other', ['strava.com']),
  rule('Coursera', '🎓', 'other', ['coursera.org']),
  rule('Udemy', '📚', 'other', ['udemy.com']),
];

/**
 * Find the first matching sender rule for a given email sender and subject line.
 * Checks sender domain/address patterns and subject keyword patterns (case-insensitive).
 */
export function findSenderRule(senderEmail: string, subject: string): SenderRule | null {
  const lowerSender = senderEmail.toLowerCase();
  const lowerSubject = subject.toLowerCase();

  // 1. First try sender domain match (existing logic)
  for (const rule of SENDER_REGISTRY) {
    for (const pattern of rule.senderPatterns) {
      if (lowerSender.includes(pattern.toLowerCase())) {
        return rule;
      }
    }
  }

  // 2. Fallback: match by subject keywords + amount presence
  const billingKeywords = [
    'payment confirmation', 'payment receipt', 'billing confirmation',
    'invoice', 'subscription renewed', 'charge confirmation',
    'order confirmation', 'receipt', 'payment successful',
    'amount charged', 'billing statement', 'your payment',
  ];

  const hasBillingKeyword = billingKeywords.some(kw => lowerSubject.includes(kw));

  if (hasBillingKeyword) {
    // Try to detect service name from subject
    for (const rule of SENDER_REGISTRY) {
      if (lowerSubject.includes(rule.serviceName.toLowerCase())) {
        return rule;
      }
    }

    // Return a generic rule if billing keyword found but no service match
    return {
      serviceName: extractServiceFromSubject(subject),
      serviceIcon: '💳',
      category: 'other',
      senderPatterns: [],
      subjectPatterns: billingKeywords,
      amountPatterns: [
        /(?:₹|Rs\.?|INR)\s*([\d,]+\.?\d{0,2})/gi,
        /\$\s*([\d,]+\.?\d{0,2})/gi,
        /(?:amount|charged|total|paid)[:\s]+(?:₹|Rs\.?|\$|INR)?\s*([\d,]+\.?\d{0,2})/gi,
      ],
    };
  }

  return null;
}

// Helper: extract service name from subject line
function extractServiceFromSubject(subject: string): string {
  // Remove common billing words to find service name
  const cleaned = subject
    .replace(/payment|confirmation|receipt|invoice|billing|charge|your|renewal|renewed/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  return cleaned.length > 2 ? cleaned.substring(0, 30) : 'Unknown Service';
}

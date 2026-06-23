import { getGmailClient, extractEmailBody, getHeader } from './gmailClient.js';
import { parseEmail, ParsedSubscription } from '../../utils/emailParser.js';
import { supabaseAdmin } from '../../utils/supabase.js';

const BILLING_QUERY = [
  'subject:(receipt OR invoice OR payment OR billing OR subscription OR charge OR renewal OR "payment confirmation" OR "order confirmation" OR netflix OR spotify OR amazon OR "amount charged" OR "thank you for your payment")',
  'NOT subject:(shipping OR delivered OR "out for delivery")',
  'newer_than:6m',
].join(' ');

export async function scanInbox(userId: string): Promise<{
  detected: ParsedSubscription[];
  total: number;
  errors: number;
}> {
  const { gmail } = await getGmailClient(userId);
  const detected: ParsedSubscription[] = [];
  let errors = 0;

  // 1. Search for billing emails
  const listResponse = await gmail.users.messages.list({
    userId: 'me',
    q: BILLING_QUERY,
    maxResults: 100,
  });

  const messages = listResponse.data.messages || [];

  // 2. Process each message
  for (const msg of messages) {
    try {
      const fullMsg = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id!,
        format: 'full',
      });

      const message = fullMsg.data as any;
      const body = extractEmailBody(message);
      const senderEmail = getHeader(message, 'from');
      const subject = getHeader(message, 'subject');
      const emailDate = new Date(parseInt(message.internalDate));
      const messageId = message.id;

      const parsed = parseEmail(body, senderEmail, subject, emailDate, messageId);

      if (parsed) {
        detected.push(parsed);
      }
    } catch {
      errors++;
    }
  }

  // 3. Deduplicate by fingerprint (keep highest confidence)
  const deduped = deduplicateByFingerprint(detected);

  // 4. Save as pending subscriptions (skip already existing)
  await savePendingSubscriptions(userId, deduped);

  return { detected: deduped, total: messages.length, errors };
}

function deduplicateByFingerprint(parsed: ParsedSubscription[]): ParsedSubscription[] {
  const map = new Map<string, ParsedSubscription>();
  for (const p of parsed) {
    const existing = map.get(p.fingerprint);
    if (!existing || p.confidence > existing.confidence) {
      map.set(p.fingerprint, p);
    }
  }
  return Array.from(map.values());
}

async function savePendingSubscriptions(userId: string, parsed: ParsedSubscription[]) {
  for (const p of parsed) {
    // Check if already exists
    const { data: existing } = await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('owner_id', userId)
      .eq('fingerprint', p.fingerprint)
      .single();

    if (existing) continue; // Skip duplicates

    await supabaseAdmin.from('subscriptions').insert({
      owner_id: userId,
      service_name: p.serviceName,
      service_icon: p.serviceIcon,
      amount: p.amount,
      currency: p.currency,
      frequency: p.frequency,
      billing_day: p.billingDate.getDate(),
      fingerprint: p.fingerprint,
      sender_email: p.senderEmail,
      status: 'pending',
      confidence: p.confidence,
      last_charged_at: p.billingDate.toISOString(),
    });
  }
}

export async function processNewEmail(
  userId: string,
  messageId: string
): Promise<ParsedSubscription | null> {
  const { gmail } = await getGmailClient(userId);

  const fullMsg = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'full',
  });

  const message = fullMsg.data as any;
  const body = extractEmailBody(message);
  const senderEmail = getHeader(message, 'from');
  const subject = getHeader(message, 'subject');
  const emailDate = new Date(parseInt(message.internalDate));

  const parsed = parseEmail(body, senderEmail, subject, emailDate, messageId);
  if (!parsed) return null;

  // Check if matches existing subscription
  const { data: existing } = await supabaseAdmin
    .from('subscriptions')
    .select('id, status, amount')
    .eq('owner_id', userId)
    .eq('fingerprint', parsed.fingerprint)
    .single();

  if (existing && existing.status === 'active') {
    // Record charge event
    await supabaseAdmin.from('charge_events').insert({
      subscription_id: existing.id,
      amount: parsed.amount,
      currency: parsed.currency,
      charged_at: parsed.billingDate.toISOString(),
      email_message_id: messageId,
      email_subject: parsed.emailSubject,
      email_sender: parsed.senderEmail,
      fingerprint_match: parsed.confidence,
      auto_matched: true,
      processed: false,
    });

    // Update last_charged_at and charge_count
    await supabaseAdmin
      .from('subscriptions')
      .update({
        last_charged_at: parsed.billingDate.toISOString(),
        charge_count: existing.amount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
  } else if (!existing) {
    // New subscription detected
    await savePendingSubscriptions(userId, [parsed]);
  }

  return parsed;
}

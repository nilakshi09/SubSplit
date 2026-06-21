import { supabaseAdmin } from '../../utils/supabase.js';
import { updateGroupBalances } from '../balance/balanceUpdater.js';
import { ParsedSubscription } from '../../utils/emailParser.js';
import { generateFingerprint } from '../parser/fingerprintGenerator.js';

/**
 * Called when a new billing email is matched to an EXISTING active subscription.
 * This is the bridge between Phase 2 (email detection) and Phase 4 (balance updates).
 */
export async function processMatchedCharge(
  userId: string,
  parsed: ParsedSubscription
): Promise<{ chargeEventId: string; balancesUpdated: boolean }> {
  
  // 1. Find the matching active subscription
  const { data: subscription } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('owner_id', userId)
    .eq('fingerprint', parsed.fingerprint)
    .eq('status', 'active')
    .single();

  if (!subscription) {
    throw new Error('No matching active subscription found');
  }

  // 2. Check for price change (>5% difference)
  const priceChanged = Math.abs(subscription.amount - parsed.amount) / subscription.amount > 0.05;

  // 3. Record the charge event
  const { data: chargeEvent, error } = await supabaseAdmin
    .from('charge_events')
    .insert({
      subscription_id: subscription.id,
      amount: parsed.amount,
      currency: parsed.currency,
      charged_at: parsed.billingDate.toISOString(),
      email_message_id: parsed.emailMessageId,
      email_subject: parsed.emailSubject,
      email_sender: parsed.senderEmail,
      fingerprint_match: parsed.confidence,
      auto_matched: true,
      processed: false,
    })
    .select()
    .single();

  if (error || !chargeEvent) {
    throw new Error('Failed to record charge event');
  }

  // 4. Update subscription tracking
  await supabaseAdmin
    .from('subscriptions')
    .update({
      last_charged_at: parsed.billingDate.toISOString(),
      charge_count: (subscription.charge_count || 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscription.id);

  // 5. If price changed significantly, DON'T auto-update balances - flag for review
  if (priceChanged) {
    return { chargeEventId: chargeEvent.id, balancesUpdated: false };
  }

  // 6. Update balances for all group members (if assigned to a group)
  if (subscription.group_id) {
    await updateGroupBalances(subscription, chargeEvent);
    return { chargeEventId: chargeEvent.id, balancesUpdated: true };
  }

  return { chargeEventId: chargeEvent.id, balancesUpdated: false };
}

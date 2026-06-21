import { supabaseAdmin } from '../../utils/supabase.js';
import { calculateSplit } from '../groups/groupService.js';

interface ChargeEvent {
  id: string;
  subscription_id: string;
  amount: number;
  currency: string;
  charged_at: string;
}

interface Subscription {
  id: string;
  owner_id: string;
  group_id: string | null;
  service_name: string;
  split_type: 'equal' | 'percentage' | 'fixed';
}

export async function updateGroupBalances(
  subscription: Subscription,
  chargeEvent: ChargeEvent
): Promise<{ userId: string; amount: number }[]> {
  
  if (!subscription.group_id) {
    return []; // No group assigned, no balances to update
  }

  // 1. Get split rules for this subscription
  const { data: splitRules } = await supabaseAdmin
    .from('split_rules')
    .select('user_id, value, is_excluded')
    .eq('subscription_id', subscription.id);

  if (!splitRules || splitRules.length === 0) {
    // No split rules configured yet - skip balance update
    return [];
  }

  // 2. Calculate each member's share using existing calculateSplit
  const splits = await calculateSplit(
    chargeEvent.amount,
    subscription.split_type,
    subscription.owner_id,
    splitRules.map(r => ({
      userId: r.user_id,
      value: r.value,
      isExcluded: r.is_excluded,
    }))
  );

  // 3. For each split, increment balance + write ledger entry
  for (const split of splits) {
    if (split.amount <= 0) continue;

    // Atomic balance increment via RPC
    const { data: newBalance, error: balanceError } = await supabaseAdmin.rpc('increment_balance', {
      p_user_id: split.userId,
      p_group_id: subscription.group_id,
      p_amount: split.amount,
      p_currency: chargeEvent.currency,
    });

    if (balanceError) {
      console.error('Balance increment failed:', balanceError);
      continue;
    }

    // Write immutable ledger entry
    await supabaseAdmin.from('balance_entries').insert({
      user_id: split.userId,
      group_id: subscription.group_id,
      charge_event_id: chargeEvent.id,
      type: 'charge',
      amount: split.amount,
      balance_after: newBalance,
      description: `${subscription.service_name} — ${new Date(chargeEvent.charged_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`,
    });
  }

  // 4. Mark charge event as processed
  await supabaseAdmin
    .from('charge_events')
    .update({ processed: true })
    .eq('id', chargeEvent.id);

  return splits;
}

export async function recordSettlementBalance(
  payerId: string,
  receiverId: string,
  groupId: string,
  amount: number,
  currency: string,
  settlementId: string
): Promise<void> {
  // Payer's balance decreases (they owed money, now paying it off)
  const { data: payerBalance } = await supabaseAdmin.rpc('increment_balance', {
    p_user_id: payerId,
    p_group_id: groupId,
    p_amount: -amount,
    p_currency: currency,
  });

  await supabaseAdmin.from('balance_entries').insert({
    user_id: payerId,
    group_id: groupId,
    settlement_id: settlementId,
    type: 'settlement',
    amount: -amount,
    balance_after: payerBalance,
    description: `Settled up — paid`,
  });

  // Receiver's balance decreases too (they were owed money, now received it)
  const { data: receiverBalance } = await supabaseAdmin.rpc('increment_balance', {
    p_user_id: receiverId,
    p_group_id: groupId,
    p_amount: amount,
    p_currency: currency,
  });

  await supabaseAdmin.from('balance_entries').insert({
    user_id: receiverId,
    group_id: groupId,
    settlement_id: settlementId,
    type: 'settlement',
    amount: amount,
    balance_after: receiverBalance,
    description: `Settled up — received`,
  });
}

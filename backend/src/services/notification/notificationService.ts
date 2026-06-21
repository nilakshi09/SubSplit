import { supabaseAdmin } from '../../utils/supabase.js';

type NotificationType = 
  | 'charge_detected' 
  | 'payment_reminder' 
  | 'reminder_nudge'
  | 'reminder_final'
  | 'settlement_received'
  | 'settlement_confirmed'
  | 'member_joined'
  | 'price_change'
  | 'monthly_summary';

interface NotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  groupId?: string;
  subscriptionId?: string;
  settlementId?: string;
  actionUrl?: string;
}

export async function createNotification(payload: NotificationPayload): Promise<void> {
  try {
    await supabaseAdmin.from('notifications').insert({
      user_id: payload.userId,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      group_id: payload.groupId || null,
      subscription_id: payload.subscriptionId || null,
      settlement_id: payload.settlementId || null,
      action_url: payload.actionUrl || null,
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}

export async function notifyGroupMembers(
  groupId: string,
  excludeUserId: string,
  payload: Omit<NotificationPayload, 'userId'>
): Promise<void> {
  const { data: members } = await supabaseAdmin
    .from('group_members')
    .select('user_id')
    .eq('group_id', groupId)
    .neq('user_id', excludeUserId);

  if (!members) return;

  for (const member of members) {
    await createNotification({ ...payload, userId: member.user_id });
  }
}

export async function notifyChargeDetected(
  userId: string,
  serviceName: string,
  amount: number,
  currency: string,
  groupId?: string,
  subscriptionId?: string
): Promise<void> {
  const currencySymbol = currency === 'INR' ? '₹' : '$';
  
  await createNotification({
    userId,
    type: 'charge_detected',
    title: `${serviceName} charged`,
    body: `${currencySymbol}${amount.toFixed(2)} detected from ${serviceName}. Balances updated.`,
    groupId,
    subscriptionId,
    actionUrl: groupId ? `/groups/${groupId}` : '/dashboard',
  });

  // Also notify group members if assigned to a group
  if (groupId) {
    await notifyGroupMembers(groupId, userId, {
      type: 'charge_detected',
      title: `${serviceName} charged`,
      body: `${currencySymbol}${amount.toFixed(2)} was charged. Your share has been added to your balance.`,
      groupId,
      subscriptionId,
      actionUrl: `/groups/${groupId}`,
    });
  }
}

export async function notifySettlementReceived(
  receiverId: string,
  payerName: string,
  amount: number,
  currency: string,
  groupId: string,
  settlementId: string
): Promise<void> {
  const currencySymbol = currency === 'INR' ? '₹' : '$';
  
  await createNotification({
    userId: receiverId,
    type: 'settlement_received',
    title: `${payerName} marked as paid`,
    body: `${payerName} says they paid you ${currencySymbol}${amount.toFixed(2)}. Please confirm.`,
    groupId,
    settlementId,
    actionUrl: `/groups/${groupId}`,
  });
}

export async function notifySettlementConfirmed(
  payerId: string,
  receiverName: string,
  amount: number,
  currency: string,
  groupId: string,
  settlementId: string
): Promise<void> {
  const currencySymbol = currency === 'INR' ? '₹' : '$';

  await createNotification({
    userId: payerId,
    type: 'settlement_confirmed',
    title: 'Payment confirmed! ✅',
    body: `${receiverName} confirmed receiving ${currencySymbol}${amount.toFixed(2)}. You're settled up!`,
    groupId,
    settlementId,
    actionUrl: `/groups/${groupId}`,
  });
}

export async function notifyMemberJoined(
  groupId: string,
  newMemberName: string,
  newMemberId: string
): Promise<void> {
  await notifyGroupMembers(groupId, newMemberId, {
    type: 'member_joined',
    title: 'New member joined',
    body: `${newMemberName} joined the group.`,
    groupId,
    actionUrl: `/groups/${groupId}`,
  });
}

export async function sendPaymentReminder(
  userId: string,
  amount: number,
  currency: string,
  groupId: string,
  reminderType: 'payment_reminder' | 'reminder_nudge' | 'reminder_final'
): Promise<void> {
  const currencySymbol = currency === 'INR' ? '₹' : '$';
  
  const messages = {
    payment_reminder: {
      title: 'Payment reminder 💸',
      body: `You owe ${currencySymbol}${amount.toFixed(2)}. Settle up with your group!`,
    },
    reminder_nudge: {
      title: 'Friendly nudge 👋',
      body: `Still owe ${currencySymbol}${amount.toFixed(2)}. Your group is waiting!`,
    },
    reminder_final: {
      title: 'Final notice ⚠️',
      body: `Please settle your ${currencySymbol}${amount.toFixed(2)} balance. Long overdue!`,
    },
  };

  const msg = messages[reminderType];

  await createNotification({
    userId,
    type: reminderType,
    title: msg.title,
    body: msg.body,
    groupId,
    actionUrl: `/groups/${groupId}`,
  });
}

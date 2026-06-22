import cron from 'node-cron';
import { supabaseAdmin } from '../utils/supabase.js';
import { sendPaymentReminder } from '../services/notification/notificationService.js';

/**
 * Runs every hour.
 * Checks for unsettled balances and sends escalating reminders.
 * Day 3 → gentle reminder
 * Day 7 → nudge  
 * Day 14 → final notice
 */
export function startReminderSenderJob(): void {
  cron.schedule('0 * * * *', async () => {
    console.log('🔔 [ReminderSender] Checking unsettled balances...');

    try {
      // Get all positive balances (people who owe money)
      const { data: balances, error } = await supabaseAdmin
        .from('balances')
        .select('user_id, group_id, amount, currency, updated_at')
        .gt('amount', 10); // Only remind for balances > ₹10

      if (error || !balances?.length) {
        console.log('🔔 [ReminderSender] No balances to remind');
        return;
      }

      const now = new Date();

      for (const balance of balances) {
        try {
          const updatedAt = new Date(balance.updated_at);
          const daysSinceUpdate = Math.floor(
            (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24)
          );

          // Check last notification sent for this user+group
          const { data: lastNotif } = await supabaseAdmin
            .from('notifications')
            .select('type, created_at')
            .eq('user_id', balance.user_id)
            .eq('group_id', balance.group_id)
            .in('type', ['payment_reminder', 'reminder_nudge', 'reminder_final'])
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          let reminderType: 'payment_reminder' | 'reminder_nudge' | 'reminder_final' | null = null;

          if (daysSinceUpdate >= 14 && lastNotif?.type !== 'reminder_final') {
            reminderType = 'reminder_final';
          } else if (daysSinceUpdate >= 7 && lastNotif?.type === 'payment_reminder') {
            reminderType = 'reminder_nudge';
          } else if (daysSinceUpdate >= 3 && !lastNotif) {
            reminderType = 'payment_reminder';
          }

          if (reminderType) {
            await sendPaymentReminder(
              balance.user_id,
              balance.amount,
              balance.currency,
              balance.group_id,
              reminderType
            );
            console.log(`🔔 [ReminderSender] Sent ${reminderType} to user ${balance.user_id}`);
          }
        } catch (balanceError) {
          console.error(`🔔 [ReminderSender] Failed for balance:`, balanceError);
        }
      }

      console.log('🔔 [ReminderSender] Reminder cycle complete');
    } catch (error) {
      console.error('🔔 [ReminderSender] Critical error:', error);
    }
  });

  console.log('🔔 [ReminderSender] Job scheduled — runs every hour');
}

import cron from 'node-cron';
import { supabaseAdmin } from '../utils/supabase.js';
import { createNotification } from '../services/notification/notificationService.js';

/**
 * Runs on 1st of every month at 9 AM.
 * Sends monthly summary to all users.
 */
export function startMonthlySummaryJob(): void {
  cron.schedule('0 9 1 * *', async () => {
    console.log('📊 [MonthlySummary] Generating monthly summaries...');

    try {
      // Get all users
      const { data: users, error } = await supabaseAdmin
        .from('users')
        .select('id, name');

      if (error || !users?.length) return;

      for (const user of users) {
        try {
          // Get active subscriptions count and total
          const { data: subs } = await supabaseAdmin
            .from('subscriptions')
            .select('amount, currency')
            .eq('owner_id', user.id)
            .eq('status', 'active');

          // Get total balance
          const { data: balances } = await supabaseAdmin
            .from('balances')
            .select('amount')
            .eq('user_id', user.id)
            .gt('amount', 0);

          const totalSpend = subs?.reduce((sum, s) => sum + s.amount, 0) || 0;
          const totalOwed = balances?.reduce((sum, b) => sum + b.amount, 0) || 0;

          await createNotification({
            userId: user.id,
            type: 'monthly_summary',
            title: '📊 Your monthly summary',
            body: `This month: ₹${totalSpend.toFixed(0)} in subscriptions. ${totalOwed > 0 ? `You owe ₹${totalOwed.toFixed(0)} across groups.` : 'All settled up!'}`,
            actionUrl: '/dashboard',
          });
        } catch (userError) {
          console.error(`📊 [MonthlySummary] Failed for user ${user.id}:`, userError);
        }
      }

      console.log('📊 [MonthlySummary] Summaries sent');
    } catch (error) {
      console.error('📊 [MonthlySummary] Critical error:', error);
    }
  });

  console.log('📊 [MonthlySummary] Job scheduled — runs 1st of month at 9 AM');
}

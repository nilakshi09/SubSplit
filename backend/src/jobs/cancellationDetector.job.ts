import cron from 'node-cron';
import { supabaseAdmin } from '../utils/supabase.js';
import { createNotification } from '../services/notification/notificationService.js';

/**
 * Runs daily at 6 AM.
 * Detects subscriptions that haven't been billed in 2x their expected cycle.
 * Flags them as possibly cancelled.
 */
export function startCancellationDetectorJob(): void {
  cron.schedule('0 6 * * *', async () => {
    console.log('🔍 [CancellationDetector] Checking for cancelled subscriptions...');

    try {
      const { data: subscriptions, error } = await supabaseAdmin
        .from('subscriptions')
        .select('id, owner_id, service_name, frequency, last_charged_at, status')
        .eq('status', 'active')
        .not('last_charged_at', 'is', null);

      if (error || !subscriptions?.length) return;

      const now = new Date();

      const frequencyDays: Record<string, number> = {
        monthly: 30,
        quarterly: 90,
        semi_annual: 180,
        annual: 365,
        unknown: 30,
      };

      for (const sub of subscriptions) {
        const lastCharged = new Date(sub.last_charged_at);
        const expectedDays = frequencyDays[sub.frequency] || 30;
        const daysSinceCharge = Math.floor(
          (now.getTime() - lastCharged.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Flag if 2x overdue
        if (daysSinceCharge > expectedDays * 2) {
          console.log(`🔍 [CancellationDetector] ${sub.service_name} possibly cancelled (${daysSinceCharge} days since last charge)`);

          // Update status to cancelled
          await supabaseAdmin
            .from('subscriptions')
            .update({ status: 'cancelled', updated_at: new Date().toISOString() })
            .eq('id', sub.id);

          // Notify owner
          await createNotification({
            userId: sub.owner_id,
            type: 'price_change',
            title: `${sub.service_name} may have been cancelled`,
            body: `No charge detected in ${daysSinceCharge} days. Check if your subscription is still active.`,
            subscriptionId: sub.id,
            actionUrl: '/subscriptions',
          });
        }
      }

      console.log('🔍 [CancellationDetector] Check complete');
    } catch (error) {
      console.error('🔍 [CancellationDetector] Critical error:', error);
    }
  });

  console.log('🔍 [CancellationDetector] Job scheduled — runs daily at 6 AM');
}

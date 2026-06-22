import cron from 'node-cron';
import { supabaseAdmin } from '../utils/supabase.js';
import { scanInbox } from '../services/gmail/emailIngestion.js';
import { notifyChargeDetected } from '../services/notification/notificationService.js';

/**
 * Runs every 5 minutes.
 * Polls Gmail for users who have gmail_connected=true.
 * Detects new billing emails and processes them.
 */
export function startEmailPollerJob(): void {
  cron.schedule('*/5 * * * *', async () => {
    console.log('📧 [EmailPoller] Starting poll cycle...');
    
    try {
      // Get all users with Gmail connected
      const { data: users, error } = await supabaseAdmin
        .from('users')
        .select('id, email, gmail_connected')
        .eq('gmail_connected', true);

      if (error || !users?.length) {
        console.log('📧 [EmailPoller] No users to poll');
        return;
      }

      console.log(`📧 [EmailPoller] Polling for ${users.length} users`);

      for (const user of users) {
        try {
          const result = await scanInbox(user.id);
          
          if (result.detected.length > 0) {
            console.log(`📧 [EmailPoller] Found ${result.detected.length} new subscriptions for ${user.email}`);
            
            // Notify user about newly detected subscriptions
            for (const detected of result.detected) {
              await notifyChargeDetected(
                user.id,
                detected.serviceName,
                detected.amount,
                detected.currency,
              );
            }
          }
        } catch (userError) {
          console.error(`📧 [EmailPoller] Failed for user ${user.id}:`, userError);
          // Continue with next user
        }
      }
      
      console.log('📧 [EmailPoller] Poll cycle complete');
    } catch (error) {
      console.error('📧 [EmailPoller] Critical error:', error);
    }
  });

  console.log('📧 [EmailPoller] Job scheduled — runs every 5 minutes');
}

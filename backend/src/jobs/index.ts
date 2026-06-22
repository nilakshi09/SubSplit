import { startEmailPollerJob } from './emailPoller.job.js';
import { startReminderSenderJob } from './reminderSender.job.js';
import { startCancellationDetectorJob } from './cancellationDetector.job.js';
import { startMonthlySummaryJob } from './monthlySummary.job.js';

export function initializeJobs(): void {
  console.log('⚙️ Initializing background jobs...');
  
  startEmailPollerJob();
  startReminderSenderJob();
  startCancellationDetectorJob();
  startMonthlySummaryJob();
  
  console.log('✅ All background jobs initialized');
}

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ScanLine } from 'lucide-react';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { SubscriptionCard } from '../subscriptions/SubscriptionCard';
import { Skeleton } from '../ui/Skeleton';
import toast from 'react-hot-toast';

export function PendingReview() {
  const { pending, isScanning, fetchPending, scanInbox, confirmSubscription, dismissSubscription } =
    useSubscriptions();

  useEffect(() => {
    fetchPending();
  }, []);

  const handleScan = async () => {
    try {
      const result = await scanInbox();
      toast.success(`Found ${result.detected} subscription${result.detected !== 1 ? 's' : ''} from ${result.totalProcessed} emails`);
    } catch {
      toast.error('Failed to scan Gmail. Please try again.');
    }
  };

  const handleConfirm = async (id: string) => {
    const sub = pending.find((p) => p.id === id);
    try {
      await confirmSubscription(id);
      toast.success(`${sub?.service_name || 'Subscription'} added!`);
    } catch {
      toast.error('Failed to confirm subscription');
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await dismissSubscription(id);
      toast.success('Subscription dismissed');
    } catch {
      toast.error('Failed to dismiss subscription');
    }
  };

  // Only render the section when there's something to show
  if (pending.length === 0 && !isScanning) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="mb-10"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-[#2D3748]">Pending Review</h2>
          {pending.length > 0 && (
            <span className="bg-teal-500/15 text-[#16a34a] text-xs font-semibold px-2 py-0.5 rounded-full">
              {pending.length}
            </span>
          )}
        </div>
        <button
          onClick={handleScan}
          disabled={isScanning}
          className="flex items-center gap-2 bg-[#4ADE80]/10 border border-[#4ADE80]/50 text-[#16a34a] hover:bg-[#4ADE80]/20 disabled:opacity-50 disabled:cursor-not-allowed px-3.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer"
        >
          {isScanning ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <ScanLine className="w-3.5 h-3.5" />
          )}
          {isScanning ? 'Scanning…' : 'Scan Gmail'}
        </button>
      </div>

      {/* Content */}
      <div className="grid gap-3">
        {isScanning && pending.length === 0 && (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 border border-[#E2E8F0]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="w-28 h-4 rounded" />
                      <Skeleton className="w-16 h-3 rounded" />
                    </div>
                  </div>
                  <Skeleton className="w-20 h-5 rounded" />
                </div>
                <Skeleton className="w-full h-1.5 rounded-full" />
              </div>
            ))}
          </>
        )}

        <AnimatePresence mode="popLayout">
          {pending.map((sub) => (
            <SubscriptionCard
              key={sub.id}
              subscription={sub}
              mode="pending"
              onConfirm={handleConfirm}
              onDismiss={handleDismiss}
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}

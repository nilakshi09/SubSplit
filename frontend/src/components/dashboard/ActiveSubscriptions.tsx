import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard } from 'lucide-react';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { SubscriptionCard } from '../subscriptions/SubscriptionCard';
import { EmptyState } from '../ui/EmptyState';
import { Skeleton } from '../ui/Skeleton';

function formatCurrencyTotal(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
  };
  const symbol = symbols[currency.toUpperCase()] || currency + ' ';
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function ActiveSubscriptions() {
  const { subscriptions, isLoading, fetchSubscriptions } = useSubscriptions();

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const active = subscriptions.filter((s) => s.status === 'active');

  // Compute monthly total — normalize annual/quarterly to monthly
  const monthlyTotal = active.reduce((sum, sub) => {
    const freq = sub.frequency.toLowerCase();
    if (freq === 'annual' || freq === 'yearly') return sum + sub.amount / 12;
    if (freq === 'quarterly') return sum + sub.amount / 3;
    if (freq === 'weekly') return sum + sub.amount * 4.33;
    return sum + sub.amount; // default: monthly
  }, 0);

  // Use the most common currency among active subs, fallback to INR
  const primaryCurrency =
    active.length > 0
      ? active
          .map((s) => s.currency)
          .sort(
            (a, b) =>
              active.filter((s) => s.currency === b).length -
              active.filter((s) => s.currency === a).length
          )[0]
      : 'INR';

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-semibold text-white">Active Subscriptions</h2>
        {active.length > 0 && (
          <span className="bg-emerald-500/15 text-emerald-400 text-xs font-semibold px-2 py-0.5 rounded-full">
            {active.length}
          </span>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="w-32 h-4 rounded" />
                    <Skeleton className="w-16 h-3 rounded" />
                  </div>
                </div>
                <Skeleton className="w-20 h-5 rounded" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="w-24 h-3 rounded" />
                <Skeleton className="w-24 h-3 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && active.length === 0 && (
        <div className="bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden">
          <EmptyState
            icon={<CreditCard className="w-10 h-10" />}
            title="No active subscriptions yet"
            description="Confirm subscriptions from the Pending Review section above to start tracking your spending."
          />
        </div>
      )}

      {/* Subscription grid */}
      {!isLoading && active.length > 0 && (
        <>
          <div className="grid gap-3">
            {active.map((sub) => (
              <SubscriptionCard key={sub.id} subscription={sub} mode="active" />
            ))}
          </div>

          {/* Monthly total */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 bg-[#1a1a1a] rounded-xl p-4 border border-white/10 flex items-center justify-between"
          >
            <span className="text-sm text-gray-400 font-medium">Est. Monthly Total</span>
            <span className="text-xl font-bold text-teal-400">
              {formatCurrencyTotal(monthlyTotal, primaryCurrency)}
              <span className="text-xs text-gray-500 font-normal ml-1">/mo</span>
            </span>
          </motion.div>
        </>
      )}
    </motion.section>
  );
}

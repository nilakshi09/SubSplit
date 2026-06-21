import { motion } from 'framer-motion';
import { Check, X, Calendar, RefreshCw } from 'lucide-react';
import type { Subscription } from '../../stores/subscriptionStore';

interface SubscriptionCardProps {
  subscription: Subscription;
  mode: 'pending' | 'active';
  onConfirm?: (id: string) => void;
  onDismiss?: (id: string) => void;
}

function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
  };
  const symbol = symbols[currency.toUpperCase()] || currency + ' ';
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatFrequency(frequency: string): string {
  const map: Record<string, string> = {
    monthly: 'Monthly',
    annual: 'Yearly',
    yearly: 'Yearly',
    quarterly: 'Every 3 months',
    weekly: 'Weekly',
  };
  return map[frequency.toLowerCase()] || frequency;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function SubscriptionCard({ subscription, mode, onConfirm, onDismiss }: SubscriptionCardProps) {
  const { id, service_name, service_icon, amount, currency, frequency, confidence, last_charged_at, next_expected } =
    subscription;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
      className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10 hover:border-teal-500/30 transition-colors group"
    >
      {/* Top row: icon + name + amount */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-3xl flex-shrink-0" role="img" aria-label={service_name}>
            {service_icon}
          </span>
          <div className="min-w-0">
            <h3 className="text-white font-semibold text-sm truncate">{service_name}</h3>
            <span className="inline-block mt-0.5 text-[11px] font-medium text-gray-400 bg-white/5 px-2 py-0.5 rounded-full">
              {formatFrequency(frequency)}
            </span>
          </div>
        </div>
        <span className="text-teal-400 font-bold text-lg flex-shrink-0 ml-3">
          {formatCurrency(amount, currency)}
        </span>
      </div>

      {/* Pending mode: confidence + actions */}
      {mode === 'pending' && (
        <div className="space-y-3">
          {/* Confidence bar */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-500 font-medium w-20 flex-shrink-0">
              Confidence
            </span>
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.round(confidence * 100)}%` }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className={`h-full rounded-full ${
                  confidence >= 0.8
                    ? 'bg-teal-400'
                    : confidence >= 0.5
                      ? 'bg-amber-400'
                      : 'bg-red-400'
                }`}
              />
            </div>
            <span className="text-[11px] text-gray-500 font-medium w-8 text-right">
              {Math.round(confidence * 100)}%
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onConfirm?.(id)}
              className="flex items-center gap-1.5 bg-teal-500 hover:bg-teal-400 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Confirm
            </button>
            <button
              onClick={() => onDismiss?.(id)}
              className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Active mode: dates */}
      {mode === 'active' && (
        <div className="flex items-center gap-4 text-[11px] text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Last: {formatDate(last_charged_at)}</span>
          </div>
          {next_expected && (
            <div className="flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              <span>Next: {formatDate(next_expected)}</span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

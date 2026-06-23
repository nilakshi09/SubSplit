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
      className="bg-white rounded-xl p-4 border border-[#E2E8F0] hover:border-[#4ADE80]/50 transition-colors group"
    >
      {/* Top row: icon + name + amount */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-3xl flex-shrink-0" role="img" aria-label={service_name}>
            {service_icon}
          </span>
          <div className="min-w-0">
            <h3 className="text-[#2D3748] font-semibold text-sm truncate">{service_name}</h3>
            <span className="inline-block mt-0.5 text-[11px] font-medium text-[#718096] bg-[#F1F5F4] px-2 py-0.5 rounded-full">
              {formatFrequency(frequency)}
            </span>
          </div>
        </div>
        <span className="text-[#16a34a] font-bold text-lg flex-shrink-0 ml-3">
          {formatCurrency(amount, currency)}
        </span>
      </div>

      {/* Pending mode: confidence + actions */}
      {mode === 'pending' && (
        <div className="space-y-3">
          {/* Confidence bar */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#718096] font-medium w-20 flex-shrink-0">
              Confidence
            </span>
            <div className="flex-1 h-1.5 bg-[#F7F7F5] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.round(confidence * 100)}%` }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className={`h-full rounded-full ${
                  confidence >= 0.8
                    ? 'bg-[#4ADE80]'
                    : confidence >= 0.5
                      ? 'bg-amber-400'
                      : 'bg-red-400'
                }`}
              />
            </div>
            <span className="text-[11px] text-[#718096] font-medium w-8 text-right">
              {Math.round(confidence * 100)}%
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onConfirm?.(id)}
              className="flex items-center gap-1.5 bg-[#4ADE80] hover:bg-[#22c55e] text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Confirm
            </button>
            <button
              onClick={() => onDismiss?.(id)}
              className="flex items-center gap-1.5 bg-[#F7F7F5] border border-[#E2E8F0] hover:bg-[#F1F5F4] text-[#718096] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Active mode: dates */}
      {mode === 'active' && (
        <div className="flex items-center gap-4 text-[11px] text-[#718096]">
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

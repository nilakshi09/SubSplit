import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Check, Loader2 } from 'lucide-react';
import { useBalances } from '../../hooks/useBalances';
import toast from 'react-hot-toast';
import { useState } from 'react';

interface SettlementHistoryProps {
  groupId: string;
  currentUserId: string;
}

function formatCurrency(amount: number, currency: string = 'INR'): string {
  const symbols: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
  const symbol = symbols[currency.toUpperCase()] || currency + ' ';
  return `${symbol}${Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  confirmed: { label: 'Confirmed', className: 'bg-green-500/10 text-green-400 border-green-500/20' },
  rejected: { label: 'Rejected', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
  cancelled: { label: 'Cancelled', className: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
};

export function SettlementHistory({ groupId, currentUserId }: SettlementHistoryProps) {
  const { settlements, fetchSettlements, confirmSettlement, fetchGroupBalances, fetchNetSettlement } = useBalances();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSettlements(groupId);
  }, [groupId]);

  const groupSettlements = (settlements[groupId] || [])
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

  const handleConfirm = async (settlementId: string) => {
    setConfirmingId(settlementId);
    try {
      await confirmSettlement(settlementId);
      toast.success('Settlement confirmed!');
      await fetchSettlements(groupId);
      await fetchGroupBalances(groupId);
      await fetchNetSettlement(groupId);
    } catch {
      toast.error('Failed to confirm settlement');
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-white/5">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2">
          <Clock className="w-4 h-4 text-teal-400" />
          Settlement History
        </h3>
      </div>

      {groupSettlements.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center px-4">
          <Clock className="w-8 h-8 text-gray-600 mb-2" />
          <p className="text-gray-400 text-sm font-medium">No settlements yet</p>
          <p className="text-gray-600 text-xs mt-1">Settlements will appear here once created</p>
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {groupSettlements.map((s, i) => {
            const payerName = s.payer?.name || 'Unknown';
            const receiverName = s.receiver?.name || 'Unknown';
            const status = statusConfig[s.status] || statusConfig.pending;
            const canConfirm = s.status === 'pending' && s.receiver_id === currentUserId;

            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="px-5 py-3 flex items-center gap-3 hover:bg-white/[0.02] transition-colors"
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500/15 to-teal-600/5 border border-white/10 flex items-center justify-center text-teal-400 font-semibold text-xs flex-shrink-0">
                  {payerName.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">
                    <span className="font-medium">{payerName}</span>
                    <span className="text-gray-500"> paid </span>
                    <span className="font-medium">{receiverName}</span>
                  </p>
                  <p className="text-gray-500 text-xs">{formatDate(s.created_at)}</p>
                </div>

                {/* Amount */}
                <span className="text-teal-400 font-bold text-sm flex-shrink-0">
                  {formatCurrency(s.amount, s.currency)}
                </span>

                {/* Status Badge */}
                <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${status.className} flex-shrink-0`}>
                  {status.label}
                </span>

                {/* Confirm Button */}
                {canConfirm && (
                  <button
                    onClick={() => handleConfirm(s.id)}
                    disabled={confirmingId !== null}
                    className="flex items-center gap-1 bg-green-500/15 hover:bg-green-500/25 text-green-400 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                  >
                    {confirmingId === s.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Check className="w-3 h-3" />
                    )}
                    Confirm
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

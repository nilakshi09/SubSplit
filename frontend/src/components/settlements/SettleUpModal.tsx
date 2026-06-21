import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Banknote, Smartphone, Wallet } from 'lucide-react';
import { useBalances } from '../../hooks/useBalances';
import toast from 'react-hot-toast';

interface SettleUpModalProps {
  groupId: string;
  members: { userId: string; name: string; amount: number; currency: string }[];
  currentUserId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function formatCurrency(amount: number, currency: string = 'INR'): string {
  const symbols: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
  const symbol = symbols[currency.toUpperCase()] || currency + ' ';
  return `${symbol}${Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

const methods = [
  { key: 'manual', label: 'Manual', icon: Banknote },
  { key: 'upi', label: 'UPI', icon: Smartphone },
  { key: 'cash', label: 'Cash', icon: Wallet },
] as const;

export function SettleUpModal({ groupId, members, currentUserId, onClose, onSuccess }: SettleUpModalProps) {
  const { createSettlement } = useBalances();
  const [method, setMethod] = useState<string>('manual');
  const [note, setNote] = useState('');
  const [settlingId, setSettlingId] = useState<string | null>(null);

  // Members that current user owes money to (positive amount = I owe them)
  const owedMembers = members.filter(m => m.userId !== currentUserId && m.amount > 0);

  const handleSettle = async (member: typeof owedMembers[0]) => {
    setSettlingId(member.userId);
    try {
      await createSettlement({
        receiverId: member.userId,
        groupId,
        amount: member.amount,
        currency: member.currency,
        method,
        note: note.trim() || undefined,
      });
      toast.success(`Settlement sent to ${member.name}!`);
      onSuccess();
      onClose();
    } catch {
      toast.error('Failed to create settlement');
    } finally {
      setSettlingId(null);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.97 }}
          transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
          className="bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-md border border-white/10 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-bold text-xl">Settle Up</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {owedMembers.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-3xl mb-3">🎉</p>
              <p className="text-white font-medium text-lg">You're all settled up!</p>
              <p className="text-gray-500 text-sm mt-1">No outstanding balances</p>
            </div>
          ) : (
            <>
              {/* Payment Method */}
              <div className="mb-5">
                <label className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2 block">
                  Payment Method
                </label>
                <div className="flex gap-2">
                  {methods.map(m => (
                    <button
                      key={m.key}
                      onClick={() => setMethod(m.key)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        method === m.key
                          ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
                          : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
                      }`}
                    >
                      <m.icon className="w-3.5 h-3.5" />
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note Input */}
              <div className="mb-5">
                <input
                  type="text"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Add a note..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-teal-500/50 transition-colors"
                />
              </div>

              {/* Members List */}
              <div className="space-y-2">
                {owedMembers.map((member, i) => (
                  <motion.div
                    key={member.userId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 bg-white/[0.03] rounded-xl p-3 border border-white/5"
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500/20 to-teal-600/10 border border-teal-500/20 flex items-center justify-center text-teal-400 font-semibold text-sm flex-shrink-0">
                      {member.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{member.name}</p>
                      <p className="text-teal-400 text-xs font-semibold">
                        {formatCurrency(member.amount, member.currency)}
                      </p>
                    </div>

                    {/* Settle Button */}
                    <button
                      onClick={() => handleSettle(member)}
                      disabled={settlingId !== null}
                      className="flex items-center gap-1.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {settlingId === member.userId ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : null}
                      Settle {formatCurrency(member.amount, member.currency)}
                    </button>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

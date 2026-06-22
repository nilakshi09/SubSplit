import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Zap, HandCoins } from 'lucide-react';
import { useBalances } from '../../hooks/useBalances';
import { SettleUpModal } from '../settlements/SettleUpModal';

interface GroupBalanceSectionProps {
  groupId: string;
  currentUserId: string;
}

function formatCurrency(amount: number, currency: string = 'INR'): string {
  const symbols: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
  const symbol = symbols[currency.toUpperCase()] || currency + ' ';
  return `${symbol}${Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function GroupBalanceSection({ groupId, currentUserId }: GroupBalanceSectionProps) {
  const { groupBalances, netSettlements, fetchGroupBalances, fetchNetSettlement } = useBalances();
  const [showSettleUp, setShowSettleUp] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchGroupBalances(groupId);
    fetchNetSettlement(groupId);
  }, [groupId]);

  const balances = groupBalances[groupId] || [];
  const nets = netSettlements[groupId] || [];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchGroupBalances(groupId), fetchNetSettlement(groupId)]);
    setIsRefreshing(false);
  };

  const handleSettleSuccess = () => {
    fetchGroupBalances(groupId);
    fetchNetSettlement(groupId);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <HandCoins className="w-4 h-4 text-teal-400" />
            Balances
          </h3>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-gray-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Member Balances */}
        {balances.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center px-4">
            <HandCoins className="w-8 h-8 text-gray-600 mb-2" />
            <p className="text-gray-400 text-sm font-medium">No balance data yet</p>
            <p className="text-gray-600 text-xs mt-1">Simulate a charge to generate balances</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {balances.map((member, i) => {
              const isCurrentUser = member.userId === currentUserId;
              const isOwes = member.amount > 0;
              const isSettled = member.amount === 0;

              return (
                <motion.div
                  key={member.userId}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="px-5 py-3 flex items-center gap-3 hover:bg-white/[0.02] transition-colors"
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                    isCurrentUser
                      ? 'bg-gradient-to-br from-teal-500/30 to-teal-600/15 border border-teal-500/30 text-teal-400'
                      : 'bg-gradient-to-br from-white/10 to-white/5 border border-white/10 text-gray-300'
                  }`}>
                    {member.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${isCurrentUser ? 'text-white font-bold' : 'text-white font-medium'}`}>
                      {member.name}
                      {isCurrentUser && (
                        <span className="text-teal-400 text-xs ml-1.5 font-semibold">(you)</span>
                      )}
                    </p>
                  </div>

                  {/* Amount */}
                  <span className={`text-sm font-bold flex-shrink-0 ${
                    isSettled ? 'text-gray-400' : isOwes ? 'text-orange-400' : 'text-green-400'
                  }`}>
                    {isSettled
                      ? 'Settled'
                      : isOwes
                      ? `Owes ${formatCurrency(member.amount, member.currency)}`
                      : `Gets ${formatCurrency(member.amount, member.currency)}`}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Net Settlements */}
        {nets.length > 0 && (
          <div className="border-t border-white/5">
            <div className="px-5 py-3 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-white text-xs font-semibold">Suggested Settlements</span>
            </div>
            <div className="px-5 pb-3 space-y-1.5">
              {nets.map((net, i) => (
                <motion.div
                  key={`${net.from.userId}-${net.to.userId}`}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i }}
                  className="flex items-center gap-2 text-xs bg-white/[0.03] rounded-lg px-3 py-2"
                >
                  <span className="text-white font-medium">{net.from.name}</span>
                  <span className="text-gray-500">→</span>
                  <span className="text-white font-medium">{net.to.name}</span>
                  <span className="text-gray-500">—</span>
                  <span className="text-teal-400 font-bold">{formatCurrency(net.amount)}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Settle Up Button */}
        {balances.length > 0 && (
          <div className="px-5 pb-4 pt-2">
            <button
              onClick={() => setShowSettleUp(true)}
              className="w-full bg-teal-500 hover:bg-teal-400 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <HandCoins className="w-4 h-4" />
              Settle Up
            </button>
          </div>
        )}
      </motion.div>

      {/* Settle Up Modal */}
      {showSettleUp && (
        <SettleUpModal
          groupId={groupId}
          members={balances.map(b => ({
            userId: b.userId,
            name: b.name,
            amount: b.amount,
            currency: b.currency,
          }))}
          currentUserId={currentUserId}
          onClose={() => setShowSettleUp(false)}
          onSuccess={handleSettleSuccess}
        />
      )}
    </>
  );
}

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { useBalances } from '../../hooks/useBalances';

function formatCurrency(amount: number, currency: string = 'INR'): string {
  const symbols: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
  const symbol = symbols[currency.toUpperCase()] || currency + ' ';
  return `${symbol}${Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function BalanceOverview() {
  const { globalBalance, fetchGlobalBalance } = useBalances();

  useEffect(() => {
    fetchGlobalBalance();
  }, []);

  const allSettled = globalBalance.totalOwed === 0 && globalBalance.totalOwedToMe === 0;

  if (allSettled) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
        className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10 col-span-1 sm:col-span-2 flex items-center justify-center"
      >
        <div className="text-center py-2">
          <p className="text-2xl mb-1">🎉</p>
          <p className="text-teal-400 font-semibold text-lg">All settled up!</p>
          <p className="text-gray-500 text-xs mt-1">No outstanding balances across groups</p>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      {/* You Owe */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0, ease: [0, 0, 0.2, 1] }}
        className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10 hover:border-white/20 transition-colors"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-400">You Owe</span>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500/10 to-orange-500/5 flex items-center justify-center">
            <TrendingDown className="w-4.5 h-4.5 text-orange-400" />
          </div>
        </div>
        <p className="text-3xl font-bold text-orange-400">
          {formatCurrency(globalBalance.totalOwed, globalBalance.currency)}
        </p>
        <p className="text-xs text-gray-500 mt-1">across all groups</p>
      </motion.div>

      {/* Owed to You */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08, ease: [0, 0, 0.2, 1] }}
        className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10 hover:border-white/20 transition-colors"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-400">Owed to You</span>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 flex items-center justify-center">
            <TrendingUp className="w-4.5 h-4.5 text-green-400" />
          </div>
        </div>
        <p className="text-3xl font-bold text-green-400">
          {formatCurrency(globalBalance.totalOwedToMe, globalBalance.currency)}
        </p>
        <p className="text-xs text-gray-500 mt-1">across all groups</p>
      </motion.div>
    </>
  );
}

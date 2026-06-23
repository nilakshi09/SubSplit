import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';

interface PaymentLink {
  method: string;
  url: string;
  label: string;
  icon: string;
}

interface PaymentLinkButtonProps {
  settlementId: string;
  amount: number;
  currency: string;
  receiverName: string;
}

function formatCurrency(amount: number, currency: string = 'INR'): string {
  const symbols: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
  const symbol = symbols[currency.toUpperCase()] || currency + ' ';
  return `${symbol}${Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function PaymentLinkButton({ settlementId, amount, currency, receiverName }: PaymentLinkButtonProps) {
  const [open, setOpen] = useState(false);
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleOpen = async () => {
    setOpen(true);
    setLoading(true);
    setError(false);
    try {
      const data = await api.get<{ links: PaymentLink[] }>(`/api/payments/links/${settlementId}`);
      setLinks(data.links);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={handleOpen}
        className="flex items-center gap-1.5 bg-[#4ADE80] hover:bg-teal-400 text-[#2D3748] text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
      >
        Pay Now
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
              className="bg-white rounded-2xl p-6 w-full max-w-md border border-[#E2E8F0] shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[#2D3748] font-bold text-xl">
                  Pay {receiverName}
                </h2>
                <button
                  onClick={() => setOpen(false)}
                  className="text-[#718096] hover:text-[#2D3748] transition-colors p-1 rounded-lg hover:bg-[#F7F7F5] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Amount */}
              <div className="text-center mb-6">
                <p className="text-3xl font-bold text-[#16a34a]">
                  {formatCurrency(amount, currency)}
                </p>
                <p className="text-[#718096] text-sm mt-1">Amount to pay</p>
              </div>

              {/* Content */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 text-[#16a34a] animate-spin mb-3" />
                  <p className="text-[#718096] text-sm">Loading payment options...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertCircle className="w-8 h-8 text-red-400 mb-3" />
                  <p className="text-[#718096] text-sm font-medium">Failed to load payment options</p>
                  <button
                    onClick={handleOpen}
                    className="text-[#16a34a] hover:text-[#16a34a] text-sm mt-2 cursor-pointer"
                  >
                    Try again
                  </button>
                </div>
              ) : links.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <span className="text-3xl mb-3">💳</span>
                  <p className="text-[#718096] text-sm font-medium">No payment methods set up</p>
                  <p className="text-[#718096] text-xs mt-1 max-w-xs">
                    Ask {receiverName} to add their payment info in Settings
                  </p>
                </div>
              ) : (
                <div className="space-y-2 mb-4">
                  <p className="text-[#718096] text-xs font-medium uppercase tracking-wider mb-3">
                    Payment Options
                  </p>
                  {links.map((link, i) => (
                    <motion.button
                      key={link.method}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => handleOpenLink(link.url)}
                      className="w-full flex items-center gap-3 bg-[#F7F7F5] rounded-xl p-4 hover:bg-[#F1F5F4] cursor-pointer border border-[#E2E8F0] hover:border-white/20 transition-all group"
                    >
                      <span className="text-xl">{link.icon}</span>
                      <span className="flex-1 text-[#2D3748] text-sm font-medium text-left">
                        {link.label}
                      </span>
                      <ExternalLink className="w-4 h-4 text-[#718096] group-hover:text-[#16a34a] transition-colors" />
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Close Button */}
              <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
                <button
                  onClick={() => setOpen(false)}
                  className="w-full py-2.5 text-[#718096] hover:text-[#2D3748] text-sm font-medium transition-colors cursor-pointer rounded-lg hover:bg-[#F7F7F5]"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

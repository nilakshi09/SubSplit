import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';

interface AddSubscriptionFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const EMOJI_OPTIONS = ['🎬', '🎵', '📦', '☁️', '🤖', '💼', '🎨', '📝', '🎯', '💳'];

const CURRENCY_OPTIONS = [
  { value: 'INR', label: 'INR' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
];

const FREQUENCY_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'semi_annual', label: 'Semi-Annual' },
  { value: 'annual', label: 'Annual' },
];

export function AddSubscriptionForm({ onClose, onSuccess }: AddSubscriptionFormProps) {
  const [serviceName, setServiceName] = useState('');
  const [serviceIcon, setServiceIcon] = useState('🎬');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [frequency, setFrequency] = useState('monthly');
  const [billingDay, setBillingDay] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const isNameEmpty = attempted && !serviceName.trim();
  const isAmountEmpty = attempted && !amount;
  const canSubmit = serviceName.trim() && amount && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);

    if (!serviceName.trim() || !amount) return;

    setSubmitting(true);
    try {
      await api.post('/api/subscriptions', {
        service_name: serviceName.trim(),
        service_icon: serviceIcon,
        amount: Number(amount),
        currency,
        frequency,
        billing_day: billingDay ? Number(billingDay) : null,
        status: 'active',
      });
      toast.success('Subscription added!');
      onSuccess();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add subscription');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full bg-white/5 border ${
      hasError ? 'border-red-500/50' : 'border-white/10'
    } rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-teal-500/50 transition-colors`;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#1a1a1a] rounded-xl border border-white/10 p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Add Subscription</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Service Name */}
          <div>
            <label className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1.5 block">
              Service Name
            </label>
            <input
              type="text"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="e.g. Netflix"
              className={inputClass(isNameEmpty)}
            />
          </div>

          {/* Service Icon */}
          <div>
            <label className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1.5 block">
              Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setServiceIcon(emoji)}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg text-lg transition-all ${
                    serviceIcon === emoji
                      ? 'border-teal-500/50 bg-teal-500/10 border'
                      : 'bg-white/5 border border-transparent hover:border-white/10'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1.5 block">
              Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className={inputClass(isAmountEmpty)}
            />
          </div>

          {/* Currency & Frequency row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1.5 block">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={inputClass(false)}
              >
                {CURRENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1.5 block">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className={inputClass(false)}
              >
                {FREQUENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Billing Day */}
          <div>
            <label className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1.5 block">
              Billing Day (optional)
            </label>
            <input
              type="number"
              value={billingDay}
              onChange={(e) => setBillingDay(e.target.value)}
              placeholder="1-31"
              min="1"
              max="31"
              className={inputClass(false)}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="px-5 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? 'Adding...' : 'Add Subscription'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Users, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { Badge } from '../ui/Badge';
import { CurrencyDisplay } from '../ui/CurrencyDisplay';

interface SubscriptionDetailProps {
  subscription: {
    id: string;
    service_name: string;
    service_icon: string;
    amount: number;
    currency: string;
    frequency: string;
    status: string;
    last_charged_at: string | null;
    charge_count: number;
    group_id: string | null;
    billing_day: number | null;
  };
  onClose: () => void;
}

function getStatusVariant(status: string): 'success' | 'warning' | 'gray' {
  switch (status) {
    case 'active':
      return 'success';
    case 'pending':
      return 'warning';
    default:
      return 'gray';
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) return 'th';
  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

function formatFrequency(frequency: string): string {
  switch (frequency) {
    case 'monthly':
      return 'Monthly';
    case 'quarterly':
      return 'Quarterly';
    case 'semi_annual':
      return 'Semi-Annual';
    case 'annual':
      return 'Annual';
    default:
      return frequency;
  }
}

export function SubscriptionDetail({ subscription, onClose }: SubscriptionDetailProps) {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 w-full max-w-md bg-white border-l border-[#E2E8F0] h-full overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg bg-[#F7F7F5] hover:bg-[#F1F5F4] text-[#718096] hover:text-[#2D3748] transition-colors z-10"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="p-6 pb-4">
            <div className="text-5xl mb-3">{subscription.service_icon}</div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-[#2D3748]">{subscription.service_name}</h2>
              <Badge variant={getStatusVariant(subscription.status)}>
                {subscription.status}
              </Badge>
            </div>
          </div>

          {/* Section 1: Billing Info */}
          <div className="bg-[#F7F7F5] rounded-xl p-5 mx-6 mb-4 border border-[#E2E8F0]">
            <h3 className="text-sm font-semibold text-[#718096] mb-4">
              Billing Info
            </h3>

            <div className="mb-4">
              <CurrencyDisplay amount={subscription.amount} currency={subscription.currency} size="xl" color="teal" />
            </div>

            <div className="mb-4">
              <Badge variant="teal" size="md">{formatFrequency(subscription.frequency)}</Badge>
            </div>

            <div className="space-y-2.5">
              <p className="text-sm text-[#718096]">
                {subscription.billing_day
                  ? `Charges on the ${subscription.billing_day}${getOrdinalSuffix(subscription.billing_day)} of each month`
                  : 'No billing day set'}
              </p>
              <p className="text-sm text-[#718096]">
                Last charged: {formatDate(subscription.last_charged_at)}
              </p>
              <p className="text-sm text-[#718096]">
                Total charges: {subscription.charge_count}
              </p>
            </div>
          </div>

          {/* Section 2: Group */}
          <div className="bg-[#F7F7F5] rounded-xl p-5 mx-6 mb-4 border border-[#E2E8F0]">
            <h3 className="text-sm font-semibold text-[#718096] mb-4">
              Group
            </h3>

            {subscription.group_id ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-[#718096]">
                  <Users size={16} className="text-[#16a34a]" />
                  <span>Assigned to a group</span>
                </div>
                <button
                  onClick={() => navigate(`/groups/${subscription.group_id}`)}
                  className="flex items-center gap-2 text-sm text-[#16a34a] hover:text-[#16a34a] font-medium transition-colors"
                >
                  View Group
                  <ExternalLink size={14} />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-[#718096]">Not assigned to a group</p>
                <button
                  onClick={() => toast('Coming soon!', { icon: '🚧' })}
                  className="px-4 py-2 rounded-lg bg-white border border-[#E2E8F0] text-[#2D3748] text-sm font-medium cursor-not-allowed"
                  disabled
                >
                  Assign to Group
                </button>
              </div>
            )}
          </div>

          {/* Section 3: Actions */}
          <div className="bg-[#F7F7F5] rounded-xl p-5 mx-6 mb-4 border border-[#E2E8F0]">
            <h3 className="text-sm font-semibold text-[#718096] mb-4">
              Actions
            </h3>

            <button
              onClick={async () => {
                try {
                  await api.delete(`/api/subscriptions/${subscription.id}`);
                  toast.success('Subscription cancelled');
                  onClose();
                  // Refresh subscriptions list
                  window.location.reload();
                } catch (error) {
                  toast.error('Failed to cancel subscription');
                }
              }}
              className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 text-sm font-medium transition-colors"
            >
              <AlertTriangle size={16} />
              Mark as Cancelled
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

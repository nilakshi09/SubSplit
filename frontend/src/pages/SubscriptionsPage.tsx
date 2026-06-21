import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CreditCard, Filter, Search } from 'lucide-react';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { SubscriptionCard } from '../components/subscriptions/SubscriptionCard';
import { SubscriptionDetail } from '../components/subscriptions/SubscriptionDetail';
import { AddSubscriptionForm } from '../components/subscriptions/AddSubscriptionForm';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { AppHeader } from '../components/layout/AppHeader';
import { PageWrapper } from '../components/layout/PageWrapper';

type FilterTab = 'all' | 'active' | 'pending' | 'archived';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'pending', label: 'Pending' },
  { key: 'archived', label: 'Archived' },
];

const EMPTY_MESSAGES: Record<FilterTab, { title: string; description: string }> = {
  all: { title: 'No subscriptions yet', description: 'Add your first subscription to start tracking your spending.' },
  active: { title: 'No active subscriptions', description: 'Your active subscriptions will appear here.' },
  pending: { title: 'No pending subscriptions', description: 'Detected subscriptions awaiting confirmation will appear here.' },
  archived: { title: 'No archived subscriptions', description: 'Cancelled or archived subscriptions will appear here.' },
};

function getCurrencySymbol(currency: string): string {
  switch (currency) {
    case 'INR': return '₹';
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    default: return currency;
  }
}

export function SubscriptionsPage() {
  const { subscriptions, isLoading: loading, fetchSubscriptions } = useSubscriptions();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [selectedSubscription, setSelectedSubscription] = useState<any | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const filteredSubscriptions = subscriptions.filter((sub: any) => {
    switch (activeFilter) {
      case 'active':
        return sub.status === 'active';
      case 'pending':
        return sub.status === 'pending';
      case 'archived':
        return sub.status === 'archived' || sub.status === 'cancelled';
      default:
        return true;
    }
  });

  const activeSubscriptions = subscriptions.filter((sub: any) => sub.status === 'active');
  const totalMonthlySpend = activeSubscriptions.reduce((sum: number, sub: any) => sum + sub.amount, 0);
  const primaryCurrency = activeSubscriptions.length > 0 ? activeSubscriptions[0].currency : 'INR';

  return (
    <PageWrapper>
      <div className="min-h-screen bg-[#0f0f0f]">
        <AppHeader />

        <main className="max-w-6xl mx-auto px-6 py-8 pb-20 md:pb-8">
        {/* Header row */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">My Subscriptions</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={16} />
            Add Subscription
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto whitespace-nowrap pb-2">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeFilter === tab.key
                  ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Summary bar */}
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10 mb-6 flex items-center gap-6">
          <div>
            <p className="text-gray-400 text-xs">Total Monthly Spend</p>
            <p className="text-white font-semibold">
              {getCurrencySymbol(primaryCurrency)}{totalMonthlySpend.toFixed(2)}
            </p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <p className="text-gray-400 text-xs">Active</p>
            <p className="text-white font-semibold">{activeSubscriptions.length}</p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <EmptyState
            icon={<CreditCard className="w-10 h-10" />}
            title={EMPTY_MESSAGES[activeFilter].title}
            description={EMPTY_MESSAGES[activeFilter].description}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSubscriptions.map((sub: any, index: number) => (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => setSelectedSubscription(sub)}
                className="cursor-pointer"
              >
                <SubscriptionCard
                  subscription={sub}
                  mode={sub.status === 'pending' ? 'pending' : 'active'}
                />
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Detail slide-over */}
      <AnimatePresence>
        {selectedSubscription && (
          <SubscriptionDetail
            subscription={{
              ...selectedSubscription,
              group_id: selectedSubscription.group_id ?? null,
              billing_day: selectedSubscription.billing_day ?? null,
            }}
            onClose={() => setSelectedSubscription(null)}
          />
        )}
      </AnimatePresence>

      {/* Add form modal */}
      <AnimatePresence>
        {showAddForm && (
          <AddSubscriptionForm
            onClose={() => setShowAddForm(false)}
            onSuccess={() => {
              setShowAddForm(false);
              fetchSubscriptions();
            }}
          />
        )}
      </AnimatePresence>
      </div>
    </PageWrapper>
  );
}

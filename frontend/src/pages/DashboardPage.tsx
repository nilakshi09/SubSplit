import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import {
  CreditCard,
  TrendingUp,
  Clock,
  ScanLine,
  Loader2,
  Users,
  Plus,
  Bell,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { useBalances } from '../hooks/useBalances';
import { useNotifications } from '../hooks/useNotifications';
import { useGroups } from '../hooks/useGroups';
import { PendingReview } from '../components/dashboard/PendingReview';
import { ActiveSubscriptions } from '../components/dashboard/ActiveSubscriptions';
import { BalanceOverview } from '../components/dashboard/BalanceOverview';
import { StatCard } from '../components/ui/StatCard';
import { GroupCard } from '../components/groups/GroupCard';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { AddSubscriptionForm } from '../components/subscriptions/AddSubscriptionForm';
import { AppHeader } from '../components/layout/AppHeader';
import { PageWrapper } from '../components/layout/PageWrapper';
import toast from 'react-hot-toast';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  return 'evening';
}

function formatStatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
  };
  const symbol = symbols[currency.toUpperCase()] || currency + ' ';
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const greeting = getGreeting();
  const { subscriptions, pending, isScanning, scanInbox, fetchSubscriptions, fetchPending } =
    useSubscriptions();
  const { fetchGlobalBalance } = useBalances();
  const { notifications, fetchNotifications } = useNotifications();
  const { groups, isLoading: groupsLoading, fetchGroups } = useGroups();
  const [showAddSub, setShowAddSub] = useState(false);

  useEffect(() => {
    const seedAndFetch = async () => {
      try {
        const subData = await api.get<{ subscriptions: { service_name: string; amount: number; [key: string]: unknown }[] }>('/api/subscriptions');
        if (subData.subscriptions.length === 0) {
          const demoSubscriptions = [
            { service_name: 'Netflix', service_icon: '🎬', amount: 649, currency: 'INR', frequency: 'monthly', status: 'active' },
            { service_name: 'Spotify', service_icon: '🎵', amount: 119, currency: 'INR', frequency: 'monthly', status: 'active' },
            { service_name: 'ChatGPT Plus', service_icon: '🤖', amount: 1699, currency: 'INR', frequency: 'monthly', status: 'active' },
            { service_name: 'YouTube Premium', service_icon: '▶️', amount: 189, currency: 'INR', frequency: 'monthly', status: 'active' },
            { service_name: 'Amazon Prime', service_icon: '📦', amount: 299, currency: 'INR', frequency: 'monthly', status: 'active' },
          ];

          for (const sub of demoSubscriptions) {
            await api.post('/api/subscriptions', sub);
          }
        }
      } catch (error) {
        console.error('Failed to seed demo data', error);
      } finally {
        fetchSubscriptions();
        fetchPending();
        fetchGlobalBalance();
        fetchNotifications();
        fetchGroups();
      }
    };

    seedAndFetch();
  }, []);

  const active = subscriptions.filter((s) => s.status === 'active');
  const hasNoData = active.length === 0 && pending.length === 0;
  
  const isDemoMode = active.some(s => s.service_name === 'Netflix' && s.amount === 649) || 
                     active.some(s => s.service_name === 'ChatGPT Plus' && s.amount === 1699);

  // Monthly spend calculation
  const monthlySpend = active.reduce((sum, sub) => {
    const freq = sub.frequency.toLowerCase();
    if (freq === 'annual' || freq === 'yearly') return sum + sub.amount / 12;
    if (freq === 'quarterly') return sum + sub.amount / 3;
    if (freq === 'weekly') return sum + sub.amount * 4.33;
    return sum + sub.amount;
  }, 0);

  const primaryCurrency =
    active.length > 0
      ? active
          .map((s) => s.currency)
          .sort(
            (a, b) =>
              active.filter((s) => s.currency === b).length -
              active.filter((s) => s.currency === a).length
          )[0]
      : 'INR';

  const recentNotifications = notifications.slice(0, 5);

  return (
    <PageWrapper>
      <div className="min-h-screen bg-[#0f0f0f]">
        <AppHeader />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8 pb-20 md:pb-8">
        {/* Greeting */}
        <div className="flex items-center justify-between mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-2xl font-bold text-white"
          >
            Good {greeting}, {user?.name?.split(' ')[0]} 👋
            {isDemoMode && (
              <span className="ml-3 px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 align-middle">
                Demo Mode
              </span>
            )}
          </motion.h1>
          {hasNoData && (
            <button
              onClick={async () => {
                try {
                  const result = await scanInbox();
                  toast.success(`Found ${result.detected} subscription${result.detected !== 1 ? 's' : ''}!`);
                } catch {
                  toast.error('Failed to scan Gmail.');
                }
              }}
              disabled={isScanning}
              className="flex items-center gap-1.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              {isScanning ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ScanLine className="w-3.5 h-3.5" />
              )}
              {isScanning ? 'Scanning…' : 'Scan Gmail'}
            </button>
          )}
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {/* Balance Overview — You Owe + Owed to You */}
          <BalanceOverview />

          <StatCard
            title="Active Subscriptions"
            value={active.length > 0 ? active.length : '—'}
            icon={<CreditCard className="w-5 h-5" />}
            color="teal"
          />
          <StatCard
            title="Monthly Spend"
            value={active.length > 0 ? formatStatCurrency(monthlySpend, primaryCurrency) : '—'}
            icon={<TrendingUp className="w-5 h-5" />}
            color="teal"
          />
          <StatCard
            title="Pending Review"
            value={pending.length > 0 ? pending.length : '—'}
            icon={<Clock className="w-5 h-5" />}
            color={pending.length > 0 ? 'orange' : 'default'}
          />
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          <button
            onClick={async () => {
              try {
                const result = await scanInbox();
                toast.success(`Found ${result.detected} subscription${result.detected !== 1 ? 's' : ''}!`);
              } catch {
                toast.error('Failed to scan Gmail.');
              }
            }}
            disabled={isScanning}
            className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10 hover:border-teal-500/30 transition-all cursor-pointer flex items-center gap-3 text-left disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0">
              <ScanLine className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Scan Gmail</p>
              <p className="text-xs text-gray-500">Auto-detect subscriptions</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/groups')}
            className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10 hover:border-teal-500/30 transition-all cursor-pointer flex items-center gap-3 text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Create Group</p>
              <p className="text-xs text-gray-500">Split with friends</p>
            </div>
          </button>

          <button
            onClick={() => setShowAddSub(true)}
            className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10 hover:border-teal-500/30 transition-all cursor-pointer flex items-center gap-3 text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0">
              <Plus className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Add Subscription</p>
              <p className="text-xs text-gray-500">Track manually</p>
            </div>
          </button>
        </motion.div>

        {/* Pending Review */}
        <PendingReview />

        {/* Active Subscriptions */}
        <ActiveSubscriptions />

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10 mb-10"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
            <button
              onClick={() => navigate('/notifications')}
              className="text-teal-400 hover:text-teal-300 text-sm font-medium transition-colors flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentNotifications.length === 0 ? (
            <p className="text-sm text-gray-500">No recent activity</p>
          ) : (
            <div className="space-y-2">
              {recentNotifications.map((notif) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded-lg border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                    <Bell className="w-4 h-4 text-teal-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{notif.title}</p>
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0">{timeAgo(notif.created_at)}</span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Your Groups */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Your Groups</h2>
            <button
              onClick={() => navigate('/groups')}
              className="text-teal-400 hover:text-teal-300 text-sm font-medium transition-colors flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {groupsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : groups.length === 0 ? (
            <EmptyState
              icon={<Users className="w-10 h-10" />}
              title="No groups yet"
              description="Create or join a group to start splitting subscriptions"
              action={{ label: 'Create Group', onClick: () => navigate('/groups') }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.slice(0, 4).map((group) => (
                <GroupCard key={group.id} group={group} onClick={() => navigate(`/groups/${group.id}`)} />
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {/* Add Subscription Modal */}
      {showAddSub && (
        <AddSubscriptionForm
          onClose={() => setShowAddSub(false)}
          onSuccess={() => {
            setShowAddSub(false);
            fetchSubscriptions();
          }}
        />
      )}
      </div>
    </PageWrapper>
  );
}

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  UserPlus,
  Trash2,
  LogOut,
  CreditCard,
  Loader2,
  AlertTriangle,
  Users,
  Hash,
} from 'lucide-react';
import { useGroups } from '../hooks/useGroups';
import { useAuth } from '../hooks/useAuth';
import { useBalances } from '../hooks/useBalances';
import { MemberList } from '../components/groups/MemberList';
import { InviteModal } from '../components/groups/InviteModal';
import { GroupBalanceSection } from '../components/groups/GroupBalanceSection';
import { SettlementHistory } from '../components/settlements/SettlementHistory';
import { SimulateChargeButton } from '../components/subscriptions/SimulateChargeButton';
import { Skeleton } from '../components/ui/Skeleton';
import { AppHeader } from '../components/layout/AppHeader';
import { PageWrapper } from '../components/layout/PageWrapper';
import toast from 'react-hot-toast';

type TabKey = 'overview' | 'subscriptions' | 'balances' | 'history';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'subscriptions', label: 'Subscriptions' },
  { key: 'balances', label: 'Balances' },
  { key: 'history', label: 'History' },
];

export function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentGroup, isLoading, fetchGroup, deleteGroup, leaveGroup, removeMember } = useGroups();
  const { fetchGroupBalances, fetchNetSettlement } = useBalances();
  const { user } = useAuth();

  const [showInvite, setShowInvite] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  useEffect(() => {
    if (id) {
      fetchGroup(id);
      fetchGroupBalances(id);
      fetchNetSettlement(id);
    }
  }, [id]);

  const isAdmin = currentGroup?.members?.some(
    (m) => m.userId === user?.id && m.role === 'admin'
  ) ?? false;

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await deleteGroup(id);
      toast.success('Group deleted');
      navigate('/groups');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete group');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleLeave = async () => {
    if (!id) return;
    setIsLeaving(true);
    try {
      await leaveGroup(id);
      toast.success('Left the group');
      navigate('/groups');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to leave group');
    } finally {
      setIsLeaving(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!id) return;
    try {
      await removeMember(id, userId);
      toast.success('Member removed');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to remove member');
    }
  };

  // Loading skeleton
  if (isLoading && !currentGroup) {
    return (
      <PageWrapper>
        <div className="min-h-screen bg-[#0f0f0f]">
          <AppHeader />
          <main className="max-w-6xl mx-auto px-6 py-8 pb-20 md:pb-8">
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="w-16 h-16 rounded-xl" />
            <div>
              <Skeleton className="h-7 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
            <div>
              <Skeleton className="h-80 w-full rounded-xl" />
            </div>
          </div>
        </main>
        </div>
      </PageWrapper>
    );
  }

  if (!currentGroup) {
    return (
      <PageWrapper>
        <div className="min-h-screen bg-[#0f0f0f]">
          <AppHeader />
          <div className="flex items-center justify-center pb-20 md:pb-8" style={{ minHeight: 'calc(100vh - 73px)' }}>
          <div className="text-center">
            <p className="text-gray-400 text-lg mb-4">Group not found</p>
            <button
              onClick={() => navigate('/groups')}
              className="text-teal-400 hover:text-teal-300 text-sm font-medium transition-colors cursor-pointer"
            >
              ← Back to Groups
            </button>
          </div>
        </div>
        </div>
      </PageWrapper>
    );
  }

  // Calculate group stats
  const totalMonthly = (currentGroup.subscriptions || [])
    .filter((s: any) => s.status === 'active' || !s.status)
    .reduce((sum: number, s: any) => sum + (s.amount || 0), 0);
  const memberCount = currentGroup.members?.length ?? 0;
  const subscriptionCount = currentGroup.subscriptions?.length ?? 0;

  // Subscription list renderer (used in overview and subscriptions tabs)
  const renderSubscriptionList = () => (
    <>
      {currentGroup.subscriptions?.length > 0 ? (
        <div className="divide-y divide-white/5">
          {currentGroup.subscriptions.map((sub: any) => (
            <div key={sub.id} className="hover:bg-white/[0.02] transition-colors">
              <div className="px-5 py-3 flex items-center gap-3">
                <span className="text-2xl flex-shrink-0">
                  {sub.service_icon || '💳'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {sub.service_name || sub.name}
                  </p>
                  {sub.split_type && (
                    <p className="text-gray-500 text-xs">
                      Split: {sub.split_type === 'equal' ? 'Equal' : 'Custom'}
                    </p>
                  )}
                </div>
                <span className="text-teal-400 font-bold text-sm flex-shrink-0">
                  {sub.currency === 'INR' ? '₹' : sub.currency === 'USD' ? '$' : sub.currency + ' '}
                  {sub.amount?.toLocaleString?.(undefined, { minimumFractionDigits: 2 }) ?? '—'}
                </span>
              </div>
              <div className="px-5 pb-2 pl-14">
                <SimulateChargeButton
                  subscriptionId={sub.id}
                  groupId={sub.group_id || id || null}
                  onCharged={() => {
                    if (id) {
                      fetchGroupBalances(id);
                      fetchNetSettlement(id);
                    }
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center px-4">
          <CreditCard className="w-10 h-10 text-gray-600 mb-3" />
          <p className="text-gray-400 text-sm font-medium mb-1">No subscriptions assigned yet</p>
          <p className="text-gray-600 text-xs">
            Assign subscriptions to this group to start splitting costs
          </p>
        </div>
      )}
    </>
  );

  // Admin settings panel
  const renderAdminSettings = () => {
    if (!isAdmin) return null;
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[#1a1a1a] rounded-xl border border-white/10 p-5"
      >
        <h3 className="text-white font-semibold text-sm mb-4">Group Settings</h3>

        {showDeleteConfirm ? (
          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-400 text-sm font-medium mb-2">
              <AlertTriangle className="w-4 h-4" />
              Delete this group?
            </div>
            <p className="text-gray-500 text-xs mb-3">
              This action cannot be undone. All members will be removed.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-1.5 bg-red-500 hover:bg-red-400 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                {isDeleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-gray-500 hover:text-gray-300 text-xs font-medium px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/15 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Delete Group
          </button>
        )}
      </motion.div>
    );
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-[#0f0f0f]">
        <AppHeader />

      {/* Group Action Bar */}
      <div className="max-w-6xl mx-auto px-6 pt-6 flex items-center justify-between">
        <button
          onClick={() => navigate('/groups')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Groups
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-1.5 bg-teal-500 hover:bg-teal-400 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Invite
          </button>
          {!isAdmin && (
            <button
              onClick={handleLeave}
              disabled={isLeaving}
              className="flex items-center gap-1.5 text-gray-500 hover:text-red-400 text-sm font-medium px-3 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isLeaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
              Leave
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8 pb-20 md:pb-8">
        {/* Group header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-4 mb-6"
        >
          <div className="w-16 h-16 rounded-xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center text-4xl flex-shrink-0">
            {currentGroup.emoji}
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-white mb-1">{currentGroup.name}</h1>
            {currentGroup.description && (
              <p className="text-gray-400 text-sm mb-2">{currentGroup.description}</p>
            )}
          </div>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10 flex items-center gap-6 mb-6 flex-wrap"
        >
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-teal-400" />
            <div>
              <p className="text-xs text-gray-400">Monthly Spend</p>
              <p className="text-sm font-semibold text-white">
                ₹{totalMonthly.toLocaleString(undefined, { minimumFractionDigits: 0 })}
              </p>
            </div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-400" />
            <div>
              <p className="text-xs text-gray-400">Members</p>
              <p className="text-sm font-semibold text-white">{memberCount}</p>
            </div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-teal-400" />
            <div>
              <p className="text-xs text-gray-400">Subscriptions</p>
              <p className="text-sm font-semibold text-white">{subscriptionCount}</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Subscriptions */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden"
              >
                <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-teal-400" />
                    Subscriptions
                  </h3>
                </div>
                {renderSubscriptionList()}
              </motion.div>
            </div>

            {/* Right: Members + Balances + Admin Settings */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <MemberList
                  members={currentGroup.members || []}
                  currentUserId={user?.id || ''}
                  isAdmin={isAdmin}
                  groupId={currentGroup.id}
                  groupName={currentGroup.name}
                  inviteCode={currentGroup.inviteCode}
                  onRemove={handleRemoveMember}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <GroupBalanceSection
                  groupId={currentGroup.id}
                  currentUserId={user?.id || ''}
                />
              </motion.div>

              {renderAdminSettings()}
            </div>
          </div>
        )}

        {activeTab === 'subscriptions' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-white/5">
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-teal-400" />
                All Subscriptions
              </h3>
            </div>
            {renderSubscriptionList()}
          </motion.div>
        )}

        {activeTab === 'balances' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <GroupBalanceSection
              groupId={currentGroup.id}
              currentUserId={user?.id || ''}
            />
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <SettlementHistory
              groupId={currentGroup.id}
              currentUserId={user?.id || ''}
            />
          </motion.div>
        )}
      </main>

      {/* Invite Modal */}
      {showInvite && (
        <InviteModal
          groupId={currentGroup.id}
          groupName={currentGroup.name}
          inviteCode={currentGroup.inviteCode}
          onClose={() => setShowInvite(false)}
        />
      )}
      </div>
    </PageWrapper>
  );
}

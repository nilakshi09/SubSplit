import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Users } from 'lucide-react';
import { useGroups } from '../hooks/useGroups';
import { GroupCard } from '../components/groups/GroupCard';
import { CreateGroupForm } from '../components/groups/CreateGroupForm';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { AppHeader } from '../components/layout/AppHeader';
import { PageWrapper } from '../components/layout/PageWrapper';

export function GroupsPage() {
  const navigate = useNavigate();
  const { groups, isLoading, fetchGroups } = useGroups();
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <PageWrapper>
      <div className="min-h-screen bg-[#F7F7F5]">
        <AppHeader />

      {/* Page Title Row */}
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-[#2D3748]">My Groups</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-[#4ADE80] hover:bg-teal-400 text-[#2D3748] text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Group
        </button>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8 pb-20 md:pb-8">
        {/* Loading state */}
        {isLoading && groups.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-[#E2E8F0]">
                <div className="flex items-center gap-3 mb-3">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-4 w-full mb-3" />
                <div className="flex gap-4">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && groups.length === 0 && (
          <EmptyState
            icon={<Users className="w-10 h-10" />}
            title="No groups yet"
            description="Create a group and invite your friends to start splitting subscriptions"
            action={{
              label: 'Create First Group',
              onClick: () => setShowCreate(true),
            }}
          />
        )}

        {/* Groups grid */}
        {groups.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                onClick={() => navigate(`/groups/${group.id}`)}
              />
            ))}
          </motion.div>
        )}
      </main>

      {/* Create Group Modal */}
      {showCreate && (
        <CreateGroupForm
          onClose={() => setShowCreate(false)}
          onSuccess={(group) => {
            setShowCreate(false);
            navigate(`/groups/${group.id}`);
          }}
        />
      )}
      </div>
    </PageWrapper>
  );
}

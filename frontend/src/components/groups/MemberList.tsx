import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, UserPlus, Shield, Crown } from 'lucide-react';
import { InviteModal } from './InviteModal';
import type { GroupMember } from '../../stores/groupStore';

interface MemberListProps {
  members: GroupMember[];
  currentUserId: string;
  isAdmin: boolean;
  groupId: string;
  groupName: string;
  inviteCode?: string;
  onRemove: (userId: string) => void;
}

export function MemberList({
  members,
  currentUserId,
  isAdmin,
  groupId,
  groupName,
  inviteCode,
  onRemove,
}: MemberListProps) {
  const [showInvite, setShowInvite] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  return (
    <>
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <h3 className="text-[#2D3748] font-semibold text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#16a34a]" />
            Members ({members.length})
          </h3>
        </div>

        {/* Member list */}
        <div className="divide-y divide-white/5">
          {members.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
              className="px-5 py-3 flex items-center gap-3 hover:bg-white/[0.02] transition-colors group"
            >
              {/* Avatar */}
              {member.avatarUrl ? (
                <img
                  src={member.avatarUrl}
                  alt={member.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-white/10 flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#4ADE80]/20 flex items-center justify-center text-[#16a34a] text-sm font-semibold flex-shrink-0">
                  {member.name.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Name + email */}
              <div className="flex-1 min-w-0">
                <p className="text-[#2D3748] text-sm font-medium truncate flex items-center gap-1.5">
                  {member.name}
                  {member.userId === currentUserId && (
                    <span className="text-[10px] text-[#718096]">(you)</span>
                  )}
                </p>
                <p className="text-[#718096] text-xs truncate">{member.email}</p>
              </div>

              {/* Role badge */}
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0 ${
                  member.role === 'admin'
                    ? 'bg-teal-500/15 text-[#16a34a]'
                    : 'bg-[#F7F7F5] text-[#718096]'
                }`}
              >
                {member.role === 'admin' ? (
                  <span className="flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    Admin
                  </span>
                ) : (
                  'Member'
                )}
              </span>

              {/* Remove button — only if admin AND not self */}
              {isAdmin && member.userId !== currentUserId && (
                <>
                  {confirmRemove === member.userId ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          onRemove(member.userId);
                          setConfirmRemove(null);
                        }}
                        className="text-[10px] font-medium text-red-400 hover:text-red-300 bg-red-500/10 px-2 py-1 rounded transition-colors cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmRemove(null)}
                        className="text-[10px] font-medium text-[#718096] hover:text-[#718096] px-1 py-1 rounded transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmRemove(member.userId)}
                      className="opacity-0 group-hover:opacity-100 text-[#718096] hover:text-red-400 transition-all cursor-pointer"
                      title="Remove member"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}
            </motion.div>
          ))}
        </div>

        {/* Add Members button */}
        <div className="px-5 py-3 border-t border-[#E2E8F0]">
          <button
            onClick={() => setShowInvite(true)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-[#16a34a] hover:text-[#16a34a] bg-[#4ADE80]/10 hover:bg-teal-500/15 transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Add Members
          </button>
        </div>
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <InviteModal
          groupId={groupId}
          groupName={groupName}
          inviteCode={inviteCode}
          onClose={() => setShowInvite(false)}
        />
      )}
    </>
  );
}

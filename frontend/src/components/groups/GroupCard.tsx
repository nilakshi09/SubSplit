import { motion } from 'framer-motion';

interface GroupCardProps {
  group: {
    id: string;
    name: string;
    emoji: string;
    description: string | null;
    memberCount?: number;
    subscriptionCount?: number;
  };
  onClick: () => void;
}

export function GroupCard({ group, onClick }: GroupCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
      onClick={onClick}
      className="bg-white rounded-xl p-5 border border-[#E2E8F0] hover:border-[#4ADE80]/50 hover:scale-[1.01] transition-all duration-200 cursor-pointer group"
    >
      {/* Top: emoji + name */}
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl flex-shrink-0">{group.emoji}</span>
        <h3 className="text-[#2D3748] font-semibold text-lg truncate">{group.name}</h3>
      </div>

      {/* Description */}
      {group.description && (
        <p className="text-[#718096] text-sm mb-3 line-clamp-2">{group.description}</p>
      )}

      {/* Bottom row: member count + subscription count */}
      <div className="flex items-center gap-4 mt-auto pt-2">
        <span className="text-[#718096] text-xs flex items-center gap-1">
          👥 {group.memberCount ?? 0} member{(group.memberCount ?? 0) !== 1 ? 's' : ''}
        </span>
        <span className="text-[#718096] text-xs flex items-center gap-1">
          💳 {group.subscriptionCount ?? 0} subscription{(group.subscriptionCount ?? 0) !== 1 ? 's' : ''}
        </span>
      </div>
    </motion.div>
  );
}

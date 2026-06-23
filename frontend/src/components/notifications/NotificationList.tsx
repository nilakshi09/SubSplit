import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, CheckCheck, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { EmptyState } from '../ui/EmptyState';

const typeIcons: Record<string, string> = {
  charge_detected: '⚡',
  payment_reminder: '💸',
  reminder_nudge: '👋',
  reminder_final: '⚠️',
  settlement_received: '🤝',
  settlement_confirmed: '✅',
  member_joined: '👥',
  price_change: '📈',
  monthly_summary: '📊',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getDateGroup(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  if (date >= today) return 'Today';
  if (date >= yesterday) return 'Yesterday';
  if (date >= weekAgo) return 'This week';
  return 'Older';
}

type Notification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  group_id: string | null;
  subscription_id: string | null;
  settlement_id: string | null;
  read_at: string | null;
  action_url: string | null;
  created_at: string;
};

function groupByDate(notifications: Notification[]): Record<string, Notification[]> {
  const groups: Record<string, Notification[]> = {};
  const order = ['Today', 'Yesterday', 'This week', 'Older'];

  for (const n of notifications) {
    const group = getDateGroup(n.created_at);
    if (!groups[group]) groups[group] = [];
    groups[group].push(n);
  }

  // Return in order
  const ordered: Record<string, Notification[]> = {};
  for (const key of order) {
    if (groups[key]) ordered[key] = groups[key];
  }
  return ordered;
}

export function NotificationList() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const grouped = groupByDate(notifications);

  const handleClick = async (n: Notification) => {
    if (!n.read_at) {
      await markAsRead(n.id);
    }
    if (n.action_url) {
      navigate(n.action_url);
    }
  };

  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={<Bell className="w-10 h-10" />}
        title="No notifications"
        description="You're all caught up! Notifications about charges, payments, and group activity will appear here."
      />
    );
  }

  let itemIndex = 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[#2D3748]">All Notifications</h1>
          {unreadCount > 0 && (
            <span className="px-2.5 py-0.5 bg-teal-500/15 text-[#16a34a] text-xs font-semibold rounded-full">
              {unreadCount} unread
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="flex items-center gap-1.5 text-[#16a34a] hover:text-[#16a34a] text-sm font-medium transition-colors cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {/* Grouped List */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([group, items]) => (
          <div key={group}>
            <h2 className="text-xs font-semibold text-[#718096] uppercase tracking-wider mb-3 px-1">
              {group}
            </h2>
            <div className="space-y-2">
              {items.map((n) => {
                const idx = itemIndex++;
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.04, 0.5), duration: 0.3 }}
                    onClick={() => handleClick(n)}
                    className={`rounded-xl p-4 border cursor-pointer transition-all hover:border-white/20 ${
                      !n.read_at
                        ? 'border-[#4ADE80]/50 bg-teal-500/5'
                        : 'border-[#E2E8F0] bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Type Icon */}
                      <span className="text-2xl flex-shrink-0">
                        {typeIcons[n.type] || '🔔'}
                      </span>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[#2D3748] text-sm font-medium leading-tight">
                          {n.title}
                        </p>
                        <p className="text-[#718096] text-sm mt-1">
                          {n.body}
                        </p>
                        <div className="flex items-center gap-3 mt-2.5">
                          <span className="text-[#718096] text-xs">
                            {timeAgo(n.created_at)}
                          </span>
                          {n.action_url && (
                            <span className="text-[#16a34a] text-xs font-medium hover:text-[#16a34a] transition-colors">
                              View details →
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(n.id);
                        }}
                        className="p-1.5 text-[#718096] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer rounded-lg flex-shrink-0"
                        aria-label="Delete notification"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

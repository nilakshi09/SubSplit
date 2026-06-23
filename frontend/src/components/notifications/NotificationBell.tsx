import { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';

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

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  // Fetch on mount + poll every 30s
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Click outside to close
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleNotificationClick = async (n: typeof notifications[0]) => {
    if (!n.read_at) {
      await markAsRead(n.id);
    }
    if (n.action_url) {
      navigate(n.action_url);
    }
    setOpen(false);
  };

  const visibleNotifications = notifications.slice(0, 8);

  return (
    <div ref={ref} className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="relative p-2 rounded-lg text-[#718096] hover:text-[#2D3748] hover:bg-[#F7F7F5] transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-[#2D3748] text-xs font-bold rounded-full flex items-center justify-center"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
            className="absolute right-0 top-full mt-2 w-80 bg-white border border-[#E2E8F0] rounded-xl shadow-xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0]">
              <h3 className="text-[#2D3748] font-semibold text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="flex items-center gap-1 text-[#16a34a] hover:text-[#22c55e] text-xs font-medium transition-colors cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto">
              {visibleNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <span className="text-3xl mb-2">🔔</span>
                  <p className="text-[#718096] text-sm">No notifications yet</p>
                </div>
              ) : (
                visibleNotifications.map((n, i) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => handleNotificationClick(n)}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-[#F7F7F5] ${
                      !n.read_at
                        ? 'bg-[#4ADE80]/5 border-l-2 border-[#4ADE80]'
                        : 'bg-transparent border-l-2 border-transparent'
                    }`}
                  >
                    {/* Type Icon */}
                    <span className="text-lg flex-shrink-0 mt-0.5">
                      {typeIcons[n.type] || '🔔'}
                    </span>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[#2D3748] text-sm font-medium leading-tight truncate">
                        {n.title}
                      </p>
                      <p className="text-[#718096] text-xs mt-0.5 line-clamp-2">
                        {n.body}
                      </p>
                    </div>

                    {/* Right: time + delete */}
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-[#718096] text-xs whitespace-nowrap">
                        {timeAgo(n.created_at)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(n.id);
                        }}
                        className="p-0.5 text-[#718096] hover:text-red-400 transition-colors cursor-pointer rounded"
                        aria-label="Delete notification"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-[#E2E8F0]">
                <button
                  onClick={() => {
                    navigate('/notifications');
                    setOpen(false);
                  }}
                  className="w-full px-4 py-3 text-[#16a34a] hover:text-[#22c55e] text-sm font-medium text-center hover:bg-[#F7F7F5] transition-colors cursor-pointer"
                >
                  View all notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

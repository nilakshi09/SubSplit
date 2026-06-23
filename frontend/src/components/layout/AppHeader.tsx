import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LayoutDashboard, Users, LogOut, SplitSquareHorizontal, Settings, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { NotificationBell } from '../notifications/NotificationBell';

const navLinks = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Groups', icon: Users, path: '/groups' },
  { label: 'Subscriptions', icon: CreditCard, path: '/subscriptions' },
  { label: 'Settings', icon: Settings, path: '/settings' },
];

export function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || '?';

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    // /groups should highlight for /groups and /groups/:id
    return location.pathname.startsWith(path);
  };

  return (
    <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left: Logo + Nav */}
        <div className="flex items-center">
          {/* Logo */}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#4ADE80]/10 flex items-center justify-center group-hover:shadow-sm transition-shadow">
              <SplitSquareHorizontal className="w-4 h-4 text-[#4ADE80]" />
            </div>
            <span className="text-lg font-bold text-[#2D3748] tracking-tight">
              SubSplit
            </span>
          </button>

          {/* Nav Links */}
          <nav className="flex items-center gap-6 ml-8">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className="relative flex items-center gap-1.5 cursor-pointer py-1 transition-colors"
                >
                  <link.icon
                    className={`w-4 h-4 transition-colors ${
                      active ? 'text-[#2D3748]' : 'text-[#718096] group-hover:text-[#2D3748]'
                    }`}
                  />
                  <span
                    className={`text-sm font-medium transition-colors ${
                      active
                        ? 'text-[#2D3748]'
                        : 'text-[#718096] hover:text-[#2D3748]'
                    }`}
                  >
                    {link.label}
                  </span>
                  {/* Active underline indicator */}
                  {active && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute -bottom-[19px] left-0 right-0 h-[2px] bg-[#4ADE80] rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Notifications + User + Logout */}
        <div className="flex items-center gap-4">
          <NotificationBell />
          <div className="flex items-center gap-2.5">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-[#E2E8F0]"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#4ADE80]/20 flex items-center justify-center text-[#16a34a] text-sm font-semibold">
                {userInitial}
              </div>
            )}
            <span className="text-sm text-[#718096] font-medium hidden sm:block">
              {user?.name}
            </span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-[#718096] hover:text-[#2D3748] text-sm transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

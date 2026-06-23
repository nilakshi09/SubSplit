import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Bell, Settings } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

export function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useNotifications();

  const tabs = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Groups', icon: Users, path: '/groups' },
    { name: 'Subscriptions', icon: CreditCard, path: '/subscriptions' },
    { name: 'Notifications', icon: Bell, path: '/notifications', badge: unreadCount },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 block md:hidden bg-white border-t border-[#E2E8F0] pb-safe pb-4">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const isActive = location.pathname.startsWith(tab.path);
          const Icon = tab.icon;
          return (
            <button
              key={tab.name}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 relative ${
                isActive ? 'text-[#16a34a]' : 'text-[#718096] hover:text-[#718096]'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {tab.badge ? (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                ) : null}
              </div>
              <span className="text-[10px] font-medium">{tab.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

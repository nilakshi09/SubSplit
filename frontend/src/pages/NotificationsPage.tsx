import { useEffect } from 'react';
import { AppHeader } from '../components/layout/AppHeader';
import { NotificationList } from '../components/notifications/NotificationList';
import { useNotifications } from '../hooks/useNotifications';
import { PageWrapper } from '../components/layout/PageWrapper';

export function NotificationsPage() {
  const { fetchNotifications } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <PageWrapper>
      <div className="min-h-screen bg-[#F7F7F5]">
        <AppHeader />
        <main className="max-w-2xl mx-auto px-6 py-8 pb-20 md:pb-8">
        <NotificationList />
      </main>
      </div>
    </PageWrapper>
  );
}

import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MobileNav } from './components/layout/MobileNav';
import { toastConfig } from './components/ui/Toast';
import { AnimatePresence } from 'framer-motion';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { GroupsPage } from './pages/GroupsPage';
import { GroupDetailPage } from './pages/GroupDetailPage';
import { JoinGroupPage } from './pages/JoinGroupPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';

// Landing page components
import {
  Navbar,
  Hero,
  Problem,
  HowItWorks,
  SubscriptionShowcase,
  EmotionalAnchor,
  Pricing,
  FAQ,
  FinalCTA,
  Footer,
} from './components';

function LandingPage() {
  return (
    <div className="font-inter">
      <Navbar />
      <Hero />
      <Problem />
      <HowItWorks />
      <SubscriptionShowcase />
      <EmotionalAnchor />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}

function AppContent() {
  const fetchUser = useAuthStore(state => state.fetchUser);
  const status = useAuthStore(state => state.status);
  const location = useLocation();
  
  useEffect(() => { fetchUser(); }, []);
  
  const showMobileNav = status === 'authenticated' && 
    location.pathname !== '/' && 
    location.pathname !== '/login';

  return (
    <>
      <Toaster position="top-right" toastOptions={toastConfig} />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/groups" element={<ProtectedRoute><GroupsPage /></ProtectedRoute>} />
          <Route path="/groups/:id" element={<ProtectedRoute><GroupDetailPage /></ProtectedRoute>} />
          <Route path="/subscriptions" element={<ProtectedRoute><SubscriptionsPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/join/:code" element={<JoinGroupPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </AnimatePresence>
      {showMobileNav && <MobileNav />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;

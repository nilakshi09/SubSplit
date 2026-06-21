import { useState, useEffect } from 'react';
import { AppHeader } from '../components/layout/AppHeader';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { CreditCard, Mail, User, Shield, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { PageWrapper } from '../components/layout/PageWrapper';

interface PaymentInfo {
  upi_id: string;
  venmo_handle: string;
  paypal_email: string;
  preferred_method: string;
}

const paymentMethods = [
  { key: 'upi', label: 'UPI' },
  { key: 'venmo', label: 'Venmo' },
  { key: 'paypal', label: 'PayPal' },
] as const;

export function SettingsPage() {
  const { user, logout } = useAuth();

  // Payment info state
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    upi_id: '',
    venmo_handle: '',
    paypal_email: '',
    preferred_method: 'upi',
  });
  const [loadingPayment, setLoadingPayment] = useState(true);
  const [savingPayment, setSavingPayment] = useState(false);

  // Load payment info on mount
  useEffect(() => {
    async function load() {
      try {
        const data = await api.get<{ paymentInfo: PaymentInfo }>('/api/payments/user-payment-info');
        if (data.paymentInfo) {
          setPaymentInfo({
            upi_id: data.paymentInfo.upi_id || '',
            venmo_handle: data.paymentInfo.venmo_handle || '',
            paypal_email: data.paymentInfo.paypal_email || '',
            preferred_method: data.paymentInfo.preferred_method || 'upi',
          });
        }
      } catch {
        // First time user, keep defaults
      } finally {
        setLoadingPayment(false);
      }
    }
    load();
  }, []);

  const savePaymentInfo = async () => {
    setSavingPayment(true);
    try {
      await api.put('/api/payments/user-payment-info', paymentInfo);
      toast.success('Payment info saved!');
    } catch {
      toast.error('Failed to save payment info');
    } finally {
      setSavingPayment(false);
    }
  };

  const revokeGmail = async () => {
    try {
      await api.delete('/api/auth/gmail-access');
      toast.success('Gmail access revoked');
      window.location.reload();
    } catch {
      toast.error('Failed to revoke Gmail access');
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4, ease: [0, 0, 0.2, 1] },
    }),
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-[#0f0f0f]">
        <AppHeader />
        <main className="max-w-2xl mx-auto px-6 py-8 pb-20 md:pb-8">
        <h1 className="text-2xl font-bold text-white mb-8">Settings</h1>

        <div className="space-y-6">
          {/* Profile Section */}
          <motion.div
            custom={0}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-2 mb-5">
              <User className="w-5 h-5 text-teal-400" />
              <h2 className="text-white font-semibold text-lg">Profile</h2>
            </div>
            <div className="flex items-center gap-4">
              <Avatar name={user?.name || 'User'} avatarUrl={user?.avatarUrl} size="lg" className="ring-2 ring-white/10" />
              <div>
                <p className="text-white font-medium text-lg">{user?.name}</p>
                <p className="text-gray-400 text-sm">{user?.email}</p>
                <p className="text-gray-600 text-xs mt-1">Managed by Google account</p>
              </div>
            </div>
          </motion.div>

          {/* Payment Methods Section */}
          <motion.div
            custom={1}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="w-5 h-5 text-teal-400" />
              <h2 className="text-white font-semibold text-lg">Payment Methods</h2>
            </div>
            <p className="text-gray-500 text-sm mb-5">
              Add your payment info so group members can pay you easily
            </p>

            {loadingPayment ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* UPI ID */}
                <div>
                  <label className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1.5 block">
                    UPI ID
                  </label>
                  <input
                    type="text"
                    value={paymentInfo.upi_id}
                    onChange={e => setPaymentInfo(prev => ({ ...prev, upi_id: e.target.value }))}
                    placeholder="yourname@upi"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-teal-500/50 transition-colors"
                  />
                </div>

                {/* Venmo Handle */}
                <div>
                  <label className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1.5 block">
                    Venmo Handle
                  </label>
                  <input
                    type="text"
                    value={paymentInfo.venmo_handle}
                    onChange={e => setPaymentInfo(prev => ({ ...prev, venmo_handle: e.target.value }))}
                    placeholder="@username"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-teal-500/50 transition-colors"
                  />
                </div>

                {/* PayPal Email */}
                <div>
                  <label className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1.5 block">
                    PayPal Email
                  </label>
                  <input
                    type="email"
                    value={paymentInfo.paypal_email}
                    onChange={e => setPaymentInfo(prev => ({ ...prev, paypal_email: e.target.value }))}
                    placeholder="email@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-teal-500/50 transition-colors"
                  />
                </div>

                {/* Preferred Method */}
                <div>
                  <label className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2 block">
                    Preferred Method
                  </label>
                  <div className="flex gap-2">
                    {paymentMethods.map(m => (
                      <button
                        key={m.key}
                        onClick={() => setPaymentInfo(prev => ({ ...prev, preferred_method: m.key }))}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                          paymentInfo.preferred_method === m.key
                            ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
                            : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Save Button */}
                <button
                  onClick={savePaymentInfo}
                  disabled={savingPayment}
                  className="w-full mt-2 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {savingPayment && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Payment Info
                </button>
              </div>
            )}
          </motion.div>

          {/* Gmail Connection Section */}
          <motion.div
            custom={2}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-2 mb-5">
              <Mail className="w-5 h-5 text-teal-400" />
              <h2 className="text-white font-semibold text-lg">Gmail Connection</h2>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {user?.gmailConnected ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm font-medium">Connected</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 text-sm font-medium">Not connected</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => api.auth.googleLogin()}
                className="px-4 py-2 bg-white/5 text-gray-300 hover:text-white text-sm font-medium rounded-lg border border-white/10 hover:border-white/20 transition-all cursor-pointer"
              >
                Reconnect Gmail
              </button>
              {user?.gmailConnected && (
                <button
                  onClick={revokeGmail}
                  className="px-4 py-2 bg-red-500/10 text-red-400 hover:text-red-300 text-sm font-medium rounded-lg border border-red-500/20 hover:border-red-500/30 transition-all cursor-pointer"
                >
                  Revoke Access
                </button>
              )}
            </div>
          </motion.div>

          {/* Account Section */}
          <motion.div
            custom={3}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-2 mb-5">
              <Shield className="w-5 h-5 text-teal-400" />
              <h2 className="text-white font-semibold text-lg">Account</h2>
            </div>

            <button
              onClick={logout}
              className="px-4 py-2.5 bg-red-500/10 text-red-400 hover:text-red-300 text-sm font-semibold rounded-lg border border-red-500/20 hover:border-red-500/30 transition-all cursor-pointer"
            >
              Sign Out
            </button>
          </motion.div>
        </div>
        </main>
      </div>
    </PageWrapper>
  );
}
